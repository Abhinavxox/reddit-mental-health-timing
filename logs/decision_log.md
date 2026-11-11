# Decision log

Why we chose what we chose, and where it lives in the code. Newest at the bottom. Dates are the real dates the decision was made. Add your own entries.

Format: **Decision**, the options we weighed, why, where.

---

## Nov 6, 2026: Milestone 1 (data pipeline and Method A)

**D1. Run on the Zenodo data first, then the Kaggle data.**
- Options: wait for a Kaggle login, or prototype on the public Zenodo data.
- Chose to prototype on Zenodo so the pipeline could be tested, then rerun on Kaggle once a token was available. Both are kept.
- Where: `phase1/src/prepare.py` (`--source kaggle|zenodo`).

**D2. Skip the Zenodo `pre` file.**
- It covers Nov 2018 to Nov 2019 and overlaps the Jan to Apr 2019 file, so the same posts could land in both train and test.
- Where: `ZENODO_PERIODS` in `prepare.py`.

**D3. Keep condition names ("depression", "bpd") in the text.**
- Dilemma: removing them stops the model reading the label, but they are real content and a real tool would see them.
- Chose to keep them and state it as a limitation. We only remove subreddit mentions ("r/depression", "this sub").
- Where: `SUB_MENTION` in `prepare.py`.

**D4. Drop texts that appear under more than one label.**
- Cross-posted text has two correct labels, so it can only add noise or leak across the split.
- 4,164 texts removed on the Kaggle data (funnel in `phase1/results/README.md`).

**D5. Stratify the sample by label x month, proportionally.**
- Alternative: cap each class to equal size. That would hide the real class imbalance.
- Proportional keeps the true mix. Macro F1 and class weights handle the imbalance.

**D6. Use the uniform random guess as the chance baseline, not the majority class.**
- Found while reading the first results: for macro F1 over 6 classes, a class-balanced guesser scores about 0.146, while "always predict the biggest class" scores about 0.08.
- Where: `RandomGuess` in `phase1/src/models/tfidf_lr.py`.

**D7. Report weighted F1 as well as macro F1.**
- The anchor paper's recall equals its accuracy exactly (0.7455), which is what weighted averaging gives. To compare with its 0.7222 and 0.7376 we need weighted F1.
- Macro F1 stays our main metric because it counts the small classes equally.
- Where: `phase1/src/evaluate.py`.

**D8. Add `random_matched` (random split with the training size of the time split).**
- Without it, a lower score on a time split could just be less training data.
- Where: `phase1/src/splits.py`.

**D9. The main time-shift split is `temporal_late`, not 2021 to 2022.**
- Dilemma: the anchor paper uses 2021 to 2022, but in the Kaggle file depression, bipolar and schizophrenia posts do not exist before Nov 2021, so that split mostly tests a collection change, not language drift.
- Chose Nov 2021 to Jun 2022 for training and Aug to Nov 2022 for testing, where all six classes exist. The old split is kept as `temporal_2021_22`, flagged as confounded.
- Where: `splits.py`, explained in `phase1/results/README.md`.

**D10. Drop test posts by authors seen in training (Zenodo only).**
- Same-user posts in train and test inflate scores. The Kaggle file has no author column, so this cannot be checked there. Stated as a limitation.

**D11. Add a "text + time without month and day" variant.**
- To test whether the month feature is a shortcut. It rescued the confounded 2021 to 2022 result (0.228 to 0.494), which supports the shortcut explanation.
- Where: `text_time_nomonth` in `tfidf_lr.py`.

**D12. Tune the regularisation C on a validation set from the training period.**
- Limitation we accept: that validation set cannot see a time shift, so it may pick a C that is too confident under shift.

**D13. A bug and how we caught it.**
- In `splits.py` I reused the variable `test` for the temporal test set, which made the `random_matched` split fail its overlap check. My own `grep` hid the error and an old file stayed on disk.
- Caught because the results did not change after a code change. Fixed, then reran everything from scratch with errors shown.
- Lesson: never filter error output while debugging, and delete outputs before rerunning.

---

## Nov 6, 2026: Method C (the anchor paper's model, rebuilt)

The paper released no code, so every choice below is ours. Each is also a possible reason our numbers differ from the paper's. File: `phase1/src/models/bilstm_attn.py`.

**D14. Time features are fed as a length-6 sequence into an LSTM.**
- The paper (eq. 5) writes the time features as a sequence, but they are an unordered set, so an LSTM over them is odd. We followed the paper literally, because the goal is to reproduce it.

**D15. Project the time vector from 64 to 128 dimensions with a linear layer.**
- The text branch outputs 128 (BiLSTM, 64 each way) and the time branch 64, but the attention mixes the two, so they must match. The paper does not say how.

**D16. One shared attention vector `w` for both branches (eq. 11 and 12).**

**D17. Plain cross-entropy loss, no class weights.**
- Dilemma: our Method A used class weights, which helps macro F1 on small classes. The paper does not mention weights, so for a faithful reproduction we use plain cross-entropy. A weighted variant can be added later.
- Expect Method C to do worse than Method A on the small classes for this reason.

**D18. Pick the best epoch on a separate validation set, with early stopping (patience 3, at most 15 epochs).**
- The paper picks the best model on the same validation set it reports, which makes results look better. We do not copy that.

**D19. Learned 128-dimensional embeddings from scratch, vocabulary of 10,000 words, 100 tokens.**
- The paper mentions Word2Vec in the preprocessing text but also gives a vocabulary and embedding size that describe a learned embedding layer. We went with the layer.

**D20. No stopword removal or lemmatization.**
- The paper does both. We skipped them to avoid an extra download and because the model reads word order. Listed as a possible cause of any gap.

**D21. Scale time features with fixed ranges (month 1 to 12, hour 0 to 23, and so on), not a fitted scaler.**
- Same result as MinMaxScaler for known ranges, and it cannot leak test information.

**D22. Pre-pad posts (the Keras default) and mask the padding out of the max-pool. Superseded the first version, which packed sequences.**
- First version used `pack_padded_sequence`. On the Apple GPU a step took 160 ms instead of 12 ms, so a run took far too long to repeat 45 times. Dropping packing made a full run 70 seconds, with the same score (0.702 weighted F1 either way).
- With pre-padding the backward LSTM reads real tokens first, and the mask stops padding winning the max-pool. This is also closer to what the Keras-style paper most likely did.
- How we found it: my first speed benchmark did not include packing, so it was 6x too optimistic. Always benchmark the real code path.

**D23. Sanity test before any real run.**
- The network must memorise 300 posts (train accuracy at least 0.95). All three variants reached 1.000.
- Where: `phase1/tests/test_bilstm_overfit.py`.

**D24. Run Method C on the laptop (M2, MPS), not Colab.**
- Measured: about 25 ms per step for a model of this size, so an epoch on 8k posts takes about 3 seconds. No cloud needed.

---

## Nov 9, 2026: running the full stage

**D25. A replicate is a fresh sample, fresh split and fresh model initialisation.**
- Logistic regression is deterministic, so repeating it on a fixed split gives identical numbers and no spread. Re-drawing the sample and split also captures sampling noise, which is what the confidence intervals need.
- Where: `--rep` in `prepare.py`, `splits.py`, `run.py`. Output goes to `data/processed/<source>/rep<k>/` and `results/<source>/final/`.

**D26. Method B needs a Hugging Face login.**
- `mental/mental-roberta-base` is gated (the download returns 401 until the model terms are accepted and a token is used). We cannot download it without the user's login.

**D27. Final batch: 5 replicates, 60k sample, Method A on 4 splits, Method C on 3 splits x 3 variants.**
- Method C skips `temporal_2021_22` because that split is confounded (D9) and the extra runs would cost time for no new information. Method A keeps it for completeness.
- Where: `phase1/run_final.sh`.

**D28. Method B runs on Colab, not the laptop.**
- Measured with plain `roberta-base` on the Mac: 20 training steps took 564 seconds (with another job running, so not a clean number, but a full run needs about 2,500 steps). Not feasible on 8 GB.
- A T4 should do a run in roughly 15 to 20 minutes (to be measured). Notebook: `phase1/notebooks/method_b_colab.ipynb`. `get_device()` now picks CUDA first.

**D29. Method B uses a 20k training subsample, 128 tokens, 2 epochs, 3 replicates, cells `random_matched` and `temporal_late`.**
- Budget choice for free Colab. The subsample is the same rows for text only and text + time. The cap is a deviation from Methods A and C, which use all training rows, so cross-method gaps partly reflect training size. State this in the report.

---

## Nov 11, 2026: final runs and reading the results

**D30. Final verdict rule, fixed before looking at Method B.**
- If the 95% CI of "time on minus time off" includes 0 for every method, the verdict is no evidence that timing helps. A gain only for the weak BiLSTM is reported as "timing helps only a weak model", not as support for the anchor paper.
- Result for Methods A and C: no gain for TF-IDF, a tiny gain (+0.005 to +0.006) for the BiLSTM on two of three splits, none on the paper's random split.

**D31. The slow run (8,075 s) is kept, not rerun.** The laptop was busy or asleep, the score (0.621) is in line with the others and the seed is fixed, so rerunning would not change the numbers.

**D32. Method B access.** The Hugging Face token worked only after the model terms were accepted on the account. The token was shared in chat, so it should be revoked after Method B finishes.
