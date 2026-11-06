"""Run one experiment, or all Method A experiments, and append rows to results/results.csv.

python run.py --source kaggle --model tfidf --features text --split temporal --seed 0
python run.py --source kaggle --all
"""
import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "src"))
from evaluate import evaluate  # noqa: E402
from models.tfidf_lr import Majority, RandomGuess, TfidfLR  # noqa: E402

RESULTS = ROOT / "results"
SPLITS = {"kaggle": ["random", "random_matched", "temporal_late", "temporal_2021_22"], "zenodo": ["random", "random_matched", "temporal_1y", "temporal"]}


def load(source, split):
    df = pd.read_parquet(ROOT / "data" / "processed" / source / "sample.parquet").set_index("id", drop=False)
    labels = sorted(df.label.unique())
    df["y"] = df.label.map({l: i for i, l in enumerate(labels)})
    ids = json.loads((ROOT / "data" / "splits" / source / f"{split}.json").read_text())
    return labels, df.loc[ids["train"]], df.loc[ids["val"]], df.loc[ids["test"]]


def run_one(source, model, features, split, seed):
    res = RESULTS / source
    labels, train, val, test = load(source, split)
    m = {"majority": Majority, "random": RandomGuess}[model]() if model in ("majority", "random") else TfidfLR(features, seed=seed)
    t0 = time.time()
    m.fit(train, val)
    secs = time.time() - t0
    proba = m.predict_proba(test)
    r = evaluate(test.y.values, proba.argmax(1), proba, labels)
    conf = r.pop("confusion")
    row = {"model": model, "features": features if model == "tfidf" else "-", "split": split, "seed": seed,
           "n_train": len(train), "n_test": len(test), "best_C": m.best_C, "val_macro_f1": m.val_macro_f1,
           "train_seconds": round(secs, 1), **r}
    res.mkdir(parents=True, exist_ok=True)
    out = res / "results.csv"
    pd.DataFrame([row]).to_csv(out, mode="a", header=not out.exists(), index=False)
    if model == "tfidf" and features == "text":
        (res / f"top_words_{split}.json").write_text(json.dumps(m.top_words(labels), indent=1))
        (res / f"confusion_{split}.json").write_text(json.dumps({"labels": labels, "matrix": conf}))
    print(f"{model:<9}{row['features']:<10}{split:<12} macro_f1={r['macro_f1']:.3f} w_f1={r['weighted_f1']:.3f} acc={r['accuracy']:.3f} auprc={r['auprc']:.3f} ece={r['ece']:.3f} C={m.best_C}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="tfidf", choices=["tfidf", "majority", "random"])
    ap.add_argument("--features", default="text", choices=["text", "text_time", "time", "text_time_nomonth"])
    ap.add_argument("--source", default="kaggle", choices=["kaggle", "zenodo"])
    ap.add_argument("--split", default="temporal")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()
    if a.all:
        (RESULTS / a.source / "results.csv").unlink(missing_ok=True)
        for s in SPLITS[a.source]:
            run_one(a.source, "majority", "-", s, 0)
            run_one(a.source, "random", "-", s, 0)
            for f in ["time", "text", "text_time", "text_time_nomonth"]:
                run_one(a.source, "tfidf", f, s, 0)
    else:
        run_one(a.source, a.model, a.features, a.split, a.seed)
