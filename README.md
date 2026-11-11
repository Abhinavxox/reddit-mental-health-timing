# Does Timing Matter?

**Temporal signals and time-robustness in AI detection of mental-health risk from Reddit posts**

Group 2 · COMP 8790 Topics in Applied AI · Domain: Healthcare (Mental Health)

## Research question

> Do posting-time features significantly improve mental-health classification of Reddit posts over a strong text-only model, and how much does each method lose when trained on earlier posts and tested on later ones?

The anchor paper (Saeed & Ahmed, 2025) reports that adding posting time to a BiLSTM raises F1 from 0.7222 to 0.7376. That gain comes from a single run with no transformer baseline and no released code. We test whether it holds up, and whether models stay reliable on posts from a later period.

## What we asked and what we found (Phase I)

Applied AI means the data work counts as much as the model. We answered three questions on the Kaggle data (Methods A, B and C, 5 replicates for A and C, 3 for B, 95% bootstrap intervals). Details in `phase1/results/README.md`, figures in `phase1/figures/`, report draft in `paper/`, slides in `slides/`.

| Question | Answer |
|---|---|
| **Does removing leakage help?** (subreddit mentions, cross-posts, duplicates) | It does not change the score here. Macro F1 is 0.620 with full cleaning and 0.620 to 0.624 without, which is within noise. Leakage is rare in this file (about 3% of posts). The cleaning is cheap insurance that makes the score trustworthy, not a score booster. Same-user leakage cannot be checked on Kaggle (no author column). |
| **Does stratification help?** | Not at 20k posts. Label x month stratified and plain random samples both score 0.623 to 0.624 on a common test set. A class-balanced sample scores lower (0.607) on the real class mix. Stratification mainly guarantees every class and month is represented, which matters for the time splits. |
| **Does timing matter?** | No. Adding time features gives no reliable gain for TF-IDF, MentalRoBERTa or the BiLSTM (+0.005 at most, for the weak BiLSTM) and hurts TF-IDF under time shift (-0.016). The anchor paper's +0.015 is not reproduced. |
| **How much is lost on later posts?** | Nothing measurable (-0.001, interval about +/-0.007) for Nov 2021 to Jun 2022 train and Aug to Nov 2022 test. The paper's 2021 to 2022 split is confounded because three classes only exist from Nov 2021. |
| **What matters most?** | The text model. MentalRoBERTa about 0.68 macro F1, TF-IDF 0.64, BiLSTM 0.61. |

Code for the data-preparation answers: `phase1/src/ablation.py`. Every choice and why: `logs/decision_log.md`.

## Main agenda

1. **Phase I (60% of the mark):** reproduce and test the anchor paper's timing claim, with a leakage-controlled pipeline and a valid time-shift test. Report (`paper/`) and presentation (`slides/`).
2. **Phase II:** a moderator triage assistant built on the strongest text model, with explanations and an ethics plan. A human always makes the final call.

## Methods compared

| | Method | Source | Runs on |
|---|---|---|---|
| A | TF-IDF + logistic regression | Low et al. 2020 | Laptop |
| B | MentalRoBERTa fine-tuning | Ji et al. 2022 | Google Colab (T4) |
| C | BiLSTM + cross-modal attention, rebuilt from the paper | Saeed & Ahmed 2025 | Laptop (Apple M-series GPU) |

Each method is trained text-only and text + time, on a random split and on time-based splits (2021 → 2022, pre-COVID → mid-COVID).

## Team

| Member | Role |
|---|---|
| Abhinav Pandey | **Team lead.** Project coordination and repo setup, anchor reimplementation (Method C), timing ablation |
| Sudesh Nimesha | Classical baseline (Method A), statistics toolkit |
| Jaskamal | Data loading, deduplication, time-based splits |
| Zohaib Jawaid | MentalRoBERTa fine-tuning (Method B), calibration |
| Xing Liao | Triage interface, explanations, ethics report |

## Timeline

| Date | Milestone | Status |
|---|---|---|
| Sep 27, 2026 | Problem selection & feasibility report | Submitted · 4.8 / 5 |
| Oct 9, 2026 | Literature review & research question report | Submitted · 23 / 25 |
| Oct 22, 2026 | Phase I proposal presentation | Submitted · awaiting grade |
| Nov 2026 | Prototype: data pipeline + Method A (Milestone 1) | Done |
| Nov 2026 | Full experiments: A, B, C, replicates, time shift (Milestone 2) | Done |
| Nov 2026 | Phase I conference-style report (LaTeX) and slides | Draft in `paper/` and `slides/` |
| Nov 13 – Dec 4, 2026 | Phase II: moderator triage assistant | Planned |

See `docs/planning/design_doc.md` for the full plan and `logs/` for who did what.

## Repository layout

```
docs/
  submissions/   submitted course deliverables
  literature/    paper reviews and reference list
  planning/      design doc, project pitch
  learning/      team learning material
phase1/          research code: data prep, methods A/B/C, experiments
phase2/          triage assistant (later)
logs/            individual contribution logs + shared TODO
```

## Data

Not committed. Run `phase1/data/download_data.sh`:
- Kaggle *Mental Disorders Identification (Reddit)*, about 701k posts (needs your own Kaggle API token)
- Low et al. 2020 Reddit Mental Health Dataset, Zenodo, public domain

## Contributing

- Commit your own work from your own GitHub account.
- One branch per task, merged into `main` by pull request with one reviewer.
- Never commit data, tokens or model weights.
- Update your log in `logs/` every week.
