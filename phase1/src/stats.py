"""Statistics over the final replicate runs.

Reads results/<source>/final/preds/*.npz (written by run.py --reps) and writes into results/<source>/final/:
  summary.csv      mean and std over replicates of macro F1 and weighted F1 per model / features / split
  delta_time.csv   macro F1 (text + time) minus macro F1 (text), paired bootstrap 95% CI
  delta_shift.csv  macro F1 (temporal_late) minus macro F1 (random_matched), text only, bootstrap 95% CI
  mcnemar.csv      text-only models compared on the same test posts

Bootstrap: resample test posts with replacement (1000 times, paired across the two models being compared),
compute the metric difference for each replicate sample, average over replicates, take the 2.5 and 97.5 percentiles.
It only measures which test posts were drawn, not how much the result moves between replicates.

Replicate interval (rep_*): t interval and t-test over the per-replicate differences, which also counts
run-to-run variation (sample, split, initialisation). rep_p_holm is Holm-corrected over all rows of the table.
reliable: the bootstrap CI excludes 0 and rep_p_holm < 0.05.

python src/stats.py --source kaggle
"""
import argparse
import re
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import chi2, ttest_1samp

ROOT = Path(__file__).resolve().parents[1]
B = 1000


def macro_f1(y, p, k):
    cm = np.bincount(y * k + p, minlength=k * k).reshape(k, k)
    tp = np.diag(cm).astype(float)
    denom = 2 * tp + (cm.sum(0) - tp) + (cm.sum(1) - tp)
    return float(np.mean(np.divide(2 * tp, denom, out=np.zeros(k), where=denom > 0)))


def boot_diff(a, b, k, n_boot=B, seed=0, paired=True):
    """a and b are dicts with y and pred. Returns an array of n_boot differences metric(a) - metric(b)."""
    rng = np.random.default_rng(seed)
    out = np.empty(n_boot)
    for i in range(n_boot):
        ia = rng.integers(0, len(a["y"]), len(a["y"]))
        ib = ia if paired else rng.integers(0, len(b["y"]), len(b["y"]))
        out[i] = macro_f1(a["y"][ia], a["pred"][ia], k) - macro_f1(b["y"][ib], b["pred"][ib], k)
    return out


def rep_interval(deltas):
    """95% t interval and two-sided p-value over per-replicate differences."""
    d = np.asarray(deltas, dtype=float)
    if len(d) < 2 or np.all(d == d[0]):
        return np.nan, np.nan, np.nan, np.nan
    t = ttest_1samp(d, 0)
    ci = t.confidence_interval(0.95)
    return float(d.std(ddof=1)), float(ci.low), float(ci.high), float(t.pvalue)


def holm(p):
    """Holm step-down adjusted p-values. NaN stays NaN and is not counted as a test."""
    p = np.asarray(p, dtype=float)
    out = np.full(len(p), np.nan)
    ok = np.flatnonzero(~np.isnan(p))
    order = ok[np.argsort(p[ok])]
    adj = np.maximum.accumulate((len(ok) - np.arange(len(ok))) * p[order])
    out[order] = np.minimum(adj, 1.0)
    return out


def delta_row(boot, point):
    """Columns shared by delta_time and delta_shift. boot: per-replicate bootstrap arrays, point: per-replicate differences."""
    d = np.mean(boot, axis=0)
    lo, hi = np.percentile(d, 2.5), np.percentile(d, 97.5)
    sd, rlo, rhi, p = rep_interval(point)
    return {"n_reps": len(boot), "delta_macro_f1": d.mean(), "ci_low": lo, "ci_high": hi, "ci_excludes_0": bool(lo > 0 or hi < 0),
            "rep_sd": sd, "rep_ci_low": rlo, "rep_ci_high": rhi, "rep_p": p}


def finish_delta(rows):
    df = pd.DataFrame(rows)
    df["rep_p_holm"] = holm(df.rep_p.values)
    df["reliable"] = df.ci_excludes_0 & (df.rep_p_holm < 0.05)
    return df.round(4)


def mcnemar(a, b):
    """Counts of posts only A gets right (n01) and only B gets right (n10)."""
    ra, rb = a["pred"] == a["y"], b["pred"] == b["y"]
    return int((ra & ~rb).sum()), int((~ra & rb).sum())


def load_preds(pred_dir):
    runs = {}
    for f in pred_dir.glob("*.npz"):
        m = re.match(r"(?P<model>[a-z]+)_(?P<features>.+)_(?P<split>(?:random_matched|random|temporal_late|temporal_2021_22|temporal_1y|temporal))_rep(?P<rep>\d+)\.npz", f.name)
        if m:
            d = np.load(f)
            runs[(m["model"], m["features"], m["split"], int(m["rep"]))] = {"id": d["id"], "y": d["y"], "pred": d["pred"]}
    return runs


def main(source):
    final = ROOT / "results" / source / "final"
    runs = load_preds(final / "preds")
    if not runs:
        raise SystemExit(f"no predictions found in {final / 'preds'}")
    k = int(max(r["y"].max() for r in runs.values())) + 1
    reps = sorted({key[3] for key in runs})

    # 1. mean and std over replicates
    frames = [pd.read_csv(f) for f in final.glob("results*.csv")]
    res = pd.concat(frames)
    res = res[res.model.isin(["tfidf", "bilstm", "roberta"])]
    summary = res.groupby(["model", "features", "split"])[["macro_f1", "weighted_f1", "accuracy", "ece"]].agg(["mean", "std"]).round(4)
    summary.columns = ["_".join(c) for c in summary.columns]
    summary["n_reps"] = res.groupby(["model", "features", "split"]).size()
    summary.to_csv(final / "summary.csv")

    def f1(run):
        return macro_f1(run["y"], run["pred"], k)

    # 2. effect of time features
    # Every replicate uses bootstrap seed 0: temporal_late has the same test posts in every replicate, so all
    # replicates must share one resample or that test set is counted as five independent ones.
    rows = []
    for model in sorted({key[0] for key in runs}):
        pairs = [("text_time", "text"), ("text_time_concat", "text"), ("text_time_nomonth", "text")]
        for split in sorted({key[2] for key in runs}):
            for on, off in pairs:
                both = [(runs[(model, on, split, r)], runs[(model, off, split, r)]) for r in reps if (model, on, split, r) in runs and (model, off, split, r) in runs]
                if both:
                    boot = [boot_diff(a, b, k, seed=0) for a, b in both]
                    rows.append({"model": model, "split": split, "time_variant": on, "vs": off, **delta_row(boot, [f1(a) - f1(b) for a, b in both])})
    finish_delta(rows).to_csv(final / "delta_time.csv", index=False)

    # 3. effect of the later period (matched training size, text only)
    rows = []
    for model in sorted({key[0] for key in runs}):
        both = [(runs[(model, "text", "temporal_late", r)], runs[(model, "text", "random_matched", r)])
                for r in reps if (model, "text", "temporal_late", r) in runs and (model, "text", "random_matched", r) in runs]
        if both:
            boot = [boot_diff(a, b, k, seed=0, paired=False) for a, b in both]
            rows.append({"model": model, **delta_row(boot, [f1(a) - f1(b) for a, b in both])})
    finish_delta(rows).to_csv(final / "delta_shift.csv", index=False)

    # 4. McNemar between text-only models, pooled over replicates
    rows = []
    models = sorted({key[0] for key in runs})
    for split in sorted({key[2] for key in runs}):
        for i, m1 in enumerate(models):
            for m2 in models[i + 1:]:
                n01 = n10 = 0
                for r in reps:
                    ka, kb = (m1, "text", split, r), (m2, "text", split, r)
                    if ka in runs and kb in runs and np.array_equal(runs[ka]["id"], runs[kb]["id"]):
                        a, b = mcnemar(runs[ka], runs[kb])
                        n01, n10 = n01 + a, n10 + b
                if n01 + n10:
                    stat = (abs(n01 - n10) - 1) ** 2 / (n01 + n10)
                    rows.append({"split": split, "model_a": m1, "model_b": m2, "only_a_right": n01, "only_b_right": n10, "chi2": stat, "p_value": chi2.sf(stat, 1)})
    pd.DataFrame(rows).round(6).to_csv(final / "mcnemar.csv", index=False)

    for name in ["summary", "delta_time", "delta_shift", "mcnemar"]:
        print(f"\n== {name}\n", pd.read_csv(final / f"{name}.csv").to_string(index=False))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="kaggle")
    main(ap.parse_args().source)
