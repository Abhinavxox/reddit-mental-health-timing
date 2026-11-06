"""Method A: TF-IDF + logistic regression, with optional time features."""
import numpy as np
import scipy.sparse as sp
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.preprocessing import OneHotEncoder

TIME_COLS = ["weekday", "month", "is_weekend"]  # day of month is added as day / 31


class TfidfLR:
    """features: 'text', 'text_time' or 'time'. Everything is fitted on train only."""

    def __init__(self, features: str, Cs=(0.1, 1.0, 10.0), seed: int = 0):
        self.features, self.Cs, self.seed = features, Cs, seed

    def _time(self, df, fit=False):
        if fit:
            self.enc = OneHotEncoder(handle_unknown="ignore").fit(df[TIME_COLS])
        oh = self.enc.transform(df[TIME_COLS])
        return sp.hstack([oh, sp.csr_matrix((df.day.values / 31.0)[:, None])]).tocsr()

    def _X(self, df, fit=False):
        parts = []
        if "text" in self.features:
            if fit:
                self.vec = TfidfVectorizer(ngram_range=(1, 2), min_df=3, max_features=50_000, sublinear_tf=True).fit(df.text)
            parts.append(self.vec.transform(df.text))
        if "time" in self.features:
            parts.append(self._time(df, fit))
        return sp.hstack(parts).tocsr()

    def fit(self, train, val):
        Xtr, Xva = self._X(train, fit=True), self._X(val)
        best = (-1, None)
        for C in self.Cs:
            m = LogisticRegression(C=C, max_iter=2000, class_weight="balanced", random_state=self.seed).fit(Xtr, train.y)
            score = f1_score(val.y, m.predict(Xva), average="macro")
            if score > best[0]:
                best = (score, (C, m))
        self.val_macro_f1, (self.best_C, self.model) = best
        return self

    def predict_proba(self, df):
        return self.model.predict_proba(self._X(df))

    def top_words(self, labels, k=10):
        """Strongest text features per class (text-only model)."""
        words = np.array(self.vec.get_feature_names_out())
        return {labels[i]: words[np.argsort(self.model.coef_[i])[-k:][::-1]].tolist() for i in range(len(labels))}


class Majority:
    """Always predicts the most common training class."""

    best_C = None
    val_macro_f1 = None

    def fit(self, train, val):
        self.model = DummyClassifier(strategy="prior").fit(np.zeros((len(train), 1)), train.y)
        return self

    def predict_proba(self, df):
        return self.model.predict_proba(np.zeros((len(df), 1)))
