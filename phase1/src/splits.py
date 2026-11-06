"""Make train/val/test row-id splits and save them, so every method uses identical rows.

random       : stratified 80/20 over all windows (compare with the anchor paper)
temporal_1y  : train 2018, test 2019 (one year apart, no COVID)
temporal     : train 2018 + 2019, test 2020 (mid-COVID)

In every split, test posts by authors who also appear in train are dropped.
Validation is a stratified 10% of train.
"""
import json
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
PROC = ROOT / "data" / "processed"
OUT = ROOT / "data" / "splits"


def carve_val(train: pd.DataFrame, seed: int):
    tr, va = train_test_split(train, test_size=0.1, stratify=train.label, random_state=seed)
    return tr, va


def temporal(df, train_years, test_year, seed):
    train = df[df.year.isin(train_years)]
    test = df[df.year == test_year]
    seen = set(train.author[train.author != "[deleted]"])
    overlap = test.author.isin(seen)
    test = test[~overlap]
    tr, va = carve_val(train, seed)
    return tr, va, test, int(overlap.sum())


def main(seed: int = 42) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    df = pd.read_parquet(PROC / "sample.parquet")

    trainval, test = train_test_split(df, test_size=0.2, stratify=df.label, random_state=seed)
    seen = set(trainval.author[trainval.author != "[deleted]"])
    overlap = test.author.isin(seen)
    test = test[~overlap]
    tr, va = carve_val(trainval, seed)
    splits = {"random": (tr, va, test, int(overlap.sum()))}
    splits["temporal_1y"] = temporal(df, [2018], 2019, seed)
    splits["temporal"] = temporal(df, [2018, 2019], 2020, seed)

    for name, (tr, va, te, dropped) in splits.items():
        ids = {"train": tr.id.tolist(), "val": va.id.tolist(), "test": te.id.tolist()}
        assert not (set(ids["train"]) & set(ids["test"])) and not (set(ids["train"]) & set(ids["val"])) and not (set(ids["val"]) & set(ids["test"]))
        (OUT / f"{name}.json").write_text(json.dumps(ids))
        print(f"\n{name}: train {len(tr):,}  val {len(va):,}  test {len(te):,}  (test rows dropped for author overlap: {dropped})")
        print(pd.concat([tr.label.value_counts(), va.label.value_counts(), te.label.value_counts()], axis=1, keys=["train", "val", "test"]).fillna(0).astype(int).to_string())


if __name__ == "__main__":
    main()
