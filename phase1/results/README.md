# Milestone 1 results (prototype, Method A)

**One seed, 20k stratified sample. No confidence intervals yet. These are prototype numbers, not final findings.**

Method A is TF-IDF + logistic regression. C is tuned on a validation set drawn from the training period.

## Data

Both datasets were run through the same pipeline (`python phase1/src/prepare.py --source kaggle|zenodo`).

- **Kaggle** *Mental Disorders Identification (Reddit)*: the anchor paper's data. 701,787 posts, 6 classes, full timestamps (hour available), no author column.
- **Zenodo** Low et al. (2020): 6 matching subreddits in Jan to Apr windows of 2018, 2019 and 2020 (mid-COVID). Day-level dates only (no hour). Has authors, so test posts by authors seen in train are dropped.

Kaggle data funnel:

| Step | Rows |
|---|---|
| Raw | 701,787 |
| Drop NSFW | 682,833 |
| Keep 2021 and 2022 (as in the anchor paper) | 519,952 |
| Drop empty / removed / deleted | 519,901 |
| Drop posts under 5 words | 493,958 |
| Remove subreddit mentions (6,741 posts had one) | 493,919 |
| Drop texts appearing under more than one label | 488,755 |
| Drop exact and near duplicates | 483,715 |
| Stratified sample (label x month) | 20,002 |

## Splits

| Split | Train / test (Kaggle) | Meaning |
|---|---|---|
| `random` | 14,400 / 4,001 | Stratified 80/20. Comparable with the anchor paper. |
| `random_matched` | 8,244 / 4,001 | Same test, train shrunk to the size of `temporal_late` |
| `temporal_late` | 8,244 / 4,345 | Train Nov 2021 to Jun 2022, test Aug to Nov 2022. **The valid time-shift test.** |
| `temporal_2021_22` | 6,580 / 12,690 | Train 2021, test 2022. **Confounded, see below.** |

## Macro F1, Kaggle data

| Method A | random | random_matched | temporal_late | temporal_2021_22 |
|---|---|---|---|---|
| majority baseline | 0.082 | 0.082 | 0.089 | 0.065 |
| uniform random guess | 0.145 | 0.145 | 0.135 | 0.148 |
| time only | 0.156 | 0.144 | 0.133 | 0.102 |
| text only | 0.636 | 0.618 | 0.626 | 0.467 |
| text + time | 0.628 | 0.606 | 0.611 | 0.228 |
| text + time, no month/day | 0.635 | 0.609 | 0.617 | 0.494 |

Weighted F1 (the anchor paper's recall equals its accuracy, which suggests it reports weighted averages): text only 0.731, text + time 0.727 on `random`. The paper reports 0.7222 for its best text-only BiLSTM and 0.7376 for its text + time model.

## What this shows

1. **We roughly match the anchor paper's text-only level with a much simpler model.** TF-IDF + logistic regression reaches 0.731 weighted F1 on a random split. Different sample size and filters, so not a strict reproduction.
2. **Timing adds nothing for Method A.** Text + time is 0.008 to 0.015 macro F1 below text only on the three valid splits. Single seed, so we cannot call it significant, but there is no sign of a gain.
3. **No leakage from time on valid splits.** Time-only sits at the uniform random guess (0.145). The majority baseline is not the right chance level for macro F1.
4. **The valid time shift costs almost nothing.** Text only: 0.618 on `random_matched` vs 0.626 on `temporal_late`, the same training size. No drop for this model across Nov 2021 to Nov 2022.
5. **The 2021 to 2022 split is not a language-drift test.** In this Kaggle file, depression, bipolar and schizophrenia posts essentially do not exist before Nov 2021 (0 share per month Jan to Oct 2021, then 6 to 46% from Nov 2021). The class mix changes completely, with only 694 depression posts in the 2021 sample against 5,083 in 2022. Text + time collapses there (0.228) because month features learned that mapping from 2021, and dropping month and day recovers it (0.494). This is a collection artifact, and it is relevant to the anchor paper, which uses the same 2021 to 2022 data.
6. **Top words per class are clean** (drug names, symptoms, therapy terms), with no subreddit names or boilerplate. Condition names such as "depression" and "bpd" remain, which makes the task easier than real detection. The mentalillness class is noisy.

## Zenodo data (macro F1)

| Method A | random | random_matched | temporal_1y (2018→2019) | temporal (2018+19→2020, COVID) |
|---|---|---|---|---|
| majority baseline | 0.116 | 0.116 | 0.115 | 0.111 |
| uniform random guess | 0.134 | 0.134 | 0.126 | 0.124 |
| time only | 0.092 | 0.082 | 0.111 | 0.112 |
| text only | 0.624 | 0.610 | 0.515 | 0.610 |
| text + time | 0.621 | 0.610 | 0.517 | 0.594 |
| text + time, no month/day | 0.618 | 0.609 | 0.509 | 0.607 |

Train / test: random 14,400 / 3,911, random_matched 10,388 / 3,911, temporal_1y 4,040 / 7,005, temporal 10,388 / 8,370. Here the COVID shift costs nothing (0.610 vs 0.610 at matched size), and the lower 2018→2019 score is a small-training-set effect (4,040 posts). Time features give no gain.

## Limitations

- One seed, no confidence intervals or significance tests. Milestone 2.
- The Kaggle file has no authors, so same-user leakage across train and test cannot be checked there.
- C is tuned on a validation set from the training period, which cannot see a time shift.
- Small classes are noisy (for example 98 schizophrenia posts from 2021 in the sample).
- Labels are subreddits, not diagnoses.
- Not yet run: Methods B and C.

## Reproduce

```
pip install -r requirements.txt
kaggle datasets download -d kamaruladha/mental-disorders-identification-reddit-nlp -p phase1/data/raw --unzip
python phase1/src/prepare.py --source kaggle --n 20000
python phase1/src/splits.py --source kaggle
python phase1/tests/test_evaluate.py
python phase1/run.py --source kaggle --all
```

For Zenodo, run `bash phase1/data/download_data.sh depression anxiety bipolarreddit bpd schizophrenia mentalhealth` and use `--source zenodo`.
