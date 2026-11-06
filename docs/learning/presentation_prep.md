# Presentation prep (Group 2, Does Timing Matter?)

## 1. The whole project in 30 seconds

Say this if you only remember one thing:

> People often talk about their mental health on Reddit before they ever see a doctor. A 2025 paper says an AI can spot conditions like depression better if it also knows *when* a post was made, for example late at night. But its improvement is tiny, about 1.5 points, from a single run, and it never compared against a strong modern model. So we test two things. First, does posting time really help? Second, do these models still work on posts from a later year? We compare three methods on the same data under the same rules.

**Our project in one line:** we're not building a fancier model. We're checking whether a published claim actually holds up.

---

## 2. How to present (9 to 10)

**Delivery tips**
- Talk to the room, not the slide. The slides already show the numbers, so your job is to say *why they matter*.
- Each slide should take about 1 minute. Say its headline sentence first, then one or two details.
- Use the same three words all the way through: **timing**, **text only**, **later period**.
- If you don't know an answer, say "That's something we'll measure in the experiments." That's true, since we have no results yet.
- Pause after the research question slide. It's the most important one.

**What to say on each slide (one simple line each)**

| Slide | Say this |
|---|---|
| 1 Title | We're Group 2. Our question is whether *when* someone posts helps an AI detect mental-health risk. |
| 2 Problem | Hundreds of millions of people live with depression and anxiety, and many talk about it online before seeing anyone. |
| 3 Who / why AI | Moderators can't read every post. AI can help, but only if we can trust it. Our angle is checking that trust. |
| 4–5 Literature | Five core papers. The key one is Saeed and Ahmed. Its gain is small and untested, and nobody tests models on later data. |
| 6 Gap | Two gaps: does timing really help, and does the model hold up on future posts. |
| 7 RQ | Read the question slowly. Then say: either answer is a valid finding. |
| 8 Objectives | Reproduce, test timing, test time shift. |
| 9 Methodology | Same data, same splits. Only the model and the time input change. |
| 10 Dataset | Kaggle Reddit, 700k posts. We start with a 50 to 100k sample. Zenodo for before and during COVID. |
| 11 Setup | Fair comparison: every model gets a text-only version. We measure with macro F1 and use 5 seeds. |
| 12 Reproduction | Three methods: A is simple, B is the strong modern one, C is the paper's own model, which we rebuild from scratch. |
| 13–14 Extension | Change one thing at a time. No results yet, and we're honest about that. |
| 15–17 Timeline, team, feasibility | Everything is free and open, and it runs on Colab. Each of us owns one piece. |

Check the slide order in the PDF before presenting. The page numbers jump: "12/18" appears before "10/18".

---

## 3. The data: what we're actually doing

**Main dataset:** Kaggle *Mental Disorders Identification (Reddit)*, about 701k posts.
- Each post has a **title**, **body text**, **timestamp** and **subreddit**.
- **The label is the subreddit.** If a post came from r/depression, its label is "depression".
- 6 classes: depression, anxiety, bipolar, BPD, schizophrenia and mentalillness.

**Second dataset:** Low et al. on Zenodo. It's public domain, 3.1 GB, covers 28 subreddits and is split into **before COVID** and **during COVID**. It's perfect for the "later period" test.

**What we do with it, step by step:**
1. **Clean:** join title and body, drop deleted or NSFW posts, and remove duplicates.
2. **Remove cheats:** delete subreddit names like "r/depression" from the text, otherwise the model just reads the answer.
3. **Make timing features** from the timestamp: hour, weekday, month, weekend and working hours.
4. **Sample:** take a stratified 50 to 100k subset, meaning the same mix of classes in each month, so training is fast.
5. **Split by time:** train on 2021 and test on 2022. On Zenodo, train on before-COVID and test on during-COVID.
6. **Train** each of the three models twice, with and without timing.
7. **Compare** with the same metrics and 5 random seeds, plus confidence intervals.

---

## 4. My two papers

### Paper 1: Saeed and Ahmed (2025), our anchor paper
- **What it does:** classifies Reddit posts into mental-health categories using **text plus posting time**.
- **How it works:**
  - The text goes into a **BiLSTM**, a network that reads the sentence forwards and backwards.
  - The six time features go into a small **LSTM**.
  - An **attention** layer decides how much to trust text vs time for each post, mixes the two, and predicts the class.
- **Result:** F1 of 0.7376 vs 0.7222 for text only, so **+1.5 points**.
- **Problems:**
  - It's one run with no repeats, so the gain could be luck.
  - There's no strong transformer to compare against, and no code.
  - The month feature might **leak** the label, because each subreddit's post count changes over the months.
  - It's not really "early" detection, because each post is judged alone with no user history.
- **Why it matters to us:** it's the claim we test, and its model is our **Method C**.

### Paper 2: Ji et al. (2022), MentalBERT
- **What it does:** takes BERT and RoBERTa (big language models) and **keeps training them on mental-health Reddit posts** so they understand that kind of language better. They're released free as MentalBERT and MentalRoBERTa.
- **How:** "masked language modelling". The model hides words in sentences and learns to guess them, about 13.6M sentences.
- **Result:**
  - MentalRoBERTa was best on most of 8 test datasets, for example 93.38 vs 92.25 F1 on eRisk.
  - Medical versions of BERT did worse, so the *right kind of text* matters.
- **Problems:** gains are often tiny and from single runs, and the training posts may overlap with the test sets.
- **Why it matters to us:** it's the **strong text-only baseline** the anchor paper never used. It becomes our **Method B**.

---

## 5. The three methods in simple words

| | Method | Simple idea | Speed |
|---|---|---|---|
| **A** | TF IDF + logistic regression | Count words and give rare words more weight. Then learn a weight per word for each class. | Minutes on a laptop |
| **B** | MentalRoBERTa | A big pretrained language model that already "speaks Reddit mental health". We fine-tune it on our labels. | 1 to 2 hours on a Colab GPU |
| **C** | BiLSTM + cross-modal attention | The anchor paper's model. One branch reads text and one reads time, and attention mixes them. We rebuild it from the paper's equations. | Laptop GPU |

- **A is the "simple but strong" check.** If fancy models can't beat it clearly, that's a finding.
- **B is the strong modern check.** If timing helps C but not B, the anchor's gain isn't very useful.
- **C is the claim itself.** Reproducing it tells us whether the paper's number is real.

**How we add timing to A and B:** we attach the time features to the model's input, alongside the text features, and compare text-only vs text+time for every method.

---

## 6. Words you might need to explain

| Term | Simple meaning |
|---|---|
| **Macro F1** | F1 per class, averaged, so small classes count equally. Better than accuracy when classes are uneven. |
| **Recall** | Of the people actually at risk, how many we caught. Missing someone is the worst error here. |
| **AUPRC** | How well the model ranks risky posts above others, across all thresholds. |
| **ECE (calibration)** | Whether "80% confident" actually means right 80% of the time. |
| **Ablation** | Remove one piece (timing) and see what changes. |
| **5 seeds** | Run everything 5 times with different randomness, so one lucky run can't fool us. |
| **Bootstrap 95% CI** | Resample the test set many times to get a range for the gain. If the range includes 0, the gain isn't proven. |
| **McNemar test** | Compares two models on the same posts: does one get right what the other gets wrong more than chance? |
| **Time shift** | Train on older posts and test on newer ones, which is what a real tool faces. |
| **Leakage** | The model sees a hint of the answer it shouldn't, like the subreddit name or a month pattern. |
| **Stratified** | The sample keeps the same class mix as the full data. |

---

## 7. Likely questions and simple answers

**Q: Why not just build a better model?**
A: The course asks for an evidence-based finding. Checking whether a published gain is real is more useful than adding another model nobody verifies.

**Q: What if timing doesn't help?**
A: That's still a result. It means the simpler text-only model is enough, and Phase II can use it.

**Q: The labels are subreddits. Isn't that a problem?**
A: Yes. Posting in r/depression isn't a diagnosis, so we call it "risk signal", never diagnosis, and state it as a limitation. It's also how most papers in this area label data.

**Q: How will you avoid cheating or leakage?**
A: We strip subreddit names from the text, remove duplicates, split by time, and fit everything only on the training data. We also check whether month alone predicts the label.

**Q: Why three methods?**
A: One simple (A), one strong modern (B), and the paper's own (C). That shows whether timing helps across very different models.

**Q: 700k posts is a lot. Can you train on it?**
A: We use a stratified 50 to 100k sample, the same for all methods, so it fits a free Colab GPU.

**Q: What if you can't match the paper's 0.7376?**
A: We report the gap and explain it. The paper has no code and leaves some details unclear. The course counts a mismatch as a finding.

**Q: What is the "later period" test, exactly?**
A: Train on 2021 posts and test on 2022, and train on before-COVID and test on during-COVID. We report how much macro F1 drops for each method.

**Q: Why is this early detection if you classify single posts?**
A: Honestly, at post level it's risk detection. The eRisk dataset has full user histories for true early detection, and that's our stretch goal.

**Q: Isn't there a healthy or control class?**
A: The Kaggle set only has mental-health subreddits. For control posts we can use Low et al.'s non-mental-health subreddits like fitness or jokes.

**Q: Ethics?**
A: We use public anonymised data only and never quote posts. A human decides every flag, and the system is decision support, not diagnosis.

**Q: What will Phase II be?**
A: A triage assistant for moderators. It ranks posts by risk, shows why each was flagged, and shows crisis resources. It's built on whichever model Phase I shows is most reliable.

**Q: What's your role?**
A: I'm rebuilding the anchor paper's model (Method C) and running the timing ablation.
