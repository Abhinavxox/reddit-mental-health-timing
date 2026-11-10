"""Method B: fine-tune MentalRoBERTa (Ji et al. 2022) for 6-way post classification, with optional time features.

features: 'text'       [CLS] vector -> dropout -> linear
          'text_time'  the 6 scaled time features are concatenated to the [CLS] vector before the linear layer

The model is gated on Hugging Face: accept the terms at https://huggingface.co/mental/mental-roberta-base and log in
(huggingface-cli login, or set HF_TOKEN). Set B_MODEL=roberta-base to use the ungated general model instead.
"""
import copy
import os

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split
from transformers import AutoModel, AutoTokenizer, get_linear_schedule_with_warmup

from models.bilstm_attn import TIME_ORDER, TIME_SCALE, get_device

DEFAULT_MODEL = "mental/mental-roberta-base"


class Net(nn.Module):
    def __init__(self, name, n_classes, n_time):
        super().__init__()
        self.enc = AutoModel.from_pretrained(name)
        self.drop = nn.Dropout(0.1)
        self.out = nn.Linear(self.enc.config.hidden_size + n_time, n_classes)

    def forward(self, ids, mask, time):
        cls = self.enc(input_ids=ids, attention_mask=mask).last_hidden_state[:, 0]
        if time is not None:
            cls = torch.cat([cls, time], dim=1)
        return self.out(self.drop(cls))


class RobertaClassifier:
    def __init__(self, features, seed=0, max_len=128, epochs=2, batch=16, lr=2e-5, n_train_cap=20_000, model_name=None):
        self.use_time = features == "text_time"
        self.seed, self.max_len, self.epochs, self.batch, self.lr, self.cap = seed, max_len, epochs, batch, lr, n_train_cap
        self.name = model_name or os.environ.get("B_MODEL", DEFAULT_MODEL)
        self.dev = get_device()
        self.best_C = None
        self.alpha_time_mean = None

    def _encode(self, df):
        tok = self.tok(df.text.tolist(), truncation=True, max_length=self.max_len, padding="max_length", return_tensors="pt")
        cols = [c for c in TIME_ORDER if c in df.columns]
        t = np.stack([(df[c].values - TIME_SCALE[c][0]) / (TIME_SCALE[c][1] - TIME_SCALE[c][0]) for c in cols], axis=1).astype(np.float32)
        return tok["input_ids"].to(self.dev), tok["attention_mask"].to(self.dev), torch.tensor(t, device=self.dev)

    def _logits(self, X, idx):
        ids, mask, t = X
        return self.net(ids[idx], mask[idx], t[idx] if self.use_time else None)

    def _proba(self, X, bs=64):
        self.net.eval()
        out = []
        with torch.no_grad():
            for i in range(0, len(X[0]), bs):
                idx = torch.arange(i, min(i + bs, len(X[0])), device=self.dev)
                out.append(torch.softmax(self._logits(X, idx), 1).cpu().numpy())
        return np.concatenate(out)

    def fit(self, train, val):
        torch.manual_seed(self.seed)
        np.random.seed(self.seed)
        if len(train) > self.cap:  # the same capped subsample for text-only and text + time
            train, _ = train_test_split(train, train_size=self.cap, stratify=train.label, random_state=self.seed)
        self.tok = AutoTokenizer.from_pretrained(self.name)
        Xtr, Xva = self._encode(train), self._encode(val)
        ytr = torch.tensor(train.y.values, device=self.dev)
        self.net = Net(self.name, int(train.y.max()) + 1, Xtr[2].shape[1] if self.use_time else 0).to(self.dev)
        opt = torch.optim.AdamW(self.net.parameters(), lr=self.lr, weight_decay=0.01)
        steps = self.epochs * ((len(ytr) + self.batch - 1) // self.batch)
        sched = get_linear_schedule_with_warmup(opt, int(0.06 * steps), steps)
        loss_fn = nn.CrossEntropyLoss()
        best, best_state = -1.0, None
        self.epochs_run = 0
        for _ in range(self.epochs):
            self.net.train()
            perm = torch.randperm(len(ytr), device=self.dev)
            for i in range(0, len(perm), self.batch):
                idx = perm[i : i + self.batch]
                opt.zero_grad()
                loss_fn(self._logits(Xtr, idx), ytr[idx]).backward()
                nn.utils.clip_grad_norm_(self.net.parameters(), 1.0)
                opt.step()
                sched.step()
            self.epochs_run += 1
            score = f1_score(val.y.values, self._proba(Xva).argmax(1), average="macro")
            if score > best:
                best, best_state = score, copy.deepcopy(self.net.state_dict())
        self.net.load_state_dict(best_state)
        self.val_macro_f1 = best
        return self

    def predict_proba(self, df):
        return self._proba(self._encode(df))
