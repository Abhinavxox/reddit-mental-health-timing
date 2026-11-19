# What we built, step by step

This explains what our code does, from raw data to final results, with the real numbers and real outputs. Read it from top to bottom once.

All code is in `phase1/`. Every step below has: **what it does**, **the file**, **what comes out**, and **how long it took**.

---

## The big picture

```
Kaggle data (701,787 posts)
  -> 1. clean and remove leakage          (prepare.py)
  -> 2. take a sample of 60,000 posts      (prepare.py)
  -> 3. split into train / validation / test (splits.py)
  -> 4. train 3 models, with and without time (models/, run.py)
  -> 5. score them                          (evaluate.py)
  -> 6. check which differences are real    (stats.py)
  -> 7. make figures and the demo           (make_figures.py, demo.py)
```

We did steps 2 to 6 **five separate times** (we call each one a *replicate*) with a fresh sample each time, so we can see how much results move by chance.

---

## Step 1. Cleaning and removing leakage

**File:** `phase1/src/prepare.py`

**What the data looks like:** each row is one Reddit post: a title, the body text, the time it was posted, and the subreddit it was posted in. The subreddit is the label we try to predict (depression, anxiety, bipolar, bpd, schizophrenia, mentalillness).

**What the code does, in order, and how many posts were left after each step:**

| Step | Why | Posts left |
|---|---|---|
| Raw file | | 701,787 |
| Drop posts marked NSFW | as in the anchor paper | 682,833 |
| Keep only 2021 and 2022 | as in the anchor paper | 519,952 |
| Drop empty, "[removed]" or "[deleted]" posts | nothing to read | 519,901 |
| Drop posts under 5 words | too short to classify | 493,958 |
| **Remove subreddit mentions** like "r/depression" or "this sub" (6,741 posts had one) | **leakage**: the post would name its own label | 493,919 |
| **Drop texts posted under two different labels** | **leakage**: they have two right answers | 488,755 |
| **Drop duplicates** | **leakage**: the same post could end up in train and test | 483,715 |

So yes, we removed leakage, and we kept **483,715 clean posts**.

How the leakage removal works in code, simply:
- Subreddit mentions: a text pattern (a "regular expression") finds things like `r/anything` or `this subreddit` and deletes them.
- Duplicates and cross-posts: each post's text is turned into a short fingerprint (lowercase, letters and numbers only, then hashed). Posts with the same fingerprint are copies. If copies have different labels we drop all of them; if the same label, we keep one.

The code also adds the **6 time features** for each post: month, day, weekday, is it a weekend, hour, is it working hours.

**Time taken:** about 2 to 4 minutes on the laptop, mostly reading the 700k-row file.

---

## Step 2. Taking a sample

**Same file:** `prepare.py`

We do not use all 483,715 posts for training, because it would take too long on a laptop and a free GPU. We take **60,000 posts**, picked so that each class and each month keeps the same share as in the full data. This is called a **stratified sample**.

What comes out (replicate 0):

```
class share, full clean data vs sample
                full  sample
anxiety        0.327   0.327
depression     0.289   0.289
bpd            0.198   0.198
bipolar        0.090   0.090
mentalillness  0.056   0.056
schizophrenia  0.040   0.040
```

**How to read it:** the two columns are the same, so the sample looks exactly like the full data. Note how small schizophrenia is (4%).

Output file: `data/processed/kaggle/rep0/sample.parquet` (not in the repo, the code makes it).

---

## Step 3. Splitting the data

**File:** `phase1/src/splits.py`

The model learns on **train**, we tune settings on **validation**, and we report scores only on **test**, which the model never saw.

| Split | Train | Validation | Test | Why |
|---|---|---|---|---|
| random | 43,200 | 4,800 | 12,000 | the anchor paper's setup |
| same-size random | 24,732 | 4,800 | 12,000 | same train size as the time split, so we can compare fairly |
| later period | 24,732 | 2,748 | 13,031 | train Nov 2021 to Jun 2022, test Aug to Nov 2022 |

The output is just lists of post ids, so every model uses exactly the same posts.

---

## Step 4. The three models

Each model is trained **twice**: once with only the text, once with text plus the 6 time features. That is the whole experiment.

### Method A: TF-IDF + logistic regression (`models/tfidf_lr.py`)

**How it works:**
1. **TF-IDF** turns each post into numbers: one number per word or word pair, high if the word is common in this post but rare in others. We keep the 50,000 most useful words and pairs.
2. **Logistic regression** learns a weight for each word and each class. A post's score for a class is the sum of the weights of its words.
3. It tries three strengths of regularisation (C = 0.1, 1, 10) and keeps the one that scores best on the validation set.

**What the output looks like.** We gave the trained model two made-up posts:

```
"My doctor raised my lamictal dose after a manic week and now I can't sleep"
   -> bipolar 1.00, mentalillness 0.00, anxiety 0.00

"I keep hearing voices at night and I'm scared to tell anyone"
   -> schizophrenia 0.92, mentalillness 0.02, bipolar 0.02
```

**How to read it:** for every post the model gives a probability for each of the 6 classes. The highest one is its answer. In the first post the words *lamictal* (a bipolar medication) and *manic* decide it.

We can also read which words it relies on most per class:

| Class | Top words |
|---|---|
| anxiety | anxiety, anxious, panic, scared |
| bipolar | bipolar, manic, mania, lamictal, lithium |
| bpd | bpd, fp, dbt, splitting |
| depression | depression, depressed, life |
| mentalillness | mental, mental illness, ocd, adhd |
| schizophrenia | schizophrenia, voices, delusions, hallucinations |

No subreddit names appear, which shows the leakage removal worked.

**Time taken:** about 40 seconds per run (text only) and about 75 seconds with time features, on the laptop.

### Method B: MentalRoBERTa (`models/roberta.py`)

**How it works:** MentalRoBERTa is a large language model that has already read millions of mental-health Reddit posts. We download it from Hugging Face, add one small output layer for our 6 classes, and train the whole thing a bit more on our posts (**fine-tuning**): 2 passes over 20,000 training posts, each post cut to 128 tokens. For the time version, the 6 time features are joined to the model's summary of the post before the output layer.

**Where it ran:** Google Colab, on a free Tesla T4 GPU (`phase1/notebooks/method_b_colab.ipynb`). On the Mac it was far too slow (20 training steps took 564 seconds).

**Time taken:** about **16 minutes per run** (955 to 1,018 seconds). 12 runs in total, about 3.3 hours. Colab disconnected once and we reran the lost replicate.

### Method C: BiLSTM with attention, the anchor paper's model (`models/bilstm_attn.py`)

**How it works:** each word becomes a learned vector. A BiLSTM reads the post left to right and right to left and remembers context. A second small LSTM reads the 6 time features. An attention layer decides how much to trust text vs time for each post, then a final layer picks the class. The paper gave no code, so we built it from the equations in the paper.

**Check that it works:** we made it memorise 300 posts; it reached 100%, so the network can learn.

**Time taken:** on the Mac GPU, usually 1 to 6 minutes per run (about 10 passes over the data before it stops improving). One run took over 2 hours because the laptop went to sleep.

---

## Step 5. Scoring (`evaluate.py`)

For each run the code compares the model's answers on the test set with the true labels and gives:

- **Accuracy:** share of posts labelled correctly.
- **Macro F1 (our main score):** F1 for each class, then averaged, so small classes like schizophrenia count as much as big ones. 1.0 is perfect, 0.145 is random guessing.
- **Weighted F1:** to compare with the anchor paper.

Example, one row of `results/kaggle/final/results.csv` in words: *Method A, text only, random split, replicate 0: trained on 43,200 posts, tested on 12,000, macro F1 0.641, weighted F1 0.741.*

---

## Step 6. Is a difference real? (`stats.py`)

Adding time might change the score by 0.002. Is that real or just luck? The code:

1. Resamples the 12,000 test posts with replacement 1,000 times (the **bootstrap**) and recomputes "score with time minus score without time" each time.
2. Takes the middle 95% of those 1,000 differences. That is the **95% interval**.
3. If the interval includes 0, there is **no real effect**.

What comes out (`results/kaggle/final/delta_time.csv`), later-period test:

```
Method A  -0.015  [-0.018, -0.013]   worse
Method B  -0.002  [-0.005, +0.001]   no real effect
Method C  +0.006  [+0.002, +0.010]   tiny gain
```

**How to read it:** the first number is the average change from adding time. The brackets are the interval. For A the whole interval is below 0, so time really made it worse. For B it includes 0, so no effect. For C it is above 0 but only half a point.

It also runs **McNemar's test**: on the same test posts, how many only model 1 got right vs only model 2. MentalRoBERTa beat both others with p < 0.001, so it really is better.

---

## Step 7. The final results

| Later-period test, text only | Accuracy | Macro F1 |
|---|---|---|
| A TF-IDF + LR | 0.741 | 0.636 |
| B MentalRoBERTa | 0.782 | 0.679 |
| C BiLSTM | 0.733 | 0.608 |

- Adding time: no reliable gain for any model.
- Later posts vs same-size random: about 0 for all three, so no loss on newer posts.
- Our rebuilt BiLSTM scored 0.730 weighted F1 text-only, the paper reported 0.722, so our rebuild matches. With time we got 0.730, the paper 0.738, so their gain did not appear.

---

## How long everything took

| Step | Where | Time |
|---|---|---|
| Cleaning and sampling, per replicate | Mac M2 | 2 to 4 min |
| Method A, one run | Mac M2 | 30 s to 2 min |
| Method C, one run | Mac M2 GPU | 1 to 6 min |
| Methods A and C, all 145 runs | Mac M2 | about 4 hours (overnight) |
| Method B, one run | Colab T4 GPU | about 16 min |
| Method B, all 12 runs | Colab T4 GPU | about 3.3 hours |
| Statistics and figures | Mac M2 | under 1 min |
| Live demo | Mac M2 | about 1 min each |

---

## Try it yourself

```
cd reddit-mental-health-timing
source .venv/bin/activate
cd phase1
python demo.py repro        # trains Method A live, then shows paper vs our results
python demo.py extension    # trains Method A with and without time, then shows all results
```
