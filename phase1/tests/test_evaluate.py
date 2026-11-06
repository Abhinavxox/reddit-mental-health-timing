"""Checks evaluate() on the worked example: 100 posts, 10 truly positive, 8 flagged, 6 of those correct."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from evaluate import ece, evaluate  # noqa: E402


def test_worked_example():
    y_true = np.array([1] * 10 + [0] * 90)
    y_pred = np.array([1] * 6 + [0] * 4 + [1] * 2 + [0] * 88)
    proba = np.where(y_pred[:, None] == 1, [0.1, 0.9], [0.9, 0.1])
    r = evaluate(y_true, y_pred, proba, ["neg", "pos"])
    assert abs(r["recall_pos"] - 0.6) < 1e-9
    assert abs(r["f1_pos"] - 2 * 0.75 * 0.6 / 1.35) < 1e-9
    assert abs(r["accuracy"] - 0.94) < 1e-9
    assert r["confusion"] == [[88, 2], [4, 6]]


def test_ece_perfectly_calibrated_and_overconfident():
    y = np.array([0, 1] * 50)
    sure = np.tile([0.5, 0.5], (100, 1))
    assert ece(y, sure) <= 0.5
    wrong = np.tile([0.99, 0.01], (100, 1))
    assert abs(ece(y, wrong) - 0.49) < 1e-9


if __name__ == "__main__":
    test_worked_example()
    test_ece_perfectly_calibrated_and_overconfident()
    print("evaluate tests passed")
