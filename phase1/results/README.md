# Milestone 1 results (prototype, Method A)

**One seed, 20k stratified sample. These are prototype numbers, not final findings.**

## Data used

The Kaggle dataset from the anchor paper was not available (it needs a Kaggle login), so the prototype runs on the public Low et al. (2020) Zenodo data instead. Differences from the plan:

- Six subreddits matching our six classes: depression, anxiety, bipolar, bpd, schizophrenia, and r/mentalhealth standing in for "mentalillness".
- Three windows, each Jan to Apr: 2018, 2019, 2020 (mid-COVID). The overlapping Nov 2018 to Nov 2019 file is not used.
- Dates are day-level only, so there is **no hour feature**. Time features are weekday, month, is_weekend and day of month.
- The data has authors, so test posts by authors seen in train are dropped in every split.

## Data funnel (`python phase1/src/prepare.py --n 20000`)

| Step | Rows |
|---|---|
| Raw (6 subreddits x 3 windows) | 181,002 |
| Drop empty / removed / deleted | 181,002 |
| Drop posts under 5 words | 180,981 |
| Remove subreddit mentions (4,907 posts had one) | 180,980 |
| Drop texts appearing under more than one label | 180,095 |
| Drop exact and near duplicates | 180,054 |
| Stratified sample (label x month) | 20,001 |

## Macro F1, Method A

| Method A | random | temporal_1y (2018→2019) | temporal (2018+19→2020) |
|---|---|---|---|
| majority baseline | 0.116 | 0.115 | 0.111 |
| time only | 0.092 | 0.111 | 0.112 |
| text only | 0.624 | 0.515 | 0.610 |
| text + time | 0.621 | 0.517 | 0.594 |

Split sizes (train / test): random 14,400 / 3,911, temporal_1y 4,040 / 7,005, temporal 10,388 / 8,370.

## What this shows

- **No leakage found.** Time-only is at the majority baseline, so weekday and month do not give away the class here. Top words per class are real content (drug names, symptoms), not subreddit names or boilerplate.
- **Timing adds nothing for Method A in this data.** Text + time is within 0.003 of text only on two splits and 0.016 lower on the third. No confidence intervals yet, so this is only a first look.
- **Text-only macro F1 is 0.51 to 0.62**, below the roughly 0.72 the anchor paper reports for its text models. Different data and class definitions, so not a like-for-like comparison.

## What this does NOT show yet

- **The shift drop is confounded with training size.** Training set sizes differ (14.4k random, 4.0k temporal_1y, 10.4k temporal), so the lower temporal_1y score may come from less training data, not from the time gap. Milestone 2 needs size-matched random splits.
- **Small classes are noisy.** Bipolar has only 78 training posts in temporal_1y and 65 test posts in the random split.
- **ECE changes with the chosen C, not with the split** (0.24 at C=1, 0.03 to 0.06 at C=10), so it is not evidence about the time shift.
- **One seed.** No confidence intervals, no significance tests.
- Condition names ("depression", "bpd") remain in the text and are the top words, so the task is easier than real detection. That is a limitation of subreddit labels.
- Not yet run: Methods B and C, the Kaggle data, hour features.

## Reproduce

```
pip install -r requirements.txt
bash phase1/data/download_data.sh depression anxiety bipolarreddit bpd schizophrenia mentalhealth
python phase1/src/prepare.py --n 20000
python phase1/src/splits.py
python phase1/tests/test_evaluate.py
python phase1/run.py --all
```
