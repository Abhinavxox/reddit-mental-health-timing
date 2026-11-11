"""Two data-preparation ablations with Method A (TF-IDF + LR, text only, 20k posts, 5 replicates).

1. Leakage: does removing leakage change the score, and is the score we would report honest?
   Variants: full cleaning / keep subreddit mentions / keep duplicates and cross-posts / no leakage control.
   For each variant we train on its (possibly leaky) train set and report
     reported_f1  macro F1 on its own random test set (what a careless study would report)
     clean_f1     macro F1 on the same posts restricted to "clean" ones: no subreddit mention and a text that
                  appears once in the whole data (so no copy sits in train)
2. Stratification: label x month stratified sample vs plain random sample vs class-balanced sample.
   All are scored on one common reference test set drawn at random from the full clean data (true class mix),
   so the question is how well the training sample represents the population.

python src/ablation.py            writes results/kaggle/ablation_leakage.csv and ablation_strat.csv
"""
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from models.tfidf_lr import TfidfLR  # noqa: E402
from prepare import KAGGLE_YEARS, SUB_MENTION, URL, load_kaggle, norm_hash  # noqa: E402

N, REPS = 20_000, 5


def base():
    df = load_kaggle()
    df = df[~df.over_18 & df.year.isin(KAGGLE_YEARS)].drop(columns="over_18")
    df["text"] = df.text.fillna("").str.replace(URL, " ", regex=True).str.replace(r"\s+", " ", regex=True).str.strip()
    df = df[~df.text.isin(["", "[removed]", "[deleted]"])]
    df = df[df.text.str.split().str.len() >= 5].copy()
    df["has_mention"] = df.text.str.contains(SUB_MENTION)
    df["h_raw"] = df.text.map(norm_hash)
    return df


def clean_text(s):
    return s.str.replace(SUB_MENTION, " ", regex=True).str.replace(r"\s+", " ", regex=True).str.strip()


def variant(df, remove_mention, remove_dups):
    d = df.copy()
    if remove_mention:
        d["text"] = clean_text(d.text)
        d = d[d.text.str.split().str.len() >= 5]
    d["h"] = d.text.map(norm_hash)
    if remove_dups:
        multi = d.groupby("h").label.nunique()
        d = d[~d.h.isin(multi[multi > 1].index)].drop_duplicates("h")
    return d


def add_time(d):
    ts = d.created
    d["ym"] = ts.dt.to_period("M").astype(str)
    return d


def fit_eval(train, tests, labels, seed):
    train = train.assign(y=train.label.map(labels))
    tr, va = train_test_split(train, test_size=0.1, stratify=train.y, random_state=seed)
    m = TfidfLR("text", seed=seed).fit(tr, va)
    out = []
    for t in tests:
        t = t.assign(y=t.label.map(labels))
        out.append(f1_score(t.y, m.predict_proba(t).argmax(1), average="macro"))
    return out


def main():
    df = base()
    labels = {l: i for i, l in enumerate(sorted(df.label.unique()))}
    # texts that are clean by every criterion, judged on the raw data
    cnt = df.groupby("h_raw").size()
    nlab = df.groupby("h_raw").label.nunique()
    df["clean"] = (~df.has_mention) & (df.h_raw.map(cnt) == 1) & (df.h_raw.map(nlab) == 1)
    print("rows", len(df), "clean", int(df.clean.sum()))

    rows = []
    for name, rm, rd in [("full cleaning", True, True), ("keep subreddit mentions", False, True), ("keep duplicates and cross-posts", True, False), ("no leakage control", False, False)]:
        d = add_time(variant(df, rm, rd))
        for r in range(REPS):
            s = d.groupby(["label", "ym"]).sample(frac=min(1, N / len(d)), random_state=42 + r)
            tr, te = train_test_split(s, test_size=0.2, stratify=s.label, random_state=42 + r)
            full, clean = fit_eval(tr, [te, te[te.clean]], labels, r)
            rows.append({"variant": name, "rep": r, "reported_f1": full, "clean_f1": clean, "n_train": len(tr)})
        print(name, pd.DataFrame(rows).query("variant==@name")[["reported_f1", "clean_f1"]].mean().round(4).to_dict(), flush=True)
    pd.DataFrame(rows).to_csv(ROOT / "results/kaggle/ablation_leakage.csv", index=False)

    # stratification, all on fully cleaned data
    d = add_time(variant(df, True, True))
    rows = []
    for r in range(REPS):
        ref_idx = d.sample(n=20_000, random_state=100 + r).index
        ref, pool = d.loc[ref_idx], d.drop(ref_idx)
        samples = {
            "label x month stratified": pool.groupby(["label", "ym"]).sample(frac=N / len(pool), random_state=r),
            "plain random": pool.sample(n=N, random_state=r),
            "class balanced": pool.groupby("label").sample(n=N // 6, random_state=r, replace=False) if pool.label.value_counts().min() >= N // 6 else pool.groupby("label").sample(n=int(pool.label.value_counts().min()), random_state=r),
        }
        for name, s in samples.items():
            f = fit_eval(s, [ref], labels, r)[0]
            share = s.label.value_counts(normalize=True)
            rows.append({"sampling": name, "rep": r, "ref_macro_f1": f, "n_train": len(s), "months": s.ym.nunique(), "smallest_class_share": share.min()})
        print("strat rep", r, flush=True)
    out = pd.DataFrame(rows)
    out.to_csv(ROOT / "results/kaggle/ablation_strat.csv", index=False)
    print(out.groupby("sampling")[["ref_macro_f1", "n_train", "months", "smallest_class_share"]].agg(["mean", "std"]).round(4).to_string())


if __name__ == "__main__":
    main()
