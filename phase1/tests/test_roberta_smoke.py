"""Smoke test for Method B on a tiny sample, with the ungated roberta-base. Also prints the speed.

python tests/test_roberta_smoke.py
"""
import os
import sys
import time
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
os.environ.setdefault("B_MODEL", "roberta-base")
from models.roberta import RobertaClassifier  # noqa: E402

df = pd.read_parquet(ROOT / "data" / "processed" / "kaggle" / "sample.parquet")
labels = sorted(df.label.unique())
df["y"] = df.label.map({l: i for i, l in enumerate(labels)})
small = df.sample(480, random_state=0)
train, val, test = small.iloc[:320], small.iloc[320:400], small.iloc[400:]
for feats in ["text", "text_time"]:
    m = RobertaClassifier(feats, seed=0, epochs=1, batch=16)
    t0 = time.time()
    m.fit(train, val)
    p = m.predict_proba(test)
    steps = len(train) // 16
    print(f"{feats:<10} fit+predict {time.time() - t0:.0f}s for {steps} steps | proba {p.shape} sums to 1: {abs(p.sum(1) - 1).max() < 1e-4} | no NaN: {not pd.isna(p).any()}", flush=True)
