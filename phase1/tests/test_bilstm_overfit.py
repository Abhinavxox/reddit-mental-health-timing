"""Sanity check for Method C: the network must be able to memorise 300 posts. If it cannot, there is a bug.

python tests/test_bilstm_overfit.py   (needs data/processed/kaggle/sample.parquet)
"""
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from models.bilstm_attn import BiLSTMAttn  # noqa: E402


def check(features):
    df = pd.read_parquet(ROOT / "data" / "processed" / "kaggle" / "sample.parquet")
    labels = sorted(df.label.unique())
    df["y"] = df.label.map({l: i for i, l in enumerate(labels)})
    small = df.sample(300, random_state=0)
    m = BiLSTMAttn(features, seed=0, max_epochs=60, patience=60)
    m.fit(small, small)
    acc = m.train_accuracy(small)
    print(f"{features:<18} train accuracy on 300 posts after {m.epochs_run} epochs: {acc:.3f}")
    assert acc >= 0.95, f"{features} cannot memorise 300 posts ({acc:.3f})"


if __name__ == "__main__":
    for f in ["text", "text_time", "text_time_concat"]:
        check(f)
    print("overfit checks passed")
