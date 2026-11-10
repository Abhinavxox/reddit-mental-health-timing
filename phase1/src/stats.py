"""Statistics over the final replicate runs.

Reads results/<source>/final/preds/*.npz (written by run.py --reps) and writes into results/<source>/final/:
  summary.csv      mean and std over replicates of macro F1 and weighted F1 per model / features / split
  delta_time.csv   macro F1 (text + time) minus macro F1 (text), paired bootstrap 95% CI
  delta_shift.csv  macro F1 (temporal_late) minus macro F1 (random_matched), text only, bootstrap 95% CI
  mcnemar.csv      text-only models compared on the same test posts

Bootstrap: resample test posts with replacement (1000 times, paired across the two models being compared),
compute the metric difference for each replicate sample, average over replicates, take the 2.5 and 97.5 percentiles.

python src/stats.py --source kaggle
"""
import argparse
import re
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import chi2

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

    # 2. effect of time features
    rows = []
    for model in sorted({key[0] for key in runs}):
        pairs = [("text_time", "text"), ("text_time_concat", "text"), ("text_time_nomonth", "text")]
        for split in sorted({key[2] for key in runs}):
            for on, off in pairs:
                per_rep = [boot_diff(runs[(model, on, split, r)], runs[(model, off, split, r)], k, seed=r) for r in reps if (model, on, split, r) in runs and (model, off, split, r) in runs]
                if per_rep:
                    d = np.mean(per_rep, axis=0)
                    rows.append({"model": model, "split": split, "time_variant": on, "vs": off, "n_reps": len(per_rep), "delta_macro_f1": d.mean(), "ci_low": np.percentile(d, 2.5), "ci_high": np.percentile(d, 97.5), "ci_excludes_0": bool(np.percentile(d, 2.5) > 0 or np.percentile(d, 97.5) < 0)})
    pd.DataFrame(rows).round(4).to_csv(final / "delta_time.csv", index=False)

    # 3. effect of the later period (matched training size, text only)
    rows = []
    for model in sorted({key[0] for key in runs}):
        per_rep = [boot_diff(runs[(model, "text", "temporal_late", r)], runs[(model, "text", "random_matched", r)], k, seed=r, paired=False)
                   for r in reps if (model, "text", "temporal_late", r) in runs and (model, "text", "random_matched", r) in runs]
        if per_rep:
            d = np.mean(per_rep, axis=0)
            rows.append({"model": model, "n_reps": len(per_rep), "delta_macro_f1": d.mean(), "ci_low": np.percentile(d, 2.5), "ci_high": np.percentile(d, 97.5), "ci_excludes_0": bool(np.percentile(d, 2.5) > 0 or np.percentile(d, 97.5) < 0)})
    pd.DataFrame(rows).round(4).to_csv(final / "delta_shift.csv", index=False)

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
