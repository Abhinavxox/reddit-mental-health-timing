#!/usr/bin/env bash
# Final Phase I runs: replicate samples, then Method A and Method C on them.
# N=60000 REPS="0 1 2 3 4" bash phase1/run_final.sh
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONWARNINGS=ignore
N=${N:-60000}
REPS=${REPS:-"0 1 2 3 4"}
for k in $REPS; do
  python src/prepare.py --source kaggle --n "$N" --rep "$k"
  python src/splits.py --source kaggle --rep "$k"
done
python run.py --source kaggle --all --reps $REPS
python run.py --source kaggle --model bilstm --all --reps $REPS --splits random random_matched temporal_late
echo "FINAL RUNS DONE"
