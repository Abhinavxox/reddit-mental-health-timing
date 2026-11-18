# How the code works, in plain words

Everyone should be able to explain this page. Each person should know their own files in detail.

The whole pipeline is: **download → clean → sample → split → train → evaluate → statistics → figures**.

---

## The files, in the order they run

**1. `phase1/src/prepare.py`: cleaning and sampling (Xing)**
- In: the raw Kaggle CSV (701,787 posts).
- Does: keeps 2021 and 2022, drops NSFW, empty, deleted and very short posts, removes subreddit mentions ("r/depression", "this sub"), drops texts posted under two labels and duplicates, adds the time features (month, day, weekday, weekend, hour, working hour), then takes a sample stratified by class and month.
- Out: `sample.parquet` (60,000 posts per replicate) and `funnel.json` (how many posts each step removed).
- Run: `python phase1/src/prepare.py --source kaggle --n 60000 --rep 0`

**2. `phase1/src/splits.py`: train, validation and test sets (Xing)**
- Does: makes four splits. Random 80/20, random with smaller training (same size as the time split), later period (train Nov 2021 to Jun 2022, test Aug to Nov 2022), and the paper's 2021 to 2022. Takes 10% of training as validation.
- Out: lists of post ids for each split. Only ids, so every model uses exactly the same posts.

**3. `phase1/src/evaluate.py`: the scores (Sudesh)**
- Does: from true labels and predictions, computes macro F1, weighted F1, accuracy, per-class recall, AUPRC, calibration error (ECE) and the confusion matrix.
- Checked by `phase1/tests/test_evaluate.py` with a hand-worked example.

**4. The three models (`phase1/src/models/`)**
- `tfidf_lr.py` (Jaskamal, Method A): turns text into word scores, trains logistic regression, picks the setting C from 0.1, 1 and 10 on the validation set. Can add time features as extra columns. Also gives the top words per class.
- `roberta.py` (Abhinav, Method B): loads MentalRoBERTa from Hugging Face, adds one output layer, fine-tunes for 2 epochs on up to 20k training posts. Time features are joined to the [CLS] vector. Runs on Colab.
- `bilstm_attn.py` (Abhinav, Method C): the anchor paper's model. A BiLSTM reads the words, an LSTM reads the 6 time features, attention mixes them. Stops early when validation macro F1 stops improving.
- Each model can run with `text`, `text_time` or `time` features. That switch is the whole timing experiment.

**5. `phase1/run.py`: runs a model on a split**
- Loads the sample and split, trains, predicts the test set, scores it, writes one row to a results CSV and saves the predictions to `preds/*.npz`.
- Run one: `cd phase1 && python run.py --source kaggle --model tfidf --features text --split random`
- `phase1/run_final.sh` runs everything for 5 replicates (Methods A and C, on the laptop). The Colab notebook does Method B.

**6. `phase1/src/stats.py`: is a difference real? (Sudesh)**
- Reads all prediction files and writes:
  - `summary.csv`: mean and spread of each score over replicates.
  - `delta_time.csv`: score with time minus score without, with a 95% bootstrap interval.
  - `delta_shift.csv`: later period minus same-size random.
  - `mcnemar.csv`: which model is better on the same posts.
- Checked by `phase1/tests/test_stats.py` on cases with known answers.

**7. `phase1/src/ablation.py`: does the cleaning or the sampling change the score? (Xing)**
- Retrains Method A with each cleaning step turned off, and with three sampling methods, all on 20k posts and 5 replicates.

**8. `phase1/src/make_figures.py`**: draws the figures in `phase1/figures/` from the result tables.

---

## How to read the results

| You see | It means |
|---|---|
| macro F1 0.68 | averaged over the 6 classes equally; 1.0 is perfect, 0.145 is random guessing |
| accuracy 0.78 | 78% of test posts got the right label |
| delta +0.000 [-0.003, +0.003] | adding time changed the score by 0; the true change is very likely between -0.003 and +0.003, which includes 0, so **no real effect** |
| delta -0.016 [-0.018, -0.013] | the whole interval is below 0, so adding time **really made it worse** |
| McNemar p < 0.001 | one model really is better than the other on the same posts |
| time-only 0.15 | time on its own is about as good as guessing |

---

## What each person must be able to say about their part

- **Xing:** what each cleaning step removes and why, why stratify, what the four splits are, and the result of the leakage and stratification test.
- **Jaskamal:** how TF-IDF turns text into numbers, what logistic regression learns, how C is picked, and Method A's scores.
- **Sudesh:** what a replicate, bootstrap interval and McNemar test are, how to read `delta_time.csv`, and how our numbers compare with the papers.
- **Zohaib:** how we read the top words from Method A, which classes get confused, and why that matters for a moderator.
- **Abhinav:** how Methods B and C work, why we rebuilt C, Colab against the laptop, and the overall findings.

**Practice:** each person runs one command for their part (the run lines above) and reads the output aloud.
