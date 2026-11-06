# Phase I code

Planned structure (see docs/planning/design_doc.md):

- `src/prepare.py` clean, time features, stratified sample
- `src/splits.py` random and time-based splits
- `src/evaluate.py` shared metrics
- `src/models/` methods A, B, C
- `run.py` one run per model / time on-off / split / seed
