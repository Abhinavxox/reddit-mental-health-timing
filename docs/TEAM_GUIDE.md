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

**Thotagamuwage Sudesh Nimesha (Method A, statistics)**
- Read `phase1/src/models/tfidf_lr.py` and `phase1/src/stats.py`. Run `python phase1/tests/test_stats.py` and `python phase1/tests/test_evaluate.py`.
- Add a short note to `logs/decision_log.md` if you would change anything, and mark your TODO rows in `logs/TODO.md` as reviewed.
- Presents: Method A, the statistics (bootstrap and McNemar), and the leakage/stratification slide.

**Jaskamal (data, leakage, splits)**
- Read `phase1/src/prepare.py` and `phase1/src/splits.py`. Run `python phase1/src/prepare.py --source kaggle --n 20000` and check the funnel numbers match `phase1/results/README.md`.
- Mark your TODO rows as reviewed. Note anything you would change in `logs/decision_log.md`.
- Presents: the data, leakage control, splits.

**Zohaib Jawaid (Method B)**
- Read `phase1/src/models/roberta.py` and the Colab notebook. Add a short "Method B setup" note to `phase1/results/README.md` (GPU, run time about 16 min per run, 20k training subsample, 3 replicates).
- Mark your TODO rows as reviewed.
- Presents: Method B and the comparison table.

**Xing Liao (Phase II, ethics)**
- Start `phase2/README.md`: the triage assistant plan, what a moderator would see, the explanation method, and the main ethics risks (labels are subreddits not diagnoses, false alarms, privacy).
- Presents: limits and Phase II.

**Abhinav Pandey (lead)**
- Presents: problem, question, Method C, reproduction, timing results, findings.

## 4. How to commit

```
git pull
# make your change
git add <the files you changed>
git commit -m "Short description of what you did"
git push
```

Rules: never commit data, tokens, passwords or student IDs (the repo is public). Small commits with clear messages are best.
