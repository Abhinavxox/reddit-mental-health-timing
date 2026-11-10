"""Method C: BiLSTM text branch + LSTM time branch + cross-modal attention.

Rebuilt from the equations and settings of Saeed & Ahmed (2025), arXiv:2503.07653, Sections V and VI.
No code was released, so choices the paper leaves open are listed in logs/decision_log.md.

features: 'text'        text branch only (the paper's text-only BiLSTM comparison, with the same head)
          'text_time'   both branches fused with cross-modal attention (the paper's model)
          'text_time_concat'  both branches concatenated, no attention (ablation)
"""
import copy
import re
from collections import Counter

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import f1_score

VOCAB, MAXLEN, EMB, HID, DROP = 10_000, 100, 128, 64, 0.6
TIME_ORDER = ["month", "day", "hour", "weekday", "is_working_hour", "is_weekend"]
TIME_SCALE = {"month": (1, 12), "day": (1, 31), "hour": (0, 23), "weekday": (0, 6), "is_working_hour": (0, 1), "is_weekend": (0, 1)}
TOKEN = re.compile(r"[a-z']+")


def get_device():
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("mps" if torch.backends.mps.is_available() else "cpu")


class Net(nn.Module):
    def __init__(self, mode: str, n_classes: int, n_time: int):
        super().__init__()
        self.mode = mode
        self.emb = nn.Embedding(VOCAB, EMB, padding_idx=0)
        self.text_rnn = nn.LSTM(EMB, HID, batch_first=True, bidirectional=True)
        if mode != "text":
            self.time_rnn = nn.LSTM(1, HID, batch_first=True)
            self.time_up = nn.Linear(HID, 2 * HID)  # the paper does not say how the two branch sizes are matched
        if mode == "text_time":
            self.W_text, self.W_time = nn.Linear(2 * HID, 2 * HID), nn.Linear(2 * HID, 2 * HID)
            self.w = nn.Linear(2 * HID, 1, bias=False)
        self.drop = nn.Dropout(DROP)
        self.out = nn.Linear(4 * HID if mode == "text_time_concat" else 2 * HID, n_classes)

    def forward(self, tokens, lengths, time):
        h, _ = self.text_rnn(self.emb(tokens))  # posts are pre-padded (Keras default), so no packing
        real = torch.arange(MAXLEN, device=tokens.device)[None, :] >= (MAXLEN - lengths)[:, None]
        z_text = h.masked_fill(~real[..., None], -1e4).max(dim=1).values  # eq. 4: max-pool over time, padding cannot win
        alpha = None
        if self.mode == "text":
            z = z_text
        else:
            _, (hn, _) = self.time_rnn(time.unsqueeze(-1))  # the 6 time features as a length-6 sequence (eq. 5)
            z_time = self.time_up(hn[-1])
            if self.mode == "text_time":
                s = torch.cat([self.w(torch.tanh(self.W_text(z_text))), self.w(torch.tanh(self.W_time(z_time)))], dim=1)
                alpha = torch.softmax(s, dim=1)  # eq. 11 and 12
                z = alpha[:, :1] * z_text + alpha[:, 1:] * z_time
            else:
                z = torch.cat([z_text, z_time], dim=1)
        return self.out(self.drop(z)), alpha


class BiLSTMAttn:
    def __init__(self, features: str, seed: int = 0, max_epochs: int = 15, patience: int = 3, batch: int = 64):
        self.mode = {"text": "text", "text_time": "text_time", "text_time_concat": "text_time_concat"}[features]
        self.seed, self.max_epochs, self.patience, self.batch = seed, max_epochs, patience, batch
        self.dev = get_device()
        self.best_C = None
        self.alpha_time_mean = None

    def _encode(self, df):
        ids = np.zeros((len(df), MAXLEN), dtype=np.int64)
        lens = np.ones(len(df), dtype=np.int64)
        for i, text in enumerate(df.text):
            toks = [self.vocab.get(w, 1) for w in TOKEN.findall(text.lower())[:MAXLEN]] or [1]
            ids[i, MAXLEN - len(toks):], lens[i] = toks, len(toks)
        cols = [c for c in TIME_ORDER if c in df.columns]
        t = np.stack([(df[c].values - TIME_SCALE[c][0]) / (TIME_SCALE[c][1] - TIME_SCALE[c][0]) for c in cols], axis=1).astype(np.float32)
        return torch.tensor(ids, device=self.dev), torch.tensor(lens, device=self.dev), torch.tensor(t, device=self.dev)

    def _logits(self, X, idx):
        tok, ln, t = X
        return self.net(tok[idx], ln[idx], t[idx])

    def _proba(self, X, bs=512):
        self.net.eval()
        out, al = [], []
        with torch.no_grad():
            for i in range(0, len(X[0]), bs):
                idx = torch.arange(i, min(i + bs, len(X[0])), device=self.dev)
                logits, alpha = self._logits(X, idx)
                out.append(torch.softmax(logits, 1).cpu().numpy())
                if alpha is not None:
                    al.append(alpha[:, 1].cpu().numpy())
        self.last_alpha_time = np.concatenate(al) if al else None
        return np.concatenate(out)

    def fit(self, train, val):
        torch.manual_seed(self.seed)
        np.random.seed(self.seed)
        counts = Counter(w for text in train.text for w in TOKEN.findall(text.lower()))
        self.vocab = {w: i + 2 for i, (w, _) in enumerate(counts.most_common(VOCAB - 2))}  # 0 = pad, 1 = unknown
        Xtr, Xva = self._encode(train), self._encode(val)
        ytr = torch.tensor(train.y.values, device=self.dev)
        n_time = Xtr[2].shape[1]
        self.net = Net(self.mode, int(train.y.max()) + 1, n_time).to(self.dev)
        opt = torch.optim.RMSprop(self.net.parameters(), lr=5e-4, alpha=0.99, momentum=0.9, eps=1e-8, weight_decay=1e-5)
        loss_fn = nn.CrossEntropyLoss()
        best, best_state, bad = -1.0, None, 0
        self.epochs_run = 0
        for epoch in range(self.max_epochs):
            self.net.train()
            perm = torch.randperm(len(ytr), device=self.dev)
            for i in range(0, len(perm), self.batch):
                idx = perm[i : i + self.batch]
                opt.zero_grad()
                logits, _ = self._logits(Xtr, idx)
                loss_fn(logits, ytr[idx]).backward()
                opt.step()
            self.epochs_run += 1
            score = f1_score(val.y.values, self._proba(Xva).argmax(1), average="macro")
            if score > best:
                best, best_state, bad = score, copy.deepcopy(self.net.state_dict()), 0
            else:
                bad += 1
                if bad >= self.patience:
                    break
        self.net.load_state_dict(best_state)
        self.val_macro_f1 = best
        return self

    def predict_proba(self, df):
        p = self._proba(self._encode(df))
        if self.last_alpha_time is not None:
            self.alpha_time_mean = float(self.last_alpha_time.mean())
        return p

    def train_accuracy(self, df):
        return float((self._proba(self._encode(df)).argmax(1) == df.y.values).mean())
