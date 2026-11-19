# Contribution log: sudesh-nimesha

Role: statistics (replicates, bootstrap intervals, McNemar), interpretation, comparison with the papers. Since the Nov 11 role rebalance (D35).

Entries before Nov 16 were written on Nov 18, 2026 from course submissions and the shared files.

## Week of Sep 27, 2026 (Week 2)
- **Responsibilities:** topic selection and feasibility.
- **Completed work:** took part in choosing the topic and contributed to the group problem selection and feasibility report (submitted Sep 27, 4.8 / 5).
- **GitHub contributions:** none (repo set up Nov 6).
- **Research contributions:** (add your part of the feasibility report)
- **Technical contributions:** none this week.
- **Challenges:** none recorded.
- **Next step:** review two papers for the literature review.

## Week of Oct 9, 2026 (Week 5)
- **Responsibilities:** literature review.
- **Completed work:** reviewed Low et al. (2020) in full and Cao et al. (2024) as a supporting paper, for the group literature review report (submitted Oct 9, 23 / 25). Both reviews are in `docs/literature/literature_review_combined.md`.
- **GitHub contributions:** none (repo set up Nov 6).
- **Research contributions:** Low et al. gives our simple baseline (TF-IDF with a linear classifier, weighted F1 0.851 on 15 subreddits) and the public Zenodo data with pre- and mid-COVID periods, which we use for a time-shift test. Cao et al. review 47 studies and find common methodological problems: about 17% split data badly, 40.4% did not report or tune hyperparameters, and 25.5% relied on accuracy with imbalanced classes. This supports our use of tuned baselines, proper splits and macro F1.
- **Technical contributions:** none this week.
- **Challenges:** none recorded.
- **Next step:** Phase I proposal presentation.

## Week of Oct 22, 2026 (Week 7)
- **Responsibilities:** Phase I proposal presentation.
- **Completed work:** worked on my part of the group proposal presentation (submitted Oct 22). (add which slides or section you prepared or presented)
- **GitHub contributions:** none (repo set up Nov 6).
- **Research contributions:** none recorded.
- **Technical contributions:** none this week.
- **Challenges:** none recorded.
- **Next step:** Phase I experiments.

## Week of Nov 16, 2026 (Week 13)
- **Responsibilities:** owner review of `phase1/src/stats.py`, interpretation, comparison with the papers, statistics part of the final presentation.
- **Completed work:** reviewed `stats.py` and ran its tests. Added a replicate-level t interval and Holm correction to `delta_time.csv` and `delta_shift.csv`, and changed McNemar to an exact test per replicate. Regenerated the result tables. Updated the findings and wrote "Comparison with the papers" in `phase1/results/README.md`. Decisions D36 and D37. Prepared the statistics part of the final presentation.
- **GitHub contributions:** branch `sudesh/stats-replicate-variance` (add PR link)
- **Research contributions:** the BiLSTM's +0.005 / +0.006 timing gain does not hold across replicates. The only reliable effect of time features is a loss for TF-IDF on `temporal_late`. TF-IDF vs BiLSTM has no consistent winner, while MentalRoBERTa wins in every replicate. Our text-only BiLSTM varies from 0.721 to 0.740 weighted F1 across replicates, more than the anchor paper's whole +0.015 gain.
- **Technical contributions:** `rep_interval`, `holm`, `mcnemar_p` in `stats.py` with tests in `phase1/tests/test_stats.py` (10 tests pass).
- **Challenges:** `temporal_late` uses the same test posts in every replicate, which the pooled McNemar and the per-replicate bootstrap seeds did not account for.
- **Next step:** update the report (`paper/main.tex`) and slides where they quote the BiLSTM gain and the TF-IDF vs BiLSTM McNemar result.
