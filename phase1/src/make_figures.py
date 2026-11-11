"""Make the report figures from results/<source>/final/ (run stats.py first).

python src/make_figures.py --source kaggle      writes figures/*.png
"""
import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
NAMES = {"tfidf": "A  TF-IDF + LR", "bilstm": "C  BiLSTM", "roberta": "B  MentalRoBERTa"}
COLORS = {"text": "#4c72b0", "text_time": "#dd8452"}
plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False})


def fig_time_effect(summary, out):
    """Macro F1 with and without time features, per method, one panel per split."""
    splits = [s for s in ["random_matched", "temporal_late"] if s in summary.split.unique()]
    fig, axes = plt.subplots(1, len(splits), figsize=(4.6 * len(splits), 3.6), sharey=True)
    axes = np.atleast_1d(axes)
    models = [m for m in NAMES if m in summary.model.unique()]
    for ax, split in zip(axes, splits):
        for j, feat in enumerate(["text", "text_time"]):
            d = summary[(summary.split == split) & (summary.features == feat)].set_index("model")
            xs = [i + (j - 0.5) * 0.36 for i in range(len(models))]
            vals = [d.macro_f1_mean.get(m, np.nan) for m in models]
            errs = [d.macro_f1_std.get(m, 0) for m in models]
            ax.bar(xs, vals, 0.34, yerr=errs, capsize=3, color=COLORS[feat], label="text only" if feat == "text" else "text + time")
        ax.set_xticks(range(len(models)))
        ax.set_xticklabels([NAMES[m] for m in models], rotation=12)
        ax.set_title(split.replace("_", " "))
        ax.set_ylim(0, 0.85)
    axes[0].set_ylabel("macro F1 (mean ± std over replicates)")
    axes[0].legend(frameon=False, loc="lower left")
    fig.tight_layout()
    fig.savefig(out / "fig1_time_effect.png", dpi=200)
    plt.close(fig)


def fig_delta_time(dt, out):
    """Forest plot: change in macro F1 from adding time features, with 95% bootstrap CI."""
    d = dt[dt.time_variant == "text_time"].reset_index(drop=True)
    fig, ax = plt.subplots(figsize=(5.4, 0.55 * len(d) + 1.2))
    for i, r in d.iterrows():
        ax.errorbar(r.delta_macro_f1, i, xerr=[[r.delta_macro_f1 - r.ci_low], [r.ci_high - r.delta_macro_f1]], fmt="o", color="#c44e52" if r.ci_excludes_0 else "#555", capsize=3)
    ax.axvline(0, color="k", lw=0.8)
    ax.set_yticks(range(len(d)))
    ax.set_yticklabels([f"{NAMES.get(m, m)}, {s.replace('_', ' ')}" for m, s in zip(d.model, d.split)])
    ax.set_xlabel("change in macro F1 from adding time features (95% CI)")
    ax.invert_yaxis()
    fig.tight_layout()
    fig.savefig(out / "fig2_delta_time.png", dpi=200)
    plt.close(fig)


def fig_shift(summary, out):
    """Same-period (size-matched random split) vs later-period macro F1, text only."""
    d = summary[summary.features == "text"]
    models = [m for m in NAMES if m in d.model.unique()]
    fig, ax = plt.subplots(figsize=(4.6, 3.6))
    for j, (split, label, color) in enumerate([("random_matched", "same period (random, size-matched)", "#8c8c8c"), ("temporal_late", "later period (Aug to Nov 2022)", "#55a868")]):
        x = d[d.split == split].set_index("model")
        ax.bar([i + (j - 0.5) * 0.36 for i in range(len(models))], [x.macro_f1_mean.get(m, np.nan) for m in models], 0.34, yerr=[x.macro_f1_std.get(m, 0) for m in models], capsize=3, color=color, label=label)
    ax.set_xticks(range(len(models)))
    ax.set_xticklabels([NAMES[m] for m in models], rotation=12)
    ax.set_ylabel("macro F1, text only")
    ax.set_ylim(0, 0.85)
    ax.legend(frameon=False, loc="lower left")
    fig.tight_layout()
    fig.savefig(out / "fig3_time_shift.png", dpi=200)
    plt.close(fig)


def fig_class_mix(source, out):
    """Class share per month: shows that three classes only exist from Nov 2021."""
    s = pd.read_parquet(ROOT / "data" / "processed" / source / "sample.parquet")
    ct = pd.crosstab(s.ym, s.label, normalize="index")
    fig, ax = plt.subplots(figsize=(7.2, 3.4))
    ct.plot(kind="bar", stacked=True, ax=ax, width=0.9, colormap="tab10")
    ax.set_xlabel("")
    ax.set_ylabel("share of posts")
    ax.legend(frameon=False, ncol=3, fontsize=8, loc="upper center", bbox_to_anchor=(0.5, 1.22))
    ax.tick_params(axis="x", labelsize=7)
    fig.tight_layout()
    fig.savefig(out / "fig4_class_mix_by_month.png", dpi=200)
    plt.close(fig)


def fig_confusion(source, out):
    """Confusion matrix of Method A (text only, temporal_late), pooled over replicates, row-normalised."""
    preds = sorted((ROOT / "results" / source / "final" / "preds").glob("tfidf_text_temporal_late_rep*.npz"))
    if not preds:
        return
    labels = sorted(pd.read_parquet(ROOT / "data" / "processed" / source / "sample.parquet").label.unique())
    k = len(labels)
    cm = np.zeros((k, k))
    for f in preds:
        d = np.load(f)
        cm += np.bincount(d["y"] * k + d["pred"], minlength=k * k).reshape(k, k)
    cm = cm / cm.sum(1, keepdims=True)
    fig, ax = plt.subplots(figsize=(4.6, 4))
    im = ax.imshow(cm, cmap="Blues", vmin=0, vmax=1)
    ax.set_xticks(range(k))
    ax.set_xticklabels(labels, rotation=45, ha="right")
    ax.set_yticks(range(k))
    ax.set_yticklabels(labels)
    for i in range(k):
        for j in range(k):
            ax.text(j, i, f"{cm[i, j]:.2f}", ha="center", va="center", color="white" if cm[i, j] > 0.5 else "black", fontsize=8)
    ax.set_xlabel("predicted")
    ax.set_ylabel("true")
    fig.colorbar(im, ax=ax, fraction=0.046)
    fig.tight_layout()
    fig.savefig(out / "fig5_confusion_A_temporal_late.png", dpi=200)
    plt.close(fig)


def main(source):
    final = ROOT / "results" / source / "final"
    out = ROOT / "figures"
    out.mkdir(exist_ok=True)
    summary = pd.read_csv(final / "summary.csv")
    fig_time_effect(summary, out)
    fig_delta_time(pd.read_csv(final / "delta_time.csv"), out)
    fig_shift(summary, out)
    fig_class_mix(source, out)
    fig_confusion(source, out)
    print("wrote", sorted(p.name for p in out.glob("fig*.png")))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="kaggle")
    main(ap.parse_args().source)
