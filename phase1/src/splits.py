"""Make train/val/test row-id splits and save them, so every method uses identical rows.

random          : stratified 80/20 over all years (compare with the anchor paper)
random_matched  : same test as random, but train subsampled to the size of the temporal train,
                  so a drop under time shift is not just a smaller training set
Kaggle  temporal_late  : train Nov 2021 to Jun 2022, test Aug to Nov 2022 (all six classes exist in this period)
Kaggle  temporal_2021_22 : train 2021, test 2022. Confounded: depression, bipolar and schizophrenia posts only
                         start in Nov 2021, so this mostly tests a change in how the data was collected.
Zenodo  temporal_1y    : train 2018, test 2019
Zenodo  temporal       : train 2018 + 2019, test 2020 (mid-COVID)

Test posts by authors seen in train are dropped (Zenodo only, Kaggle has no authors).
Validation is a stratified 10% of train.

python src/splits.py --source kaggle
"""
import argparse
import json
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]


def carve_val(train: pd.DataFrame, seed: int):
    return train_test_split(train, test_size=0.1, stratify=train.label, random_state=seed)


def drop_author_overlap(train, test):
    seen = set(train.author.dropna()) - {"[deleted]"}
    overlap = test.author.isin(seen)
    return test[~overlap], int(overlap.sum())


def temporal(df, train_years, test_year, seed):
    train, test = df[df.year.isin(train_years)], df[df.year == test_year]
    test, dropped = drop_author_overlap(train, test)
    tr, va = carve_val(train, seed)
    return tr, va, test, dropped


def main(source: str, seed: int = 42, rep: int | None = None) -> None:
    out, proc = ROOT / "data" / "splits" / source, ROOT / "data" / "processed" / source
    if rep is not None:
        out, proc, seed = out / f"rep{rep}", proc / f"rep{rep}", seed + rep
    out.mkdir(parents=True, exist_ok=True)
    df = pd.read_parquet(proc / "sample.parquet")

    trainval, test = train_test_split(df, test_size=0.2, stratify=df.label, random_state=seed)
    test, dropped = drop_author_overlap(trainval, test)
    tr, va = carve_val(trainval, seed)
    splits = {"random": (tr, va, test, dropped)}

    if source == "kaggle":
        late_train = df[(df.ym >= "2021-11") & (df.ym <= "2022-06")]
        late_test = df[(df.ym >= "2022-08") & (df.ym <= "2022-11")]
        splits["temporal_late"] = (*carve_val(late_train, seed), late_test, 0)
        splits["temporal_2021_22"] = temporal(df, [2021], 2022, seed)
    else:
        splits["temporal_1y"] = temporal(df, [2018], 2019, seed)
        splits["temporal"] = temporal(df, [2018, 2019], 2020, seed)

    n_match = len(splits["temporal_late" if source == "kaggle" else "temporal"][0])
    tr_m, _ = train_test_split(tr, train_size=n_match, stratify=tr.label, random_state=seed)
    splits["random_matched"] = (tr_m, va, test, dropped)

    for name, (tr, va, te, dropped) in splits.items():
        ids = {"train": tr.id.tolist(), "val": va.id.tolist(), "test": te.id.tolist()}
        assert not (set(ids["train"]) & set(ids["test"])) and not (set(ids["train"]) & set(ids["val"])) and not (set(ids["val"]) & set(ids["test"]))
        (out / f"{name}.json").write_text(json.dumps(ids))
        print(f"\n{name}: train {len(tr):,}  val {len(va):,}  test {len(te):,}  (test rows dropped for author overlap: {dropped})")
        print(pd.concat([tr.label.value_counts(), va.label.value_counts(), te.label.value_counts()], axis=1, keys=["train", "val", "test"]).fillna(0).astype(int).to_string())


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", choices=["kaggle", "zenodo"], default="kaggle")
    ap.add_argument("--rep", type=int, default=None)
    a = ap.parse_args()
    main(a.source, rep=a.rep)
