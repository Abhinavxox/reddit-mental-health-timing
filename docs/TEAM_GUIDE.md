# Team guide: the repo, and what each of us commits

Repo: https://github.com/Abhinavxox/reddit-mental-health-timing

The course marks each of us individually, and the repo log is our evidence of who did what. So **everyone must make their own commits from their own GitHub account**. Please do it before the Friday presentation.

## 1. Where things are

| Folder | What is in it |
|---|---|
| `README.md` | the question, what we found, the agenda, team roles |
| `phase1/src/` | the code: `prepare.py` (cleaning, leakage removal, sample), `splits.py`, `evaluate.py`, `stats.py`, `ablation.py`, `models/` (A `tfidf_lr.py`, B `roberta.py`, C `bilstm_attn.py`) |
| `phase1/results/README.md` | all results in plain words, with tables |
| `phase1/results/kaggle/final/` | raw result tables (`summary.csv`, `delta_time.csv` ...) |
| `phase1/figures/` | the figures |
| `phase1/notebooks/method_b_colab.ipynb` | Method B on Colab |
| `paper/` | the Phase I report (LaTeX and PDF) |
| `slides/` | the Friday presentation (`Phase1_Timing_Matters.pptx`) |
| `docs/literature/` | all our literature reviews and references |
| `docs/submissions/` | what we already submitted |
| `logs/` | your personal log, the shared `weekly_log.csv`, `TODO.md`, `decision_log.md` |

## 2. One-time setup

```
git clone https://github.com/Abhinavxox/reddit-mental-health-timing.git
cd reddit-mental-health-timing
git config user.name "Your Name"
git config user.email "the email on your GitHub account"
```

Ask Abhinav to add you as a collaborator if `git push` is refused.

## 3. What each person commits

Only write what you really did. If you did not do something, do not claim it. Each item below is small.

**Everyone**
1. Fill in your own log `logs/<your-name>.md` (format in `logs/TEMPLATE.md`): what you did each week from September, the papers you reviewed, your part of the presentations.
2. Add your rows to `logs/weekly_log.csv` (one row per week you worked).
3. Read the part of the report and slides that is yours, fix anything wrong, and be ready to explain it on Friday.

**Xing Liao (data: loading, leakage removal, stratified sampling, splits)**
- Read `phase1/src/prepare.py`, `phase1/src/splits.py` and `phase1/src/ablation.py`.
- Run `python phase1/src/prepare.py --source kaggle --n 20000` and check the funnel numbers match `phase1/results/README.md` (701,787 raw, 483,715 clean).
- Mark your TODO rows in `logs/TODO.md` as reviewed. Note anything you would change in `logs/decision_log.md`.
- Presents: the data, leakage control, splits, and the leakage/stratification slide.

**Jaskamal (Method A, TF-IDF + logistic regression, the simplest method)**
- Read `phase1/src/models/tfidf_lr.py` (about 90 lines). Run one model: `cd phase1 && python run.py --source kaggle --model tfidf --features text --split random`.
- Write 3 to 5 lines in your log on how it works: words become TF-IDF scores, logistic regression learns which words point to which class, the setting C is picked on the validation set.
- Mark your TODO rows as reviewed.
- Presents: Method A.

**Thotagamuwage Sudesh Nimesha (statistics, interpretation, comparison with the papers)**
- Read `phase1/src/stats.py`. Run `python phase1/tests/test_stats.py` and `python phase1/tests/test_evaluate.py`.
- Write a short "comparison with the papers" note in `phase1/results/README.md`: our numbers next to the anchor paper (0.722 / 0.738), Low et al. (weighted F1 0.851, different label set) and MentalBERT, and why they are or are not comparable.
- Presents: statistics (replicates, bootstrap, McNemar), the reproduction slide and the timing table.

**Zohaib Jawaid (model explanations, kept simple)**
- Open `phase1/results/kaggle/final/top_words_random.json` (the words Method A relies on most for each class) and `phase1/figures/fig5_confusion_A_temporal_late.png` (which classes get mixed up).
- Write a short "What the model looks at" section in `phase1/results/README.md`: 2 to 3 top words per class, and the two classes most often confused, in plain words.
- Presents: one slide or one minute on what the model looks at.

**Abhinav Pandey (lead)**
- Presents: problem, question, methodology, Method B and C, results, findings.

**Phase II** (triage interface, explanations, ethics) is shared by everyone. We will split it after Friday.

## 4. How to commit

```
git pull
# make your change
git add <the files you changed>
git commit -m "Short description of what you did"
git push
```

Rules: never commit data, tokens, passwords or student IDs (the repo is public). Small commits with clear messages are best.
