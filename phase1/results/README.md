# Milestone 2 results (final runs: Methods A and C, 5 replicates)

**5 replicates, each a fresh 60k stratified sample, fresh split and fresh model initialisation. Mean over replicates, 95% paired bootstrap intervals (1000 resamples), plus a t-test over the replicates (Holm-corrected) to check that a difference holds from run to run. Method B (MentalRoBERTa) has 3 replicates on `random_matched` and `temporal_late` only (20k training subsample, Colab).** Raw tables are in `final/` (`summary.csv`, `delta_time.csv`, `delta_shift.csv`, `mcnemar.csv`), figures in `phase1/figures/`.

## Macro F1 (mean of 5 replicates)

| Model | Features | random | random_matched | temporal_late |
|---|---|---|---|---|
| A TF-IDF + LR | text | 0.642 | 0.636 | 0.636 |
| A TF-IDF + LR | text + time | 0.643 | 0.633 | 0.620 |
| C BiLSTM | text | 0.630 | 0.609 | 0.608 |
| C BiLSTM | text + time (attention) | 0.630 | 0.614 | 0.614 |
| C BiLSTM | text + time (concat) | 0.632 | 0.605 | 0.605 |
| B MentalRoBERTa | text | not run | 0.671 | 0.679 |
| B MentalRoBERTa | text + time | not run | 0.671 | 0.677 |

Weighted F1 on `random`: A text 0.741, A text + time 0.743, C text 0.730, C text + time 0.730. The anchor paper reports 0.7222 (text) and 0.7376 (text + time).

## Change in macro F1 from adding time features (95% CI)

| Model | random | random_matched | temporal_late |
|---|---|---|---|
| A | +0.001 [-0.001, +0.003] | -0.003 [-0.006, -0.001] | **-0.016 [-0.018, -0.013]** |
| C attention | -0.001 [-0.005, +0.004] | +0.005 [+0.001, +0.009] | +0.006 [+0.002, +0.010] |
| C concat | +0.002 [-0.003, +0.006] | -0.004 [-0.007, +0.000] | -0.003 [-0.007, +0.001] |
| B | not run | +0.000 [-0.003, +0.003] | -0.002 [-0.005, +0.001] |

Bold: the only change that also holds across replicates (see the check below).

**Does it hold from run to run?** The bootstrap interval only measures which test posts were drawn. It does not see that a fresh sample, split and initialisation can move the result. For each text + time comparison whose bootstrap interval excludes 0, the table below also gives a 95% t interval over the per-replicate changes and the Holm-corrected p-value over all 16 comparisons in `final/delta_time.csv`.

| Model | Split | Change | Bootstrap CI | Replicate CI | Holm p | Holds? |
|---|---|---|---|---|---|---|
| C attention | random_matched | +0.005 | [+0.001, +0.009] | [-0.005, +0.015] | 1.00 | no |
| C attention | temporal_late | +0.006 | [+0.002, +0.010] | [-0.001, +0.013] | 0.77 | no |
| A | random_matched | -0.003 | [-0.006, -0.001] | [-0.006, -0.000] | 0.63 | no |
| A | temporal_late | -0.016 | [-0.018, -0.013] | [-0.019, -0.012] | 0.005 | **yes** |
| A | temporal_2021_22 (confounded) | -0.318 | [-0.321, -0.315] | [-0.348, -0.287] | < 0.001 | yes |

The BiLSTM's per-replicate changes range from -0.008 to +0.012 on `random_matched` and from +0.000 to +0.013 on `temporal_late`, so its gain depends on the run.

## What this shows

1. **The anchor paper's timing gain is not reproduced.** On the random split (the paper's setup) time features change macro F1 by an amount whose interval includes 0 for every model. The +0.005 and +0.006 for the weaker BiLSTM with attention fusion do not hold across replicates. The only reliable effect of time features is a loss: -0.016 for TF-IDF on `temporal_late`.
2. **The valid time shift costs nothing measurable.** `temporal_late` minus `random_matched` (text only): BiLSTM -0.001 [-0.008, +0.006], TF-IDF -0.001 [-0.007, +0.006], MentalRoBERTa +0.009 [-0.000, +0.017].
3. **MentalRoBERTa is the best text model** (about 0.68 vs 0.64 TF-IDF vs 0.61 BiLSTM), and time adds nothing to it. McNemar's exact test is run on each replicate, because `temporal_late` has the same test posts in every replicate and pooling would count each post five times. MentalRoBERTa beats both other models in every replicate (largest p < 0.001). **TF-IDF + LR and the BiLSTM are about equal.** Which of the two gets more posts right changes between replicates (on `random_matched` one replicate favours the BiLSTM and two favour TF-IDF), and no direction holds in every replicate (Holm-corrected largest p 0.33 to 1.00).
4. **The 2021 to 2022 split stays confounded.** Method A text + time falls to 0.248 there, and 0.543 without month and day (text only 0.565).
5. **Time alone is at chance** (0.15 on random, uniform random guess 0.145).

## Limits of these results

- Method C is our rebuild from the paper's equations (no code released), every choice is in `logs/decision_log.md`.
- Kaggle has no author column, same-user leakage cannot be checked there.
- Labels are subreddits, not diagnoses. Condition names stay in the text (D3).
- One run (BiLSTM, concat, rep 4) took far longer than the others because the laptop was busy. Scores are unaffected.

## Comparison with the papers

Weighted F1, because that is what the papers report. Ours is the mean over replicates.

| Paper | Their model and data | Their number | Our closest number | Comparable? |
|---|---|---|---|---|
| Saeed & Ahmed 2025 (anchor) | BiLSTM, text only, Kaggle 2021 to 2022, 6 classes, one random split | 0.7222 | C text only, `random`: 0.730 (replicates 0.721 to 0.740) | Yes, mostly |
| Saeed & Ahmed 2025 (anchor) | BiLSTM + time (cross-modal attention), same split | 0.7376 (+0.015) | C text + time, `random`: 0.730 (change -0.001) | Yes, mostly |
| Low et al. 2020 | SGD linear model on TF-IDF + LIWC + sentiment (346 features), 15 subreddits | 0.851 | A text only: Kaggle `random` 0.741, Zenodo `random` 0.740 (Milestone 1, one seed) | No |
| Ji et al. 2022 (MentalBERT) | MentalRoBERTa fine-tuned, SWMH (5 subreddits) and other benchmarks | 72.16 F1 | B text only, `random_matched`: 0.765 | No |

**Anchor paper.** This is the one comparison that is close to like for like: the same Kaggle file, the same 2021 to 2022 filter, the same six classes and a stratified random split. Our differences are a 60k sample, leakage cleaning, and early stopping on a separate validation set (the paper picks the epoch on the set it reports). Our text-only BiLSTM lands at the paper's level, so the rebuild is sound. The time gain is where we differ. Their +0.015 comes from one split. Across our five replicates the text-only BiLSTM alone moves from 0.721 to 0.740, a spread larger than the whole claimed gain, and pairing any one of our text-only runs with any one text + time run gives a "gain" anywhere from -0.018 to +0.013. A single-split difference of 0.015 is therefore within what we see from run-to-run noise, and with replicates the gain is -0.001.

**Low et al.** Their 0.851 is higher than our 0.74, but the task is different: 15 subreddits, many of them more distinct from each other than ours (for example addiction, autism, ADHD), with LIWC and sentiment features added, and posts from 2018 to 2020. Our label set has a general mentalillness class that overlaps with every other class (see "What the model looks at"). We use their method (TF-IDF + linear model) and their Zenodo data, not their number. On the six Zenodo subreddits that match ours, the same TF-IDF model gives 0.740, the same as on Kaggle.

**MentalBERT.** Ji et al. report MentalRoBERTa on other benchmarks (for example 72.16 on SWMH and 93.38 on eRisk), not on this Kaggle data, so their scores cannot be compared with ours. What carries over is the ranking: the domain-pretrained transformer is the strongest text model in their paper and in ours, by about 0.04 macro F1 over TF-IDF here. The anchor paper did not include such a baseline.

**What we add over all three.** None of the papers repeat runs or test significance. Our main claims (no timing gain, no loss under the valid time shift, MentalRoBERTa best) hold across replicates. The anchor paper's claim does not.

## What the model looks at

Method A (TF-IDF + logistic regression, text only) gives each word a weight per class, so we can read off the words it relies on most (`final/top_words_random.json`) and see which classes it mixes up (`phase1/figures/fig5_confusion_A_temporal_late.png`).

**Top words per class**

| Class | Top words |
|---|---|
| anxiety | anxiety, anxious, panic |
| bipolar | bipolar, manic, lamictal |
| bpd | bpd, fp ("favourite person"), dbt |
| depression | depression, depressed, suicide |
| mentalillness | mental, ocd, adhd |
| schizophrenia | schizophrenia, voices, delusions |

The model mostly looks for the name of the condition, plus medications (lamictal), symptoms (panic, voices, delusions) and therapy (dbt). It finds people *saying* what they have, which is easier than spotting risk from how someone writes. Labels are subreddits, not diagnoses.

**The two classes most often confused**

1. **mentalillness is taken for depression** (35% of mentalillness posts). It is a general subreddit where people write about many conditions, so it has no words of its own.
2. **bpd is taken for depression** (18% of bpd posts).

In both cases the errors go into depression, the largest class: when the model is unsure, it picks depression.

---

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
- Methods B and C were not run at this stage (see the Milestone 2 section above).

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
