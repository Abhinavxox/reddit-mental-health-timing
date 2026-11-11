# Questions we may be asked, with simple answers

Read this once together before Friday. Every member should be able to answer the first section, and their own section in depth.

---

## 1. The big picture (everyone)

**What is your project in one sentence?**
We tested whether knowing *when* a Reddit post was written (hour, weekday, month) helps an AI tell which mental-health community it came from, and whether models still work on posts from a later period.

**Why this problem?**
Many people describe distress online before seeing a doctor, and volunteer moderators cannot read every post. A model that sorts posts could help them. It would support a human, never diagnose.

**What was the anchor paper and what did it claim?**
Saeed and Ahmed (2025). They added posting-time features to a BiLSTM and reported F1 going from 0.7222 to 0.7376. That was one run, with no strong baseline and no released code.

**What is your research question?**
Do posting-time features significantly improve classification over a strong text-only model, and how much does each method lose when trained on earlier posts and tested on later ones?

**What did you find?**

1. Timing does not reliably help. For the best model the change is zero.
2. The text model matters much more. MentalRoBERTa gets 0.68 macro F1, TF-IDF 0.64, the BiLSTM 0.61.
3. Later posts were not harder within Nov 2021 to Nov 2022.
4. The paper's 2021 to 2022 data has a problem: three classes only appear from Nov 2021, so that split tests a change in how the data was collected, not a change in language.

**So was the paper wrong?**
We could not reproduce its gain. Our rebuild of their model matched their text-only score (0.730 vs 0.722) but adding time gave no gain (0.730 vs 0.730). We say "not reproduced", not "wrong", because they released no code and some details differ.

**Is a "no" result useful?**
Yes. It tells people not to add timing features expecting a gain, and to check data collection before trusting a time split.

---

## 2. Data (Xing leads, everyone should know)

**What data did you use?**
The Kaggle "Mental Disorders Identification (Reddit)" dataset, 701,787 posts from 6 subreddits: depression, anxiety, bipolar, BPD, schizophrenia, mentalillness. The same data the anchor paper used.

**What is the label?**
The subreddit the post was written in. It is *not* a medical diagnosis. We say this as a limitation.

**How did you get it?**
Downloaded with the Kaggle API using a personal token, on the laptop and on Colab. The data is not stored in our repo; the code downloads it.

**What did you clean?**
Kept 2021 and 2022 like the paper, dropped NSFW posts, empty or deleted posts, and posts under 5 words. Left 483,715 posts.

**What is data leakage?**
When the model can "cheat", seeing the answer in the input or the same post in training and test. Then the score looks better than the model really is.

**What leakage did you remove?**

- Subreddit mentions like "r/depression" or "this sub" (6,741 posts had one). The text would name its own label.
- The same text posted under two different labels (cross-posts), because it has two right answers.
- Duplicate posts, so the same post cannot be in both train and test.
- Everything (vocabulary, scaling, tuning) is fitted on training data only.

**Did removing leakage change the score?**
Hardly. 0.620 with cleaning, 0.620 to 0.624 without. Leakage was only about 3% of posts. We keep the cleaning because it makes the score trustworthy, not because it raises it.

**What leakage could you NOT check?**
The Kaggle file has no author column, so the same person could have posts in train and test. We state this.

**Why did you not remove words like "depression" from the text?**
They are real content and a real tool would see them. Removing them would change the task. It makes the task easier, which we state as a limitation.

**What is stratified sampling and why use it?**
Taking the same share of each class from each month, so the sample looks like the full data. We used 60,000 posts per replicate. A test showed it scores the same as a plain random sample at this size (0.623 vs 0.624). Its value is guaranteeing every class and month is present, which the time splits need. Making classes equal size instead scored worse (0.607) because it hides the real class mix.

**Why not use all 483k posts?**
Time and memory on a free GPU and an 8 GB laptop. 60k posts per replicate times 5 replicates was enough for tight confidence intervals.

---

## 3. Splits (Xing)

**What splits did you use?**

- Random (80/20): the paper's setup.
- Same-size random: random, but the training set is cut to the size of the time split.
- Later period: train on Nov 2021 to Jun 2022, test on Aug to Nov 2022.
- 2021 to 2022 (the paper's idea): kept but marked as confounded.

**Why the same-size random split?**
The later-period split has less training data. If its score is lower, is that because of time or because of less data? Comparing it with a random split of the same size separates the two.

**Why not train 2021, test 2022 like the paper?**
In this file depression, bipolar and schizophrenia posts basically start in Nov 2021. So a 2021 model has almost never seen them. That measures a collection change, not language change. Adding month features there collapses the score (0.565 to 0.248) because the model learns "these months mean these classes".

**Where is the validation set from?**
10% of the training set. Used to tune settings and stop training. The test set is never used for any decision.

---

## 4. Metrics (Sudesh leads, everyone should know)

**Why macro F1 as the main metric?**
Macro F1 gives every class equal weight. Schizophrenia is only 4% of posts and anxiety is 33%. With accuracy, a model could ignore the small classes and still look good. In mental health the small classes matter, so we want a metric that punishes ignoring them.

**What are precision, recall and F1, simply?**

- Precision: of the posts we flagged as depression, how many really were.
- Recall: of all the real depression posts, how many we found.
- F1: one number that is high only when both are high (their harmonic mean).
Example: 100 posts, 10 are depression. The model flags 8, of which 6 are right. Precision 6/8 = 0.75, recall 6/10 = 0.6, F1 = 0.67.

**Why also report accuracy and weighted F1?**
To compare with the anchor paper. Its recall equals its accuracy exactly, which happens with weighted averaging, so its 0.7376 is a weighted F1.

**What is the chance level?**
A random guess gives about 0.145 macro F1. Time features alone scored 0.15, so time by itself carries almost no signal.

**Why not use accuracy only?**
It hides poor performance on small classes. A review we read (Cao et al. 2024) found many studies make exactly this mistake.

---

## 5. Methods (each owner leads)

**Why these three methods?**

- A, TF-IDF + logistic regression (Jaskamal): the simple classic baseline used by Low et al. Fast, and hard to beat.
- B, MentalRoBERTa (Abhinav): a transformer pretrained on mental-health Reddit. The strong text model the anchor paper never compared with.
- C, BiLSTM with cross-modal attention (Abhinav): the anchor paper's own model, which we rebuilt.

**How does TF-IDF work?**
It turns a post into a list of word and word-pair scores. Words common in this post but rare overall get high scores. Logistic regression then learns which words point to which class.

**What is MentalRoBERTa and what does fine-tuning mean?**
RoBERTa is a language model that read huge amounts of text. MentalRoBERTa read extra mental-health Reddit posts. Fine-tuning means we added a small classification layer on top and trained the whole thing a little more on our labelled posts (2 epochs, learning rate 2e-5).

**What is a BiLSTM and the attention part?**
An LSTM reads words in order and remembers context. "Bi" means it reads left to right and right to left. The paper adds a second LSTM over the 6 time features and an attention layer that learns how much to trust text vs time for each post.

**How did you add time features to each model?**

- A: one-hot encoded weekday, month, hour, and flags, joined to the TF-IDF features.
- B: the 6 time features scaled to 0 to 1 and joined to the [CLS] vector before the last layer.
- C: exactly as the paper: an LSTM over the 6 features, then attention.
Every model was trained twice, text only and text + time, everything else identical.

**The paper had no code. How did you rebuild C?**
From the equations and settings in the paper: vocabulary 10,000, 100 tokens, embedding 128, BiLSTM 64, dropout 0.6, RMSprop. Where the paper was unclear we made a choice and logged it in `logs/decision_log.md` (22 decisions for C).

**How do you know your BiLSTM code works?**
A sanity test: the network must memorise 300 posts perfectly. All variants reached 100%. And its text-only score matched the paper (0.730 vs 0.722).

**Why did you use class weights in A but not in C?**
C is a reproduction, and the paper does not mention class weights, so we stayed faithful. That is one reason C is weaker on small classes.

**How were settings tuned?**
A: regularisation C chosen from 0.1, 1, 10 on the validation set. B and C: best epoch on the validation set (early stopping). Same budget for text and text + time.

**Why only 2 epochs for B?**
Transformers fine-tune quickly and overfit after a few epochs. Also the free GPU budget. Each run took about 16 minutes.

---

## 6. Statistics and comparison with the papers (Sudesh)

**What is a replicate?**
A fresh 60k sample, a fresh split, and a fresh model start. We did 5 for A and C, 3 for B. It shows how much results move by chance.

**What is the bootstrap confidence interval?**
We resample the test posts with replacement 1,000 times and recompute the difference each time. The middle 95% of those differences is the interval. If it includes 0, we cannot say the change is real.

**Why "paired"?**
Text-only and text + time are scored on the same test posts, so we resample the same posts for both. That removes noise from which posts were picked.

**What is McNemar's test?**
It compares two models on the same posts: how many posts only model 1 got right vs only model 2. If those counts are very uneven, one model is really better. MentalRoBERTa beat both others with p < 0.001.

**Is a +0.005 gain for the BiLSTM real?**
The interval excludes 0, so it is probably real, but it is half a point and only for the weakest model. On the paper's own random split it is zero. Not useful in practice.

---

## 6b. What the model looks at (Zohaib)

**How do you know what the model uses to decide?**
For Method A we can read the weights directly: for each class, the words with the biggest positive weight. They are sensible, for example drug names and symptom words, and no subreddit names, which also tells us the leakage removal worked.

**Which classes get confused?**
From the confusion matrix (Method A, later-period test): mentalillness is hardest, only about 1 in 4 of its posts are found, because it is a general community. Depression acts as a catch-all: posts from BPD (408), anxiety (335) and bipolar (246) are most often wrongly sent there.

**Why does this matter?**
A moderator needs to know why a post was flagged. Showing the key words is a simple, honest explanation. This is the starting point for Phase II.

## 7. Results numbers to remember

| Later-period test, text only | Accuracy | Weighted F1 | Macro F1 |
|---|---|---|---|
| A TF-IDF + LR | 0.741 | 0.740 | 0.636 |
| B MentalRoBERTa | 0.782 | 0.776 | 0.679 |
| C BiLSTM | 0.733 | 0.722 | 0.608 |

Change from adding time (macro F1, later period): A -0.016 (worse), B -0.002 (no change), C +0.006 (tiny).
Later period vs same-size random: about 0 for all three.

**Why is macro F1 lower than accuracy?**
The big classes (anxiety, depression) are easier. Macro F1 counts the hard small classes (mentalillness, schizophrenia) equally, which pulls it down.

**Which classes are hardest?**
mentalillness, because it is a general community that overlaps with all others.

---

## 8. Tools and compute (Abhinav)

**What did you run it on?**

- MacBook with Apple M2 chip and 8 GB memory: data prep, Method A, Method C (using the Mac GPU through PyTorch "MPS"). A Method C run took about 70 seconds to 6 minutes.
- Google Colab with a free Tesla T4 GPU: Method B. About 16 minutes per run, 12 runs.
- Kaggle: source of the dataset, downloaded with the Kaggle API.
- Hugging Face: source of the MentalRoBERTa weights (gated, we accepted the terms).
- GitHub: code, results, logs.

**Why not run B on the laptop?**
We measured it: 20 training steps took 564 seconds on the Mac, and a run needs about 2,500 steps. Not feasible.

**Any problems along the way?**

- Colab disconnected once during the night and we lost one unfinished replicate. We reran it; the reruns gave identical scores because seeds are fixed.
- An early Method C version was 6x too slow on the Mac GPU because of one PyTorch function (sequence packing). We removed it, with the same score.
- A bug in our split code once hid a crash and left an old file. We caught it because results did not change, fixed it, and reran everything.

**Is it reproducible?**
Yes. Fixed seeds, all code and settings in the repo, every prediction file saved, and the README lists the commands.

---

## 9. Use of AI tools (everyone, be honest)

**Did you use AI tools?**
Yes. We used AI coding assistants to help write and debug code and to draft text. The course allows this. We designed the study, made the decisions, ran the experiments, checked every result and can explain every step.

**How did you make sure the AI did it right?**

- Tests with known answers (the F1 example, the bootstrap and McNemar tests, the memorisation test).
- Sanity checks: time-only scores sit at chance, top words per class make sense.
- Results checked against the paper's reported numbers.
- Every design choice written in the decision log with the reason.
- When something looked wrong (results not changing, a run far too slow) we investigated instead of trusting it.

---

## 10. Responsibilities

| Member | Responsibility | Papers reviewed |
|---|---|---|
| Abhinav Pandey (lead) | Coordination, repo, Method C, Method B runs on Colab, timing ablation, report | Saeed & Ahmed 2025, MentalBERT |
| Thotagamuwage Sudesh Nimesha | Statistics, interpretation, comparison with the papers | Low et al. 2020, Cao et al. 2024 |
| Jaskamal | Method A (TF-IDF + logistic regression) | Cohan et al. 2018, Kamarudin et al. 2025 |
| Zohaib Jawaid | Model explanations: top words, confused classes | Kumar et al. 2024, Menta 2025 |
| Xing Liao | Data loading, leakage removal, stratification, splits | Parapar et al. 2025 (eRisk) |

Phase II (interface, explanations, ethics) is shared by everyone.

**How did you coordinate?**
GitHub repo with a shared TODO, a weekly log table, personal logs and a decision log.

---

## 11. Harder questions

**Your labels are subreddits. Isn't that a weak label?**
Yes. A post in r/anxiety is not a diagnosis. We frame the output as a "community signal", not a diagnosis. That is why Phase II keeps a human in charge.

**Could time help at the user level instead of per post?**
Possibly. Kumar et al. 2024 found post order matters for a user's history. We tested single posts with timestamps, like the anchor paper. User-level time is future work.

**Why only 9 months for the time shift?**
Because of the collection problem: all six classes only exist together from Nov 2021. A longer window would need another dataset.

**Why is your text-only score slightly higher than the paper's?**
Different sample, our cleaning, early stopping on a separate validation set. A small difference (0.8 points) within the ±3 points we set as the goal.

**What would you do with more time?**
Run B on all splits with 5 replicates, test same-user leakage on a dataset with authors, try user-level time features, and report calibration and per-class recall in more depth.

**What is the ethical risk of this kind of model?**
False alarms and missed posts both cause harm, labels are not diagnoses, and posts are personal. The tool should only help a human moderator prioritise, with explanations, and never act alone.
