"""Checks the bootstrap and McNemar code on cases where the answer is known."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from stats import boot_diff, holm, macro_f1, mcnemar, rep_interval  # noqa: E402


def make(y, pred):
    return {"y": np.asarray(y), "pred": np.asarray(pred)}


def test_identical_models_have_zero_difference():
    rng = np.random.default_rng(0)
    y = rng.integers(0, 4, 500)
    pred = np.where(rng.random(500) < 0.7, y, rng.integers(0, 4, 500))
    d = boot_diff(make(y, pred), make(y, pred), 4, n_boot=200)
    assert np.all(d == 0)


def test_worse_model_has_negative_ci():
    rng = np.random.default_rng(1)
    y = rng.integers(0, 4, 2000)
    good = np.where(rng.random(2000) < 0.8, y, rng.integers(0, 4, 2000))
    bad = np.where(rng.random(2000) < 0.4, y, rng.integers(0, 4, 2000))
    d = boot_diff(make(y, bad), make(y, good), 4, n_boot=300)
    assert np.percentile(d, 97.5) < 0


def test_equally_good_independent_models_straddle_zero():
    rng = np.random.default_rng(2)
    y = rng.integers(0, 4, 3000)
    a = np.where(rng.random(3000) < 0.7, y, rng.integers(0, 4, 3000))
    b = np.where(rng.random(3000) < 0.7, y, rng.integers(0, 4, 3000))
    d = boot_diff(make(y, a), make(y, b), 4, n_boot=300)
    assert np.percentile(d, 2.5) < 0 < np.percentile(d, 97.5)


def test_macro_f1_known_value():
    y = np.array([0, 0, 1, 1])
    p = np.array([0, 1, 1, 1])
    assert abs(macro_f1(y, p, 2) - (2 * 1 / 3 + 2 * 2 / 5) / 2) < 1e-9


def test_mcnemar_counts():
    y = np.array([0, 0, 0, 0])
    assert mcnemar(make(y, [0, 0, 1, 1]), make(y, [0, 1, 0, 1])) == (1, 1)


def test_rep_interval_consistent_and_noisy_gains():
    # same mean gain: consistent across replicates is significant, sign-flipping is not
    sd, lo, hi, p = rep_interval([0.005, 0.006, 0.004, 0.005, 0.005])
    assert lo > 0 and p < 0.01 and abs(sd - np.std([0.005, 0.006, 0.004, 0.005, 0.005], ddof=1)) < 1e-12
    _, lo, hi, p = rep_interval([0.002, 0.011, 0.007, -0.008, 0.012])
    assert lo < 0 < hi and p > 0.05
    assert np.isnan(rep_interval([0.01])[3])


def test_holm_known_values():
    # sorted p 0.01, 0.02, 0.04 times 3, 2, 1 gives 0.03, 0.04, 0.04 (kept monotone)
    assert np.allclose(holm([0.04, 0.01, 0.02]), [0.04, 0.03, 0.04])
    assert np.allclose(holm([0.5, 0.9]), [1.0, 1.0])
    out = holm([0.01, np.nan, 0.03])
    assert np.isnan(out[1]) and np.allclose(out[[0, 2]], [0.02, 0.03])


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("stats tests passed")
