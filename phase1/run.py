"""Run one experiment, or all experiments for a method, and append rows to results/<source>/.

python run.py --source kaggle --model tfidf --features text --split temporal_late --seed 0
python run.py --source kaggle --all                            # Method A, all splits
python run.py --source kaggle --model bilstm --all --seeds 0   # Method C, all splits and variants
python run.py --source kaggle --all --reps 0 1 2 3 4             # final runs on replicate samples
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


def rep_dir(rep):
    return f"rep{rep}" if rep is not None else ""


def load(source, split, rep=None):
    df = pd.read_parquet(ROOT / "data" / "processed" / source / rep_dir(rep) / "sample.parquet").set_index("id", drop=False)
    labels = sorted(df.label.unique())
    df["y"] = df.label.map({l: i for i, l in enumerate(labels)})
    ids = json.loads((ROOT / "data" / "splits" / source / rep_dir(rep) / f"{split}.json").read_text())
    return labels, df.loc[ids["train"]], df.loc[ids["val"]], df.loc[ids["test"]]


def make_model(model, features, seed):
    if model == "bilstm":
        from models.bilstm_attn import BiLSTMAttn  # imported here so Method A does not need torch

        return BiLSTMAttn(features, seed=seed)
    if model == "roberta":
        from models.roberta import RobertaClassifier

        return RobertaClassifier(features, seed=seed)
    if model in ("majority", "random"):
        return {"majority": Majority, "random": RandomGuess}[model]()
    return TfidfLR(features, seed=seed)


def results_file(source, model, rep=None):
    name = "results.csv" if model in ("tfidf", "majority", "random") else f"results_{model}.csv"
    return RESULTS / source / ("final" if rep is not None else "") / name


def run_one(source, model, features, split, seed, rep=None):
    if rep is not None:
        seed = rep
    labels, train, val, test = load(source, split, rep)
    m = make_model(model, features, seed)
    t0 = time.time()
    m.fit(train, val)
    secs = time.time() - t0
    proba = m.predict_proba(test)
    r = evaluate(test.y.values, proba.argmax(1), proba, labels)
    conf = r.pop("confusion")
    row = {"model": model, "features": features if model in ("tfidf", "bilstm", "roberta") else "-", "split": split, "seed": seed, "rep": rep,
           "n_train": len(train), "n_test": len(test), "best_C": m.best_C, "val_macro_f1": m.val_macro_f1,
           "epochs_run": getattr(m, "epochs_run", None), "alpha_time_mean": getattr(m, "alpha_time_mean", None),
           "train_seconds": round(secs, 1), **r}
    out = results_file(source, model, rep)
    if rep is not None and model != "random":  # per-post predictions for the paired bootstrap and McNemar
        pred_dir = out.parent / "preds"
        pred_dir.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(pred_dir / f"{model}_{row['features']}_{split}_rep{rep}.npz", id=test.id.values, y=test.y.values, pred=proba.argmax(1), proba=proba.astype(np.float32))
    out.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame([row]).to_csv(out, mode="a", header=not out.exists(), index=False)
    if model == "tfidf" and features == "text":
        (out.parent / f"top_words_{split}.json").write_text(json.dumps(m.top_words(labels), indent=1))
        (out.parent / f"confusion_{split}.json").write_text(json.dumps({"labels": labels, "matrix": conf}))
    extra = f" epochs={row['epochs_run']} alpha_time={row['alpha_time_mean']:.3f}" if row["alpha_time_mean"] is not None else (f" epochs={row['epochs_run']}" if row["epochs_run"] else "")
    print(f"{model:<8}{row['features']:<18}{split:<17} seed={seed} macro_f1={r['macro_f1']:.3f} w_f1={r['weighted_f1']:.3f} acc={r['accuracy']:.3f} ece={r['ece']:.3f} {secs:.0f}s{extra}", flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="tfidf", choices=["tfidf", "majority", "random", "bilstm", "roberta"])
    ap.add_argument("--features", default="text", choices=["text", "text_time", "time", "text_time_nomonth", "text_time_concat"])
    ap.add_argument("--source", default="kaggle", choices=["kaggle", "zenodo"])
    ap.add_argument("--split", default="temporal_late")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--seeds", type=int, nargs="+", default=[0])
    ap.add_argument("--reps", type=int, nargs="+", default=None, help="replicates to run with --all (uses data/processed/<source>/rep<k>)")
    ap.add_argument("--splits", nargs="+", default=None, help="limit --all to these splits")
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()
    reps = a.reps if a.reps is not None else [None]
    if a.all and a.model == "roberta":
        results_file(a.source, "roberta", reps[0]).unlink(missing_ok=True)
        for rep in reps:
            for s in a.splits or ["random_matched", "temporal_late"]:
                for f in ["text", "text_time"]:
                    run_one(a.source, "roberta", f, s, 0, rep)
    elif a.all and a.model == "bilstm":
        results_file(a.source, "bilstm", reps[0]).unlink(missing_ok=True)
        for rep in reps:
            for s in a.splits or SPLITS[a.source]:
                for seed in a.seeds:
                    for f in ["text", "text_time", "text_time_concat"]:
                        run_one(a.source, "bilstm", f, s, seed, rep)
    elif a.all:
        results_file(a.source, "tfidf", reps[0]).unlink(missing_ok=True)
        for rep in reps:
            for s in a.splits or SPLITS[a.source]:
                run_one(a.source, "majority", "-", s, 0, rep)
                run_one(a.source, "random", "-", s, 0, rep)
                for f in ["time", "text", "text_time", "text_time_nomonth"]:
                    run_one(a.source, "tfidf", f, s, 0, rep)
    else:
        run_one(a.source, a.model, a.features, a.split, a.seed, reps[0])
