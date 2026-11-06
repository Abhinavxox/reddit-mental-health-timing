"""Shared metrics used by every method."""
import numpy as np
from sklearn.metrics import accuracy_score, average_precision_score, confusion_matrix, f1_score, recall_score


def ece(y_true, proba, n_bins: int = 10) -> float:
    """Expected calibration error from the top predicted probability."""
    conf = proba.max(axis=1)
    correct = (proba.argmax(axis=1) == y_true).astype(float)
    bins = np.linspace(0, 1, n_bins + 1)
    total = 0.0
    for lo, hi in zip(bins[:-1], bins[1:]):
        m = (conf > lo) & (conf <= hi)
        if m.any():
            total += m.mean() * abs(correct[m].mean() - conf[m].mean())
    return float(total)


def evaluate(y_true, y_pred, proba, labels) -> dict:
    """y_true and y_pred are integer class ids indexing into labels. proba is (n, n_classes)."""
    y_true, y_pred = np.asarray(y_true), np.asarray(y_pred)
    idx = list(range(len(labels)))
    out = {
        "macro_f1": f1_score(y_true, y_pred, labels=idx, average="macro", zero_division=0),
        "accuracy": accuracy_score(y_true, y_pred),
        "auprc": float(np.mean([average_precision_score(y_true == i, proba[:, i]) for i in idx])),
        "ece": ece(y_true, proba),
    }
    rec = recall_score(y_true, y_pred, labels=idx, average=None, zero_division=0)
    f1s = f1_score(y_true, y_pred, labels=idx, average=None, zero_division=0)
    for i, name in enumerate(labels):
        out[f"recall_{name}"], out[f"f1_{name}"] = rec[i], f1s[i]
    out["confusion"] = confusion_matrix(y_true, y_pred, labels=idx).tolist()
    return out
