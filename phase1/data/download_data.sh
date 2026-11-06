#!/usr/bin/env bash
# Datasets for the mental-health detection project.
set -euo pipefail
cd "$(dirname "$0")"

# 1) Low et al. 2020 Reddit Mental Health Dataset (Zenodo 3941387, ODC-PDDL public domain, ~3.1 GB total).
#    Pass subreddit names to limit the download, e.g.: ./download_data.sh depression anxiety suicidewatch mentalhealth
SUBS=("$@")
[ ${#SUBS[@]} -eq 0 ] && SUBS=(depression anxiety suicidewatch bipolarreddit bpd schizophrenia mentalhealth lonely ptsd jokes fitness personalfinance)
mkdir -p low2020
for s in "${SUBS[@]}"; do
  for p in pre post 2018 2019; do
    f="${s}_${p}_features_tfidf_256.csv"
    [ -f "low2020/$f" ] && continue
    curl -sfL -o "low2020/$f" "https://zenodo.org/records/3941387/files/$f?download=1" || { rm -f "low2020/$f"; echo "skip $f"; }
  done
done

# 2) Kaggle "Mental Disorders Identification (Reddit)": the anchor paper's dataset (needs your own Kaggle API token in ~/.kaggle/kaggle.json)
if command -v kaggle >/dev/null; then
  kaggle datasets download -d kamaruladha/mental-disorders-identification-reddit-nlp -p kaggle_mdi --unzip
else
  echo "Install the Kaggle CLI (pip install kaggle) and add your API token, or download manually:"
  echo "  https://www.kaggle.com/datasets/kamaruladha/mental-disorders-identification-reddit-nlp"
fi
