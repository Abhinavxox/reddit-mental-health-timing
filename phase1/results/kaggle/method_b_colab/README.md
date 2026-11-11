# Method B raw outputs from Colab

Downloaded from Google Drive (`timing_matters_B/rep0`, `rep1`, `rep2`) after the Colab runs on Nov 11, 2026 (Tesla T4, about 16 minutes per run).

- `rep<k>/results_roberta.csv`: the 4 runs of replicate k (text and text + time, on `random_matched` and `temporal_late`)
- `rep<k>/preds/*.npz`: test-set predictions (post id, true label, predicted label, class probabilities). No post text.

Rep 2 was rerun after the first Colab session disconnected. Its first two runs gave the same scores both times (fixed seeds).
These files are merged into `../final/results_roberta.csv` and `../final/preds/`, which `src/stats.py` reads.
