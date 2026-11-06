"""Clean posts, remove label leakage, add time features, take a stratified sample.

Usage: python src/prepare.py --n 20000
Output: data/processed/sample.parquet and data/processed/funnel.json
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "low2020"
OUT = ROOT / "data" / "processed"

# subreddit file prefix -> class label
LABELS = {
    "depression": "depression",
    "anxiety": "anxiety",
    "bipolarreddit": "bipolar",
    "bpd": "bpd",
    "schizophrenia": "schizophrenia",
    "mentalhealth": "mentalillness",
}
# file suffix -> year. "pre" is skipped: it overlaps the 2019 window.
PERIODS = {"2018": 2018, "2019": 2019, "post": 2020}

SUB_MENTION = re.compile(r"/?\br/\w+|\bthis (?:sub|subreddit)\b|\b(?:bpd|bipolar|depression|anxiety|schizophrenia)\s+(?:sub|subreddit)\b", re.I)
URL = re.compile(r"http\S+|www\.\S+")


def load_zenodo() -> pd.DataFrame:
    frames = []
    for prefix, label in LABELS.items():
        for suffix, year in PERIODS.items():
            f = RAW / f"{prefix}_{suffix}_features_tfidf_256.csv"
            d = pd.read_csv(f, usecols=["author", "date", "post"])
            d["label"], d["year"] = label, year
            frames.append(d)
    return pd.concat(frames, ignore_index=True).rename(columns={"post": "text"})


def norm_hash(s: str) -> str:
    return hashlib.md5(re.sub(r"[^a-z0-9]", "", s.lower()).encode()).hexdigest()


def main(n: int, seed: int) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    funnel = []

    def log(step, d):
        funnel.append({"step": step, "rows": int(len(d))})
        print(f"{step:<48}{len(d):>9,}")

    df = load_zenodo()
    log("raw rows (6 subreddits x 3 windows)", df)

    # cleaning
    df["text"] = df.text.fillna("").str.replace(URL, " ", regex=True).str.replace(r"\s+", " ", regex=True).str.strip()
    df = df[~df.text.isin(["", "[removed]", "[deleted]"])]
    log("drop empty / removed / deleted", df)
    df = df[df.text.str.split().str.len() >= 5]
    log("drop posts under 5 words", df)

    # leakage: subreddit mentions in the text
    n_mention = int(df.text.str.contains(SUB_MENTION).sum())
    df["text"] = df.text.str.replace(SUB_MENTION, " ", regex=True).str.replace(r"\s+", " ", regex=True).str.strip()
    df = df[df.text.str.split().str.len() >= 5]
    log(f"remove subreddit mentions ({n_mention:,} posts had one)", df)

    # leakage: duplicates and cross-posts
    df["h"] = df.text.map(norm_hash)
    multi = df.groupby("h").label.nunique()
    df = df[~df.h.isin(multi[multi > 1].index)]
    log("drop texts appearing under more than one label", df)
    df = df.drop_duplicates("h")
    log("drop exact and near duplicates", df)
    df = df.drop(columns="h")

    # time features (the data only has day-level dates, so no hour)
    ts = pd.to_datetime(df.date, format="%Y/%m/%d")
    df["month"], df["day"], df["weekday"] = ts.dt.month, ts.dt.day, ts.dt.day_of_week
    df["is_weekend"] = (df.weekday >= 5).astype(int)
    df["ym"] = ts.dt.to_period("M").astype(str)
    df["created"] = ts

    # stratified sample: label x year-month
    frac = min(1.0, n / len(df))
    sample = df.groupby(["label", "ym"]).sample(frac=frac, random_state=seed).reset_index(drop=True)
    sample.insert(0, "id", range(len(sample)))
    log(f"stratified sample (label x month), target {n:,}", sample)

    sample.to_parquet(OUT / "sample.parquet")
    (OUT / "funnel.json").write_text(json.dumps(funnel, indent=2))
    print("\nclass share, full clean data vs sample")
    print(pd.concat([df.label.value_counts(normalize=True), sample.label.value_counts(normalize=True)], axis=1, keys=["full", "sample"]).round(3))
    print("\nsample counts by label x year\n", sample.pivot_table(index="label", columns="year", values="id", aggfunc="count"))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=20000)
    ap.add_argument("--seed", type=int, default=42)
    a = ap.parse_args()
    main(a.n, a.seed)
