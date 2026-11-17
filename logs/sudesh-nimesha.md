# Contribution log: sudesh-nimesha

Add one entry per week. Newest at the bottom.

Role: statistics (replicates, bootstrap intervals, McNemar), interpretation, comparison with the papers. Since the Nov 11 role rebalance (D35).

## Week of Nov 16, 2026
- **Responsibilities:** owner review of `phase1/src/stats.py`, interpretation, comparison with the papers.
- **Completed work:** reviewed `stats.py` and ran its tests. Added a replicate-level t interval and Holm correction to `delta_time.csv` and `delta_shift.csv`, and changed McNemar to an exact test per replicate. Regenerated the result tables. Updated the findings and wrote "Comparison with the papers" in `phase1/results/README.md`. Decisions D36 and D37.
- **GitHub contributions:** branch `sudesh/stats-replicate-variance` (add PR link)
- **Research contributions:** the BiLSTM's +0.005 / +0.006 timing gain does not hold across replicates. The only reliable effect of time features is a loss for TF-IDF on `temporal_late`. TF-IDF vs BiLSTM has no consistent winner, while MentalRoBERTa wins in every replicate. Our text-only BiLSTM varies from 0.721 to 0.740 weighted F1 across replicates, more than the anchor paper's whole +0.015 gain.
- **Technical contributions:** `rep_interval`, `holm`, `mcnemar_p` in `stats.py` with tests in `phase1/tests/test_stats.py` (10 tests pass).
- **Challenges:** `temporal_late` uses the same test posts in every replicate, which the pooled McNemar and the per-replicate bootstrap seeds did not account for.
- **Next step:** update the report (`paper/main.tex`) and slides where they quote the BiLSTM gain and the TF-IDF vs BiLSTM McNemar result. Prepare the statistics slide for the presentation.
