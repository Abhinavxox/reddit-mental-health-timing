# Final presentation script (10 minutes)

| Presenter | Slides | Time |
|---|---|---|
| Sudesh | 1, 2, 3 | 2:30 |
| Xing | 4, 5 | 2:00 |
| Jaskamal (with Abhinav, demo 1) | 6 | 1:30 |
| Abhinav (demo 2) | 7, 8 | 2:30 |
| Zohaib | 9 | 1:00 |

Before the talk: open a terminal in the repo, run `source .venv/bin/activate`, and run both demos once so the data is cached. Slides after 9 are backup for questions.

## Slide 1: Project title and team (Sudesh, about 0:30)

Good morning. We are Group 2 and our project is Does Timing Matter?

On the slide you can see each of us and our part: Abhinav led and built Methods B and C, I did the statistics and the comparison with the papers, Jaskamal did Method A, Zohaib the explanations, and Xing the data.

## Slide 2: Problem overview and research motivation (Sudesh, about 1:00)

In the three boxes are WHO figures: 280 million people with depression, 301 million with anxiety, 727 thousand suicide deaths in 2021.

Our task, in the middle: classify a Reddit post into one of six mental-health communities, to help moderators sort posts. A human always decides.

In the box at the bottom is the claim we test. Saeed and Ahmed added posting time and reported 0.7222 to 0.7376, from one run, with no code. Our question: does timing really help over a strong text model, and do models get worse on later posts?

## Slide 3: Literature review and research gap (Sudesh, about 1:00)

Our group reviewed ten papers; this table shows the five core ones with the reviewer in brackets.

Low et al. gave our simple baseline. Cohan et al. showed these models miss many cases. Kumar et al. used time as the order of posts, and eRisk showed recall alone misleads.

The gap at the bottom: nobody tested the timing claim against a strong text model, with repeated runs, leakage control and a proper later-period test.

*Hand over: Xing will explain what we built.*

## Slide 4: Implemented research methodology (Xing, about 1:00)

This diagram is our actual workflow. Top row: 701,787 Kaggle posts, cleaned, then a stratified sample of 60,000 posts drawn five times, then three splits.

The same data goes into three models. A, TF-IDF with logistic regression. B, MentalRoBERTa, fine-tuned on a Colab GPU. C, the paper's BiLSTM, which we rebuilt from its equations because no code was released.

The orange bar is the experiment: each model is trained with text only and with text plus six time features. Nothing else changes. At the bottom, everything is scored the same way, with bootstrap intervals and McNemar tests.

## Slide 5: Dataset and experimental setup (Xing, about 1:00)

Cleaning took us from 701,787 to 483,715 posts. On the left are the leakage steps: we removed 6,741 subreddit mentions, cross-posts with two labels, and duplicates, and fitted everything on training data only.

In the table are our splits. Random is the paper's setup. Same-size random has the same training size as the later-period split, so any drop there comes from time, not less data.

In the box: our baselines start with random guessing at 0.145. Our main metric is macro F1, because schizophrenia is only 4 percent of posts and every class should count.

*Hand over: Jaskamal and Abhinav will show the reproduction.*

## Slide 6: Reproduction of existing methods (LIVE DEMO) (Jaskamal, about 1:30)

Here we compare the original published results with ours. The first two rows are the anchor paper's BiLSTM, which we rebuilt.

**Abhinav adds:** type  cd phase1 && python demo.py repro  . While it trains Method A live, about 50 seconds, explain: text only we get 0.730 against their 0.722, so the rebuild matches. With time we get 0.730 against their 0.738, so their gain does not appear.

**Abhinav adds:** Low et al. and MentalBERT used different datasets, so those rows are not directly comparable. Possible reasons for the gap are in the box: no code, so we chose embeddings and stopping ourselves, and the paper picked its best epoch on the set it reports. Point at the demo output table: paper versus ours.

## Slide 7: Comparative experimental evaluation (Abhinav, about 1:00)

Same posts, same splits, the later-period test. Dark bars are text only, orange is text plus time.

Each pair is almost the same height, so time barely changes anything. But changing the model matters: MentalRoBERTa is best, 0.782 accuracy and 0.679 macro F1, about four points above TF-IDF.

McNemar confirms B beats both others on the same posts. One limit: B had three replicates and a 20 thousand post training cap because of the free GPU.

## Slide 8: Extension experiment and research findings (LIVE DEMO) (Abhinav, about 1:30)

Run the demo:  python demo.py extension  . It trains Method A with and without time on the later period live, about a minute, and then prints the results over all replicates.

While it runs: each cell in the table is the gain from adding time with a 95 percent interval. White means no real effect, which is most cells. Orange means time made TF-IDF worse, minus 0.015. Green is a tiny gain for the weak BiLSTM only.

Later posts versus same-size random: about zero for all three. So our hypothesis that timing helps is not supported.

On the right: the paper's 2021 to 2022 split is confounded, because three classes only exist from November 2021. Our contribution is the first repeated, leakage-controlled test of this claim, and finding that confound.

*Hand over: Zohaib will conclude.*

## Slide 9: Conclusion and Phase II direction (Zohaib, about 1:00)

On the left are our findings: timing is not a reliable signal, the model choice matters far more, later posts were not harder, and the paper's time split is confounded.

Our limits: labels are subreddits not diagnoses, there is no author column, the time window is short, and B used a smaller training set.

On the right is how this guides Phase II: a moderator triage assistant using the strongest text model without time features. Each flag will be explained with its key words, like lamictal for bipolar or voices for schizophrenia, and we will warn that mentalillness posts are often confused with depression. A human always makes the final call.

Thank you, we are happy to take questions.
