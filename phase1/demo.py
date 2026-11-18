"""Live demo for the Phase I presentation. Nothing is written to disk.

python demo.py repro       slide 6: trains Method A live, then shows the reproduction table (paper vs ours)
python demo.py extension   slide 8: trains Method A with and without time on the later-period split live,
                           then shows the bootstrap results over all replicates and models
"""
import sys
import time

import pandas as pd

from run import load, make_model, ROOT
from evaluate import evaluate

FINAL = ROOT / "results" / "kaggle" / "final"
NAMES = {"tfidf": "A TF-IDF + LR", "roberta": "B MentalRoBERTa", "bilstm": "C BiLSTM (rebuilt)"}


def train_eval(model, features, split):
    labels, train, val, test = load("kaggle", split, 0)
    t0 = time.time()
    m = make_model(model, features, 0).fit(train, val)
    proba = m.predict_proba(test)
    r = evaluate(test.y.values, proba.argmax(1), proba, labels)
    print(f"  {NAMES[model]:<20} {features:<10} {split:<14} train={len(train):,} test={len(test):,}  "
          f"macro F1={r['macro_f1']:.3f}  weighted F1={r['weighted_f1']:.3f}  ({time.time() - t0:.0f}s)")
    return r


def repro():
    print("\n1) Live: train Method A on replicate 0, random split (the paper's setup)")
    train_eval("tfidf", "text", "random")
    s = pd.read_csv(FINAL / "summary.csv")
    w = lambda m, f: s[(s.model == m) & (s.features == f) & (s.split == "random")].weighted_f1_mean.iloc[0]
    print("\n2) Reproduction of the anchor paper (weighted F1, random split, mean of 5 replicates)")
    print(f"  {'':<14}{'paper':>8}{'ours (C)':>10}")
    print(f"  {'text only':<14}{0.7222:>8.3f}{w('bilstm', 'text'):>10.3f}")
    print(f"  {'text + time':<14}{0.7376:>8.3f}{w('bilstm', 'text_time'):>10.3f}")
    print(f"  {'gain':<14}{0.7376 - 0.7222:>+8.3f}{w('bilstm', 'text_time') - w('bilstm', 'text'):>+10.3f}")


def extension():
    print("\n1) Live: Method A, later-period split (train Nov 2021-Jun 2022, test Aug-Nov 2022), replicate 0")
    a = train_eval("tfidf", "text", "temporal_late")
    b = train_eval("tfidf", "text_time", "temporal_late")
    print(f"  change from adding time: {b['macro_f1'] - a['macro_f1']:+.3f}")
    d = pd.read_csv(FINAL / "delta_time.csv")
    d = d[d.time_variant == "text_time"]
    print("\n2) All replicates: change in macro F1 from adding time, 95% paired bootstrap interval")
    for _, r in d[d.split.isin(["random", "random_matched", "temporal_late"])].iterrows():
        verdict = "no real effect" if not r.ci_excludes_0 else ("worse" if r.delta_macro_f1 < 0 else "better")
        print(f"  {NAMES[r.model]:<20} {r.split:<15} {r.delta_macro_f1:+.3f} [{r.ci_low:+.3f}, {r.ci_high:+.3f}]  {verdict}")
    sh = pd.read_csv(FINAL / "delta_shift.csv")
    print("\n3) Later period vs same-size random (text only)")
    for _, r in sh.iterrows():
        print(f"  {NAMES[r.model]:<20} {r.delta_macro_f1:+.3f} [{r.ci_low:+.3f}, {r.ci_high:+.3f}]")


if __name__ == "__main__":
    {"repro": repro, "extension": extension}[sys.argv[1] if len(sys.argv) > 1 else "repro"]()
