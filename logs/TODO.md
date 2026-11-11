# TODO

| Task | Owner | Status |
|---|---|---|
| Download Kaggle dataset locally (needs a Kaggle API token) | Xing Liao | Done by Abhinav, needs owner review |
| `prepare.py`: clean, time features, stratified sample | Xing Liao | Prototype done, needs owner review |
| `splits.py`: random and time-based splits saved to disk | Xing Liao | Prototype done, needs owner review |
| `evaluate.py`: macro F1, recall, AUPRC, ECE, confusion matrix | Sudesh Nimesha | Prototype done, tested |
| Method A prototype: text only, text + time, time only | Jaskamal | Prototype done on Zenodo data |
| Month leakage check and majority baseline | Jaskamal | Done on Zenodo data |
| Method C: BiLSTM + cross-modal attention from paper equations | Abhinav Pandey | Done, 5 replicates |
| Method B: MentalRoBERTa fine-tuning on Colab (`phase1/notebooks/method_b_colab.ipynb`) | Abhinav Pandey | Done, 3 replicates |
| Each member fills in their own log from week 1 | Everyone | To do |
| Phase II triage interface and ethics plan | Everyone | Later |

| Rerun the pipeline on the Kaggle data, add hour feature | Xing Liao | Done by Abhinav, needs owner review |
| Size-matched random splits to separate shift from training size | Sudesh Nimesha | Done (random_matched) |
| 5 replicates, bootstrap CIs, McNemar (Methods A, B and C) | Sudesh Nimesha | Done (`stats.py`), needs owner review |
| Decide the temporal split for the paper: Kaggle 2021→2022 is confounded by collection (3 classes missing before Nov 2021). Use temporal_late | Group | To decide |
| Mention the collection artifact as a finding about the anchor paper's data | Group | To discuss |
| Phase I report draft (LaTeX in `paper/`) | Group | Draft started |
| Interpretation and comparison with the papers (reproduction table, related-work comparison) | Sudesh Nimesha | To do |
| Leakage and stratification test (`phase1/src/ablation.py`) | Xing Liao | Done by Abhinav, needs owner review |
| Model explanations: top words per class and confusion matrix, short write-up in `phase1/results/README.md` | Zohaib Jawaid | To do |
