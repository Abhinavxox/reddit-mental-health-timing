# TODO

| Task | Owner | Status |
|---|---|---|
| Download Kaggle dataset locally (needs a Kaggle API token) | Jaskamal | Done by Abhinav, needs owner review |
| `prepare.py`: clean, time features, 20k stratified sample | Jaskamal | Prototype done, needs owner review |
| `splits.py`: random and time-based splits saved to disk | Jaskamal | Prototype done, needs owner review |
| `evaluate.py`: macro F1, recall, AUPRC, ECE, confusion matrix | Sudesh Nimesha | Prototype done, tested |
| Method A prototype: text only, text + time, time only | Sudesh Nimesha | Prototype done on Zenodo data |
| Month leakage check and majority baseline | Sudesh Nimesha | Done on Zenodo data |
| Method C: BiLSTM + cross-modal attention from paper equations | Abhinav Pandey | To do |
| Method B: MentalRoBERTa fine-tuning on Colab | Zohaib Jawaid | To do |
| Each member fills in their own log from week 1 | Everyone | To do |
| Phase II triage interface and ethics plan | Xing Liao | Later |

| Rerun the pipeline on the Kaggle data, add hour feature | Jaskamal | Done by Abhinav, needs owner review |
| Size-matched random splits to separate shift from training size | Sudesh Nimesha | Done (random_matched) |
| 5 seeds, bootstrap CIs, McNemar | Sudesh Nimesha | To do |
| Decide the temporal split for the paper: Kaggle 2021→2022 is confounded by collection (3 classes missing before Nov 2021). Use temporal_late | Group | To decide |
| Mention the collection artifact as a finding about the anchor paper's data | Group | To discuss |
