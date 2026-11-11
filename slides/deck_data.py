"""Collect the numbers the slides use from results/kaggle/final and the ablation CSVs -> slides/deck_data.json"""
import json
from pathlib import Path
import pandas as pd
R = Path(__file__).resolve().parents[1] / "phase1" / "results" / "kaggle"
f = R / "final"
s = pd.read_csv(f / "summary.csv")
d = {"summary": s.to_dict("records"),
     "delta_time": pd.read_csv(f / "delta_time.csv").to_dict("records"),
     "delta_shift": pd.read_csv(f / "delta_shift.csv").to_dict("records")}
for k in ["leakage", "strat"]:
    p = R / f"ablation_{k}.csv"
    if p.exists():
        df = pd.read_csv(p)
        key = "variant" if k == "leakage" else "sampling"
        d[k] = df.groupby(key).mean(numeric_only=True).reset_index().to_dict("records")
        d[k + "_std"] = df.groupby(key).std(numeric_only=True).reset_index().to_dict("records")
json.dump(d, open(Path(__file__).parent / "deck_data.json", "w"), indent=1)
print({k: len(v) for k, v in d.items()})
