# Design Doc: Does Timing Matter? (Phase I prototype → experiments)

Group 2 · COMP 8790 · Owner of this doc: Abhinav Pandey

## 1. Goal

Answer RQ1 with evidence:
1. Do posting-time features improve macro F1 over a text-only model?
2. How much does each method lose when trained on earlier posts and tested on later ones?

**Strategy: prototype first.** Build the whole pipeline end to end with the **simplest method (A, TF-IDF + logistic regression)** on a **small sample on a laptop**. Once that works and the numbers look sane, plug in Methods B and C and scale up.

**Why start with A, not all three?**
- A trains in seconds, so bugs in the data, splits or metrics show up fast.
- Every later model reuses the same data loader, splits and evaluation. Get those right once.
- A already gives a first rough answer to the timing question (text vs text + time).

## 2. Compute: laptop or cloud?

Laptop: Apple M2, 8 GB RAM, ~57 GB free disk.

| Part | Where | Why |
|---|---|---|
| Data cleaning, sampling, splits | **Laptop** | pandas on a 50k sample is easy. Load only the needed columns. |
| Method A (TF-IDF + LR) | **Laptop** | Seconds to minutes on CPU. |
| Method C (BiLSTM + attention) | **Laptop** (M2 GPU via PyTorch `mps`) | Small model (64 units, 100 tokens). A few minutes per epoch on 20 to 50k posts. Colab is the fallback if it's slow. |
| Method B (MentalRoBERTa) | **Google Colab (free T4 GPU)** | 125M parameters. Too slow and memory-tight on 8 GB. About 1 to 2 hours on a T4. |

**Verdict:** the laptop is fine for the prototype and for A and C. Colab is needed only for B. No paid cloud.

## 3. Data

**Source 1 (main):** Kaggle *Mental Disorders Identification (Reddit)*, about 701k posts.
- Columns: `title`, `selftext`, `created_utc`, `over_18`, `subreddit`
- Download it once yourself, since it needs a Kaggle login. Keep it out of git.

**Source 2 (shift test):** Low et al. Zenodo, pre vs mid COVID. Posts have **day-level dates only**, so `hour` and `is_working_hour` aren't available there. Only weekday, day, month and weekend are.

**Labels (6):** depression, anxiety, bipolar, BPD, schizophrenia, mentalillness. The subreddit is the label.

**Cleaning (`prepare.py`):**
1. `text = title + " " + selftext`
2. Drop `[removed]`, `[deleted]`, empty and `over_18` posts
3. Remove subreddit mentions from the text (`r/\w+` and the label words in the form "r/depression") to stop label leakage
4. Drop exact duplicate texts
5. Time features from `created_utc`: `hour, weekday, day, month, is_weekend, is_working_hour`, scaled to 0–1

**Sampling:** stratified by label and month.
- **Prototype:** 20k posts
- **Full runs:** 50 to 100k posts

The same sample file is used by every method.

**Splits (`splits.py`):**
- `random`: 80/20 stratified. Used only to compare with the anchor paper.
- `temporal`: train on 2021, test on 2022. **This is the main split.**
- Validation is always carved from train only.
- Save split IDs to disk so every method uses identical rows.

## 4. Code structure

```
phase1/
  data/            # raw + processed files (git-ignored)
  src/
    prepare.py     # clean, features, sample  -> data/processed/sample_20k.parquet
    splits.py      # random / temporal split ids
    evaluate.py    # shared metrics: macro F1, per-class recall, AUPRC, ECE, confusion matrix
    models/
      tfidf_lr.py      # Method A
      bilstm_attn.py   # Method C
      roberta.py       # Method B (Colab)
  run.py           # python run.py --model tfidf --split temporal --time on --seed 0
  results/         # one row per run in results.csv
  notebooks/       # EDA only
```

**One interface for all methods:** each model has `fit(train, val)` and `predict_proba(test)`. `run.py` handles data, splits, seeds and evaluation, so models stay small and swappable.

**Every run appends one row** to `results.csv`: `model, time_on, split, seed, n_train, macro_f1, recall_*, auprc, ece, train_seconds`.

## 5. Experiment matrix

| Factor | Values |
|---|---|
| Model | A, B, C |
| Time features | off, on |
| Split | random, temporal (Kaggle 2021→2022), pre→mid COVID (Zenodo) |
| Seeds | 1 in the prototype, 5 in full runs |

**Checks we always run:**
- **Month-only model:** logistic regression on the time features alone. If this beats chance by a lot, time is leaking the label.
- **Majority-class baseline:** to sanity-check every score.

## 6. Milestones

### Milestone 1: Working prototype (about 1 week)
**Goal:** the whole pipeline runs end to end on small data, with Method A.

Tasks:
1. Download the Kaggle data. Run `prepare.py` to get a 20k stratified sample, and do quick EDA (class counts, posts per month).
2. `splits.py` with random and temporal splits saved to disk.
3. `evaluate.py` with the shared metrics.
4. Method A: text only, and text + time.
5. Leakage checks: the month-only model and the majority baseline.
6. Repo with a README and `requirements.txt` so teammates can run it.

**Done when** `results.csv` has this table filled, with sane numbers:

| Method A | random split | temporal split |
|---|---|---|
| text only | macro F1 | macro F1 |
| text + time | macro F1 | macro F1 |
| time only | macro F1 | macro F1 |

**Sanity bar:** text-only macro F1 should clearly beat the majority baseline. The anchor reports about 0.72 F1 for text models, so expect a similar range. Anything near 0.99 means leakage.

### Milestone 2: Full experiments (about 1.5 to 2 weeks)
**Goal:** answer RQ1 with all three methods and real statistics.

Tasks:
1. **Method C** (Abhinav): rebuild the BiLSTM + cross-modal attention from the paper's equations. Include an ablation that swaps attention for plain concatenation.
2. **Method B** (Zohaib): fine-tune MentalRoBERTa on Colab. Time features join before the classifier head.
3. Scale up to the 50 to 100k sample, 5 seeds each, on the random and temporal splits.
4. Zenodo pre→mid COVID shift run (A and B at minimum).
5. Statistics: bootstrap 95% CIs on the "time on minus time off" difference, and McNemar between models.
6. Reproduction table: our C vs the paper's 0.7376, with an explanation of any gap.

**Done when** we can fill these two sentences with numbers:
- "Adding time changes macro F1 by X (95% CI a to b) for A, B and C."
- "Moving from the same period to the later period drops macro F1 by Y for A, B and C."

## 7. Repo, commits and logs

**Repo name:** `does-timing-matter` (GitHub, under one member's account, with the other four added as collaborators).

**Layout:** `phase1/` and `phase2/` kept separate, as the course requires.

```
does-timing-matter/
  phase1/  (code, results, notebooks from section 4)
  phase2/  (triage tool, later)
  paper/   (LaTeX report)
  logs/    (one contribution log per member)
  README.md  requirements.txt  .gitignore  (data/ and model checkpoints ignored)
```

**How we work:**
- Everyone commits their own work from their own account. The course grades individual GitHub contributions.
- One branch per task (for example `method-c-bilstm`), merged into `main` through a pull request that one teammate reviews.
- Small commits with clear messages, for example "add temporal split" not "update".
- Never commit the dataset, API tokens or model weights.

**Logs (required by the course, week 1 to final week):**
- `logs/<name>.md` for each member. Every week, add the date, what you did, links to your commits, problems hit and next step.
- `logs/TODO.md` is the shared list of what still needs doing and who owns it. We update it at each meeting.

## 8. Next step after Milestone 2: the technical paper

The Phase I report is a conference-style LaTeX paper (submit LaTeX + PDF). It lives in `paper/` in the repo, written on Overleaf and synced.

To write it well, we first need to **show the results clearly**:
- one results table per research question (time on vs off, same vs later period) with 95% CIs
- a bar chart of macro F1 per method, with and without time
- a "drop under time shift" chart per method
- the reproduction table: paper's numbers vs ours
- confusion matrices for the best model

These figures are generated by a script in `phase1/` from `results.csv`, so they're reproducible and update automatically when new runs land.

## 9. Risks

| Risk | Plan |
|---|---|
| 8 GB RAM runs out loading 700k posts | Load only the needed columns, sample early, save parquet |
| Can't reach 0.7376 | Document the gap and why (paper has missing details). That counts as a finding. |
| Colab disconnects mid-training | Save checkpoints to Google Drive and keep runs short |
| Month leaks the label | Measured by the time-only check. Report it as a finding. |
| Zenodo has no hours | Use only weekday, day, month and weekend features there, and say so |
