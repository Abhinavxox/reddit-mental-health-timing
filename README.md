# Does Timing Matter?

**Temporal signals and time-robustness in AI detection of mental-health risk from Reddit posts**

Group 2 · COMP 8790 Topics in Applied AI · Domain: Healthcare (Mental Health)

## Research question

> Do posting-time features significantly improve mental-health classification of Reddit posts over a strong text-only model, and how much does each method lose when trained on earlier posts and tested on later ones?

The anchor paper (Saeed & Ahmed, 2025) reports that adding posting time to a BiLSTM raises F1 from 0.7222 to 0.7376. That gain comes from a single run with no transformer baseline and no released code. We test whether it holds up, and whether models stay reliable on posts from a later period.

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
| Abhinav Pandey | Anchor reimplementation (Method C), timing ablation |
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
| Nov 2026 | Prototype: data pipeline + Method A (Milestone 1) | In progress |
| Nov 2026 | Full experiments: A, B, C, 5 seeds, time shift (Milestone 2) | Planned |
| Nov 2026 | Phase I conference-style report (LaTeX) | Planned |
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
