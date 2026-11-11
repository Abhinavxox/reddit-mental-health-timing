// node build_deck.js  -> Phase1_Timing_Matters.pptx   (numbers come from deck_data.json, made by deck_data.py)
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const { applyTheme } = require("/Users/abhinavpandey/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/e7db9679-8f06-448e-8625-15e81aaf54fe/2df7eaff-8b66-4bb9-baf8-802c88d58a09/skills/pptx/scripts/apply_theme.js");

const D = JSON.parse(fs.readFileSync(path.join(__dirname, "deck_data.json")));
const THEME = {
  name: "Timing Matters",
  headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1: "1B2A41", lt1: "FFFFFF", dk2: "324A5F", lt2: "EEF2F6", accent1: "2A9D8F", accent2: "E76F51", accent3: "6C7A89", accent4: "F4A261", accent5: "5B6C9D", accent6: "8AB17D", hlink: "2A9D8F", folHlink: "6C7A89" },
};
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Does Timing Matter? Phase I";
const C = pres.SchemeColor;

pres.defineSlideMaster({ title: "DARK", background: { color: "1B2A41" }, masterName: "DARK",
  objects: [], slideNumber: undefined });
pres.defineSlideMaster({ title: "CONTENT", background: { color: "FFFFFF" }, masterName: "CONTENT",
  objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9, h: 0.8, fontFace: "Cambria", fontSize: 30, bold: true, color: "1B2A41", align: "left", valign: "middle", margin: 0 }, text: "" } }],
  slideNumber: { x: 9.2, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: "6C7A89" } });

const f = (m, ft, sp) => (D.summary.find(r => r.model === m && r.features === ft && r.split === sp) || {}).macro_f1_mean;
const dt = (m, sp, v = "text_time") => D.delta_time.find(r => r.model === m && r.split === sp && r.time_variant === v);
const fmt = (x, n = 3) => (x === undefined || x === null || isNaN(x) ? "n/a" : (+x).toFixed(n));
const sgn = x => (x >= 0 ? "+" : "") + fmt(x);
const NAMES = { tfidf: "A  TF-IDF + LR", roberta: "B  MentalRoBERTa", bilstm: "C  BiLSTM" };

const g = (m, ft, sp, col) => (D.summary.find(r => r.model === m && r.features === ft && r.split === sp) || {})[col];
const hdrc = (t, fs = 12) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: "324A5F" }, fontSize: fs } });
const box = (s, x, y, w, h, t, fill, color, name, fs = 12) => { s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: name }); s.addText(t, { x, y, w, h, align: "center", valign: "middle", fontSize: fs, bold: true, color, isTextBox: true, margin: 4 }); };
const arrow = (s, x1, y1, x2, y2, name) => s.addShape(pres.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color: "6C7A89", width: 1.5, endArrowType: "triangle" }, objectName: name });
function content(title, notes) {
  const s = pres.addSlide({ masterName: "CONTENT" });
  s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
}
const card = (s, x, y, w, h, name) => s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.background2 }, line: { color: "EEF2F6", width: 0 }, objectName: name });

// 1 Title
{
  const s = pres.addSlide({ masterName: "DARK" });
  s.addText("Does Timing Matter?", { x: 0.7, y: 1.4, w: 8.6, h: 1, fontFace: "Cambria", fontSize: 48, bold: true, color: C.background1, isTextBox: true, margin: 0 });
  s.addText("Temporal signals and time-robustness in AI detection of mental-health risk from Reddit posts", { x: 0.7, y: 2.5, w: 8, h: 0.9, fontSize: 20, color: "CBD5E1", isTextBox: true, margin: 0 });
  s.addText("Abhinav Pandey  ·  Thotagamuwage Sudesh Nimesha  ·  Jaskamal  ·  Zohaib Jawaid  ·  Xing Liao", { x: 0.7, y: 3.75, w: 8.6, h: 0.4, fontSize: 14, color: "FFFFFF", isTextBox: true, margin: 0 });
  s.addText("Group 2  ·  COMP 8790 Topics in Applied AI  ·  Healthcare (mental health)  ·  Phase I results", { x: 0.7, y: 4.4, w: 8.6, h: 0.4, fontSize: 14, color: "2A9D8F", bold: true, isTextBox: true, margin: 0 });
  s.addNotes("Introduce the team and the question. One sentence: we tested whether a claim in a recent paper, that adding posting time helps classify mental-health posts, holds up.");
}

// 1b Problem and motivation
{
  const s = content("Why this problem matters", "Many people describe distress online before or instead of seeing a clinician. Volunteer moderators read huge volumes of posts. AI can help sort and flag, it never diagnoses. Figures are from WHO, cited in our proposal.");
  [["280M", "people living with depression (WHO 2025)"], ["301M", "people with anxiety disorders, 2019 (WHO 2022)"], ["727k", "suicide deaths in 2021 (WHO 2025)"]].forEach((r, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.35, 2.9, 1.6, `stat card ${i + 1}`);
    s.addText(r[0], { x: x + 0.2, y: 1.45, w: 2.5, h: 0.8, fontFace: "Cambria", fontSize: 36, bold: true, color: C.accent2, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: x + 0.2, y: 2.25, w: 2.5, h: 0.6, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  });
  s.addText("Who it is for", { x: 0.5, y: 3.2, w: 4.3, h: 0.35, fontSize: 16, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText("Moderators and peer supporters of online mental-health communities, who read far more posts than they can handle.", { x: 0.5, y: 3.55, w: 4.3, h: 1.1, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
  s.addText("Why AI", { x: 5.1, y: 3.2, w: 4.4, h: 0.35, fontSize: 16, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText("Text carries the signal and the volume is too large to read by hand. AI ranks and flags posts for a human, it never diagnoses.", { x: 5.1, y: 3.55, w: 4.4, h: 1.1, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
}

// 1c Literature and gap
{
  const s = content("Five core papers and the gap", "Each member reviewed papers; these five are the core. The gap: nobody tested whether timestamp features help once a strong text model and repeated, leakage-controlled, time-aware evaluation are used. Supporting papers: MentalBERT, Cao et al. bias review, Kamarudin survey, Menta, DS@GT.");
  const rows = [[hdrc("Paper (reviewer)"), hdrc("Approach"), hdrc("Finding"), hdrc("Limitation")],
    ["Saeed & Ahmed 2025 (Abhinav)", "BiLSTM + time LSTM, attention", "+1.5 F1 from time", "one split, no transformer, no code"],
    ["Low et al. 2020 (Sudesh)", "TF-IDF + linear models", "weighted F1 0.851, COVID shift", "never tests model robustness"],
    ["Cohan et al. 2018 (Jaskamal)", "SMHD, TF-IDF, FastText, CNN", "high precision, low recall", "no time split"],
    ["Kumar et al. 2024 (Zohaib)", "post history as time series", "order of posts matters", "user level, baselines copied"],
    ["Parapar et al. 2025 (Xing)", "eRisk early-risk benchmark", "recall 1.00 gave F1 0.20", "no timestamp features tested"]].map((r, i) => i === 0 ? r : r.map(t => ({ text: t, options: { fontSize: 11 } })));
  s.addTable(rows, { x: 0.5, y: 1.25, w: 9, colW: [2.3, 2.3, 2.1, 2.3], rowH: 0.42, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  card(s, 0.5, 4.0, 9, 0.85, "gap card");
  s.addText([{ text: "Gap: ", options: { bold: true, color: "E76F51" } }, { text: "does timing still help against a strong text model, with repeated runs and a valid later-period test?" }], { x: 0.7, y: 4.0, w: 8.6, h: 0.85, fontSize: 15, color: C.text1, valign: "middle", isTextBox: true, margin: 0 });
}

// 2 The claim and the question
{
  const s = content("A paper says timing helps. We checked.", "Anchor paper: Saeed and Ahmed 2025. They add hour, weekday and month to a BiLSTM and report weighted F1 0.7222 to 0.7376. One run, no strong baseline, no code. Our question has two parts: does timing help against a strong text model, and what is lost when a model trained on earlier posts is tested on later ones.");
  card(s, 0.5, 1.4, 4.3, 3.4, "claim card");
  s.addText("The claim", { x: 0.75, y: 1.55, w: 3.8, h: 0.4, fontSize: 18, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText("0.7222", { x: 0.75, y: 2.1, w: 1.8, h: 0.8, fontFace: "Cambria", fontSize: 36, bold: true, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText("0.7376", { x: 2.75, y: 2.1, w: 1.8, h: 0.8, fontFace: "Cambria", fontSize: 36, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
  s.addText("text only", { x: 0.75, y: 2.85, w: 1.8, h: 0.3, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText("text + time", { x: 2.75, y: 2.85, w: 1.8, h: 0.3, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText("Weighted F1 from one run of a BiLSTM. No transformer baseline, no released code.", { x: 0.75, y: 3.4, w: 3.8, h: 1, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
  card(s, 5.1, 1.4, 4.4, 3.4, "question card");
  s.addText("Our question", { x: 5.35, y: 1.55, w: 3.9, h: 0.4, fontSize: 18, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText([
    { text: "Do posting-time features improve classification over a strong text-only model?", options: { bullet: true, breakLine: true } },
    { text: "How much does each method lose when trained on earlier posts and tested on later ones?", options: { bullet: true } },
  ], { x: 5.35, y: 2.05, w: 3.9, h: 2.3, fontSize: 15, color: C.text1, paraSpaceAfter: 10, valign: "top", isTextBox: true, margin: 0 });
}

// 2b Methodology diagram
{
  const s = content("How the study works", "Same data and same splits for every model. The only thing that changes in the timing test is whether time features are given. The focus of the investigation is the orange box.");
  const steps = [["Kaggle Reddit\n701,787 posts", "324A5F"], ["Clean and\nremove leakage", "324A5F"], ["Stratified 60k\nx 5 replicates", "324A5F"], ["Splits: random,\nsame-size, later", "324A5F"]];
  steps.forEach((t, i) => { box(s, 0.5 + i * 2.35, 1.4, 2.0, 0.95, t[0], t[1], "FFFFFF", `flow step ${i + 1}`); if (i < 3) arrow(s, 2.5 + i * 2.35, 1.875, 2.85 + i * 2.35, 1.875, `flow arrow ${i + 1}`); });
  arrow(s, 7.95, 2.35, 7.95, 2.75, "flow arrow down");
  [["A  TF-IDF + LR", "2A9D8F"], ["B  MentalRoBERTa", "5B6C9D"], ["C  BiLSTM + attention", "E76F51"]].forEach((t, i) => box(s, 0.5 + i * 2.35, 2.85, 2.0, 0.6, t[0], t[1], "FFFFFF", `method box ${i}`));
  box(s, 7.55, 2.75, 1.95, 0.8, "text only\nvs text + time", "F4A261", "1B2A41", "focus box", 13);
  arrow(s, 7.55, 3.15, 7.2, 3.15, "focus arrow");
  box(s, 0.5, 3.85, 9.0, 0.7, "Evaluate: macro F1 (main), weighted F1 and accuracy, 95% paired bootstrap interval, McNemar test", "EEF2F6", "1B2A41", "evaluate box", 13);
  arrow(s, 5.0, 3.45, 5.0, 3.85, "eval arrow");
  s.addText("Orange = the focus: one factor changes, everything else is held constant.", { x: 0.5, y: 4.7, w: 9, h: 0.35, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
}

// 3 Data and leakage control
{
  const s = content("The data, and what we removed first", "701,787 Kaggle posts from six subreddits. We removed things that let a model read the label instead of learning language: mentions of the subreddit name, texts that appear under two labels, and duplicates. The Kaggle file has no author column, so same-user leakage can only be checked on the Zenodo data.");
  s.addText("701,787", { x: 0.5, y: 1.4, w: 2.6, h: 0.8, fontFace: "Cambria", fontSize: 44, bold: true, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText("raw Reddit posts", { x: 0.5, y: 2.2, w: 2.6, h: 0.3, fontSize: 13, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText("483,715", { x: 0.5, y: 2.9, w: 2.6, h: 0.8, fontFace: "Cambria", fontSize: 44, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
  s.addText("clean posts, 2021 to 2022", { x: 0.5, y: 3.7, w: 2.8, h: 0.3, fontSize: 13, color: C.accent3, isTextBox: true, margin: 0 });
  const rows = [["Subreddit mentions", "r/depression, \"this sub\" removed"], ["Cross-posts", "same text under two labels dropped"], ["Duplicates", "exact and near copies dropped"], ["Stratified sample", "by class and month, 60k per replicate"], ["Fit on train only", "vectoriser, scaler, tuning"]];
  rows.forEach((r, i) => {
    const y = 1.4 + i * 0.68;
    s.addShape(pres.ShapeType.ellipse, { x: 3.7, y: y + 0.05, w: 0.45, h: 0.45, fill: { color: C.accent1 }, line: { color: "2A9D8F", width: 0 }, objectName: `step dot ${i + 1}` });
    s.addText(String(i + 1), { x: 3.7, y: y + 0.05, w: 0.45, h: 0.45, align: "center", valign: "middle", fontSize: 14, bold: true, color: C.background1, isTextBox: true, margin: 0 });
    s.addText(r[0], { x: 4.35, y, w: 5.1, h: 0.3, fontSize: 16, bold: true, color: C.text1, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: 4.35, y: y + 0.3, w: 5.1, h: 0.3, fontSize: 13, color: C.accent3, isTextBox: true, margin: 0 });
  });
}

// 3b Experimental setup
{
  const s = content("Splits and metrics", "Random split is the paper's setup. Same-size random has the training size of the later-period split so a drop can only come from time. Macro F1 is our main metric because schizophrenia is only 4 percent of posts. Weighted F1 and accuracy are reported to compare with the paper.");
  const rows = [[hdrc("Split"), hdrc("Train"), hdrc("Test"), hdrc("Purpose")],
    ["random", "43,200", "12,000", "the paper's setup"], ["same-size random", "24,732", "12,000", "controls training size"], ["later period", "24,732", "13,031", "train Nov 21 to Jun 22, test Aug to Nov 22"]].map((r, i) => i === 0 ? r : r.map(t => ({ text: t, options: { fontSize: 12 } })));
  s.addTable(rows, { x: 0.5, y: 1.3, w: 5.3, colW: [1.5, 0.9, 0.9, 2.0], rowH: 0.45, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  s.addText("Per replicate, 10% of train is held out for tuning and early stopping. Five replicates, each a fresh sample, split and model start.", { x: 0.5, y: 3.3, w: 5.3, h: 0.9, fontSize: 13, color: C.text1, isTextBox: true, margin: 0 });
  card(s, 6.1, 1.3, 3.4, 3.5, "metrics card");
  s.addText("Metrics", { x: 6.3, y: 1.45, w: 3.0, h: 0.35, fontSize: 16, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText([
    { text: "Macro F1 (main): ", options: { bold: true } }, { text: "every class counts equally", options: { breakLine: true } },
    { text: "Weighted F1, accuracy: ", options: { bold: true } }, { text: "to compare with the paper", options: { breakLine: true } },
    { text: "95% bootstrap interval: ", options: { bold: true } }, { text: "is a change real?", options: { breakLine: true } },
    { text: "McNemar: ", options: { bold: true } }, { text: "is one model better on the same posts?" },
  ], { x: 6.3, y: 1.9, w: 3.0, h: 2.7, fontSize: 13, color: C.text1, paraSpaceAfter: 8, valign: "top", isTextBox: true, margin: 0 });
}

// 4 Ablation: does cleaning and stratification matter
{
  const s = content("Do leakage removal and stratification matter?", "We measured both with the TF-IDF model on 20,000 posts and 5 replicates. Leakage: reported score on its own test set versus score on posts that are clean by every criterion. Stratification: all samples scored on one common reference test set drawn at random from the full clean data.");
  const L = D.leakage, S = D.strat;
  if (L) {
    s.addText("Leakage control (macro F1, 5 replicates)", { x: 0.5, y: 1.25, w: 4.6, h: 0.3, fontSize: 15, bold: true, color: C.text1, isTextBox: true, margin: 0 });
    const hdr = o => ({ text: o, options: { bold: true, color: "FFFFFF", fill: { color: "324A5F" }, fontSize: 12 } });
    const rows = [[hdr("Variant"), hdr("Reported"), hdr("On clean posts")]].concat(L.map(r => [{ text: r.variant, options: { fontSize: 12 } }, { text: fmt(r.reported_f1), options: { fontSize: 12 } }, { text: fmt(r.clean_f1), options: { fontSize: 12 } }]));
    s.addTable(rows, { x: 0.5, y: 1.6, w: 4.6, colW: [2.4, 1.0, 1.2], rowH: 0.36, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  }
  if (S) {
    s.addText("Sampling (scored on a common test set)", { x: 5.3, y: 1.25, w: 4.2, h: 0.3, fontSize: 15, bold: true, color: C.text1, isTextBox: true, margin: 0 });
    const hdr = o => ({ text: o, options: { bold: true, color: "FFFFFF", fill: { color: "324A5F" }, fontSize: 12 } });
    const rows = [[hdr("Sample"), hdr("Macro F1")]].concat(S.map(r => [{ text: r.sampling, options: { fontSize: 12 } }, { text: fmt(r.ref_macro_f1), options: { fontSize: 12 } }]));
    s.addTable(rows, { x: 5.3, y: 1.6, w: 4.2, colW: [2.9, 1.3], rowH: 0.36, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  }
  if (!L && !S) s.addText("Ablation results pending", { x: 0.5, y: 2, w: 9, h: 0.5, fontSize: 18, color: C.accent3, isTextBox: true });
  s.addText("Both are cheap insurance, not score boosters. Leakage is rare here (about 3% of posts), so scores barely move (0.620 to 0.624, within noise). Stratified and plain random samples match at 20k posts, and a class-balanced sample scores lower on the real class mix.", { x: 0.5, y: 3.7, w: 9, h: 1.2, fontSize: 15, color: C.text1, isTextBox: true, margin: 0 });
}

// 5 Methods
{
  const s = content("Three methods, same data and splits", "A is the classical baseline, B is the strong pretrained model, C is the anchor paper's model rebuilt from its equations because no code was released. Every model is trained with text only and with text plus time so the only difference is the time features.");
  const m = [["A", "TF-IDF + logistic regression", "Why: the classic baseline from Low et al. Fast and hard to beat.", C.accent1], ["B", "MentalRoBERTa", "Why: the strong text model the paper never compared with.", C.accent5], ["C", "BiLSTM + cross-modal attention", "Why: the anchor paper's own model, rebuilt from its equations.", C.accent2]];
  m.forEach((r, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.4, 2.9, 2.5, `method card ${r[0]}`);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: 1.6, w: 0.6, h: 0.6, fill: { color: r[3] }, line: { color: "FFFFFF", width: 0 }, objectName: `method badge ${r[0]}` });
    s.addText(r[0], { x: x + 0.2, y: 1.6, w: 0.6, h: 0.6, align: "center", valign: "middle", fontSize: 20, bold: true, color: C.background1, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: x + 0.2, y: 2.3, w: 2.5, h: 0.6, fontSize: 15, bold: true, color: C.text1, isTextBox: true, margin: 0 });
    s.addText(r[2], { x: x + 0.2, y: 2.95, w: 2.5, h: 0.9, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  });
  s.addText("Each trained text-only and text + time, on the same splits. A and C: 5 replicates. B: 3 replicates on a 20k training subsample (free GPU limit).", { x: 0.5, y: 4.2, w: 9, h: 0.7, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
}

// 5b Reproduction
{
  const s = content("Reproducing the anchor paper", "The paper released no code, so we rebuilt Method C from its equations. Text only we match their level (0.730 against 0.722). Their gain from time does not appear (0.730 against 0.730). Possible reasons: no stopword removal, learned embeddings instead of Word2Vec, early stopping on a separate validation set, a different sample, all logged in the decision log.");
  const rows = [[hdrc("Weighted F1, random split", 13), hdrc("Paper", 13), hdrc("Ours (C, 5 replicates)", 13)],
    [{ text: "text only", options: { fontSize: 14 } }, { text: "0.722", options: { fontSize: 14 } }, { text: fmt(g("bilstm", "text", "random", "weighted_f1_mean")), options: { fontSize: 14, bold: true } }],
    [{ text: "text + time", options: { fontSize: 14 } }, { text: "0.738", options: { fontSize: 14 } }, { text: fmt(g("bilstm", "text_time", "random", "weighted_f1_mean")), options: { fontSize: 14, bold: true } }],
    [{ text: "gain from time", options: { fontSize: 14, bold: true } }, { text: "+0.015", options: { fontSize: 14, bold: true, color: "2A9D8F" } }, { text: sgn(g("bilstm", "text_time", "random", "weighted_f1_mean") - g("bilstm", "text", "random", "weighted_f1_mean")), options: { fontSize: 14, bold: true, color: "C2410C" } }]];
  s.addTable(rows, { x: 0.5, y: 1.4, w: 5.4, colW: [2.2, 1.4, 1.8], rowH: 0.55, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  card(s, 6.2, 1.4, 3.3, 3.4, "repro card");
  s.addText("What this means", { x: 6.4, y: 1.55, w: 2.9, h: 0.35, fontSize: 15, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText([{ text: "Our rebuild reaches the paper's text-only level", options: { bullet: true, breakLine: true } }, { text: "The timing gain is not reproduced", options: { bullet: true, breakLine: true } }, { text: "No code was released, so every design choice is logged", options: { bullet: true } }], { x: 6.4, y: 2.0, w: 2.9, h: 2.6, fontSize: 13, color: C.text1, paraSpaceAfter: 8, valign: "top", isTextBox: true, margin: 0 });
  s.addText("Objective O1 was to match the paper within 3 points or explain the gap: met.", { x: 0.5, y: 3.8, w: 5.4, h: 0.6, fontSize: 13, color: C.accent3, isTextBox: true, margin: 0 });
}

// 5c Comparative results
{
  const s = content("All three methods side by side", "Same posts, same splits. Later-period test, mean of replicates. MentalRoBERTa is best on every metric. Accuracy and weighted F1 are higher than macro F1 because the big classes are easier than the small ones.");
  const rows = [[hdrc("Later-period test, text only", 13), hdrc("Accuracy", 13), hdrc("Weighted F1", 13), hdrc("Macro F1", 13)]];
  ["tfidf", "roberta", "bilstm"].forEach(m => rows.push([{ text: NAMES[m], options: { fontSize: 14, bold: true } }].concat(["accuracy_mean", "weighted_f1_mean", "macro_f1_mean"].map(c => ({ text: fmt(g(m, "text", "temporal_late", c)), options: { fontSize: 14, bold: m === "roberta", color: m === "roberta" ? "2A9D8F" : "1B2A41" } })))));
  s.addTable(rows, { x: 0.5, y: 1.4, w: 9, colW: [3.3, 1.9, 1.9, 1.9], rowH: 0.55, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  s.addText("Chance level: macro F1 0.145 (random guess). MentalRoBERTa beats both others on the same posts (McNemar p < 0.001). B uses 3 replicates and a 20k training subsample, A and C use 5 replicates.", { x: 0.5, y: 3.8, w: 9, h: 0.8, fontSize: 13, color: C.accent3, isTextBox: true, margin: 0 });
}

// 6 Main result chart
{
  const s = content("Better text model helps. Timing does not.", "Macro F1 on the later-period test, text only versus text plus time. The step from A to B is about four points. The step from adding time is under one point in every case.");
  const ms = ["tfidf", "roberta", "bilstm"];
  s.addChart(pres.charts.BAR, [
    { name: "text only", labels: ms.map(m => NAMES[m]), values: ms.map(m => +fmt(f(m, "text", "temporal_late"))) },
    { name: "text + time", labels: ms.map(m => NAMES[m]), values: ms.map(m => +fmt(f(m, "text_time", "temporal_late"))) },
  ], { x: 0.5, y: 1.3, w: 6.2, h: 3.7, barDir: "col", barGapWidthPct: 60, chartColors: ["1B2A41", "E76F51"], showLegend: true, legendPos: "b", legendFontSize: 12, legendFontFace: "+mn-lt", showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0.000", valAxisMinVal: 0, valAxisMaxVal: 0.8, valAxisLabelFontSize: 11, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", valAxisLabelColor: "6C7A89", catAxisLabelColor: "1B2A41", valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" }, showTitle: true, title: "Macro F1, later-period test (higher is better)", titleFontSize: 13, titleFontFace: "+mn-lt", titleColor: "1B2A41" });
  card(s, 7.0, 1.4, 2.5, 3.4, "readout card");
  s.addText("Gain from time", { x: 7.2, y: 1.55, w: 2.1, h: 0.35, fontSize: 15, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  ms.forEach((m, i) => {
    const r = dt(m, "temporal_late");
    s.addText(NAMES[m].split("  ")[0] + "  " + (r ? sgn(r.delta_macro_f1) : "n/a"), { x: 7.2, y: 2.05 + i * 0.85, w: 2.1, h: 0.45, fontFace: "Cambria", fontSize: 22, bold: true, color: r && r.ci_excludes_0 && r.delta_macro_f1 < 0 ? C.accent2 : C.accent1, isTextBox: true, margin: 0 });
    s.addText(r ? `95% CI ${fmt(r.ci_low)} to ${fmt(r.ci_high)}` : "", { x: 7.2, y: 2.5 + i * 0.85, w: 2.1, h: 0.3, fontSize: 11, color: C.accent3, isTextBox: true, margin: 0 });
  });
}

// 7 Does timing help? table
{
  const s = content("Does timing help? Almost never", "Change in macro F1 when time features are added, with a 95 percent paired bootstrap interval. Orange is a significant drop. The only significant gains are for the weak BiLSTM and they are about half a point. The anchor paper's 0.015 gain is not reproduced. Time alone scores at chance, 0.15 against a random guess of 0.145.");
  const hdr = o => ({ text: o, options: { bold: true, color: "FFFFFF", fill: { color: "324A5F" }, fontSize: 13 } });
  const cell = (m, sp) => { const r = dt(m, sp); if (!r) return { text: "not run", options: { fontSize: 13, color: "6C7A89" } }; const bad = r.ci_excludes_0 && r.delta_macro_f1 < 0, good = r.ci_excludes_0 && r.delta_macro_f1 > 0; return { text: `${sgn(r.delta_macro_f1)}  [${fmt(r.ci_low)}, ${fmt(r.ci_high)}]`, options: { fontSize: 13, color: bad ? "C2410C" : "1B2A41", bold: bad || good, fill: { color: bad ? "FDE8E0" : good ? "E1F3EF" : "FFFFFF" } } }; };
  const rows = [[hdr("Model"), hdr("Random split"), hdr("Same-size random"), hdr("Later period")]];
  ["tfidf", "roberta", "bilstm"].forEach(m => rows.push([{ text: NAMES[m], options: { fontSize: 13, bold: true } }, cell(m, "random"), cell(m, "random_matched"), cell(m, "temporal_late")]));
  s.addTable(rows, { x: 0.5, y: 1.35, w: 9, colW: [2.3, 2.2, 2.3, 2.2], rowH: 0.55, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  s.addText("Change in macro F1 from adding time features, 95% bootstrap interval. Shaded orange = significantly worse, green = significantly better.", { x: 0.5, y: 3.7, w: 9, h: 0.5, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText("Time alone predicts at chance level (0.15 vs 0.145 random guess).", { x: 0.5, y: 4.3, w: 9, h: 0.4, fontSize: 15, bold: true, color: C.text1, isTextBox: true, margin: 0 });
}

// 8 Time shift and confound
{
  const s = content("Later posts cost nothing", "Training on Nov 2021 to Jun 2022 and testing on Aug to Nov 2022 scores the same as a random split of the same size. The shift effect is about minus 0.001 with an interval of roughly plus or minus 0.007. The anchor paper's 2021 to 2022 split is confounded: depression, bipolar and schizophrenia posts essentially start in Nov 2021 in this file, so that split measures a collection change, not language drift.");
  s.addImage({ path: path.join(__dirname, "..", "paper", "fig4_class_mix_by_month.png"), x: 0.5, y: 1.35, w: 5.4, h: 2.55, altText: "Class share by month: three classes only exist from Nov 2021" });
  s.addText("Three classes only exist from Nov 2021", { x: 0.5, y: 3.95, w: 5.4, h: 0.3, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  card(s, 6.2, 1.35, 3.3, 3.45, "shift card");
  s.addText("Later vs same-size random", { x: 6.4, y: 1.5, w: 2.9, h: 0.5, fontSize: 14, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  ["tfidf", "roberta", "bilstm"].map(m => D.delta_shift.find(r => r.model === m)).filter(Boolean).forEach((r, i) => {
    s.addText(`${NAMES[r.model].split("  ")[0]}  ${sgn(r.delta_macro_f1)}`, { x: 6.4, y: 2.1 + i * 0.75, w: 2.9, h: 0.4, fontFace: "Cambria", fontSize: 20, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
    s.addText(`95% CI ${fmt(r.ci_low)} to ${fmt(r.ci_high)}, includes 0`, { x: 6.4, y: 2.5 + i * 0.75, w: 2.9, h: 0.3, fontSize: 11, color: C.accent3, isTextBox: true, margin: 0 });
  });
  s.addText("The paper's 2021 to 2022 split is confounded: Method A with time falls to 0.25, and to 0.54 without month and day.", { x: 0.5, y: 4.3, w: 5.4, h: 0.6, fontSize: 13, color: C.text1, isTextBox: true, margin: 0 });
}

// 9 Verdict
{
  const s = pres.addSlide({ masterName: "DARK" });
  s.addText("What we found", { x: 0.7, y: 0.5, w: 8.6, h: 0.7, fontFace: "Cambria", fontSize: 36, bold: true, color: C.background1, isTextBox: true, margin: 0 });
  const pts = [["Timing is not a reliable signal.", "No gain for the strongest models, a small loss for TF-IDF under shift."], ["Model choice matters more.", "A pretrained mental-health model beats TF-IDF by about four points."], ["Later posts are not harder here.", "Within Nov 2021 to Nov 2022, no measurable drop."], ["The paper's split is confounded.", "Class mix changes with the collection date."]];
  pts.forEach((p, i) => {
    const y = 1.5 + i * 0.85;
    s.addShape(pres.ShapeType.ellipse, { x: 0.7, y: y + 0.05, w: 0.45, h: 0.45, fill: { color: C.accent1 }, line: { color: "2A9D8F", width: 0 }, objectName: `finding dot ${i + 1}` });
    s.addText(String(i + 1), { x: 0.7, y: y + 0.05, w: 0.45, h: 0.45, align: "center", valign: "middle", fontSize: 14, bold: true, color: C.background1, isTextBox: true, margin: 0 });
    s.addText(p[0], { x: 1.4, y, w: 8, h: 0.35, fontSize: 18, bold: true, color: C.background1, isTextBox: true, margin: 0 });
    s.addText(p[1], { x: 1.4, y: y + 0.35, w: 8, h: 0.35, fontSize: 14, color: "CBD5E1", isTextBox: true, margin: 0 });
  });
  s.addNotes("Be honest about limits on this slide: labels are subreddits not diagnoses, condition names stay in the text, no author column in the Kaggle file, our BiLSTM is a rebuild, the valid shift window is only nine months, Method B uses a 20k subsample.");
}

// 9b Team
{
  const s = content("Team and responsibilities", "Everyone reviewed papers and can explain the whole study. Abhinav leads and coordinates.");
  const rows = [[hdrc("Member"), hdrc("Phase I responsibility"), hdrc("Papers reviewed")],
    ["Abhinav Pandey (lead)", "Coordination, repo, Method C, timing ablation, report", "Saeed & Ahmed 2025, MentalBERT"],
    ["Thotagamuwage Sudesh Nimesha", "Method A, statistics (bootstrap, McNemar)", "Low et al. 2020, Cao et al. 2024"],
    ["Jaskamal", "Data loading, leakage removal, time splits", "Cohan et al. 2018, Kamarudin et al. 2025"],
    ["Zohaib Jawaid", "Method B (MentalRoBERTa on Colab)", "Kumar et al. 2024, Menta 2025"],
    ["Xing Liao", "Phase II interface, explanations, ethics", "Parapar et al. 2025 (eRisk)"]].map((r, i) => i === 0 ? r : r.map(t => ({ text: t, options: { fontSize: 12 } })));
  s.addTable(rows, { x: 0.5, y: 1.3, w: 9, colW: [2.6, 3.6, 2.8], rowH: 0.5, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  s.addText("Code, logs and decisions: github.com/Abhinavxox/reddit-mental-health-timing", { x: 0.5, y: 4.5, w: 9, h: 0.35, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
}

// 10 Limits and next
{
  const s = content("Limits, and what comes next", "Limits are on the left. Phase II is a moderator triage assistant that uses the best model, with an ethics plan. Xing Liao leads the interface, explanations and ethics report.");
  card(s, 0.5, 1.4, 4.4, 3.4, "limits card");
  s.addText("Limits", { x: 0.75, y: 1.55, w: 3.9, h: 0.4, fontSize: 18, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText([
    { text: "Labels are subreddits, not diagnoses", options: { bullet: true, breakLine: true } },
    { text: "Condition names stay in the text", options: { bullet: true, breakLine: true } },
    { text: "No author column, same-user leakage unchecked on Kaggle", options: { bullet: true, breakLine: true } },
    { text: "Method C is our rebuild, B uses a 20k subsample", options: { bullet: true, breakLine: true } },
    { text: "Shift window is about nine months", options: { bullet: true } },
  ], { x: 0.75, y: 2.05, w: 3.9, h: 2.6, fontSize: 14, color: C.text1, paraSpaceAfter: 6, valign: "top", isTextBox: true, margin: 0 });
  card(s, 5.1, 1.4, 4.4, 3.4, "next card");
  s.addText("Next: Phase II", { x: 5.35, y: 1.55, w: 3.9, h: 0.4, fontSize: 18, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText([
    { text: "Moderator triage assistant using the strongest text model", options: { bullet: true, breakLine: true } },
    { text: "Explanations for each flag", options: { bullet: true, breakLine: true } },
    { text: "Ethics and safety report", options: { bullet: true, breakLine: true } },
    { text: "A human always makes the final call", options: { bullet: true } },
  ], { x: 5.35, y: 2.05, w: 3.9, h: 2.6, fontSize: 14, color: C.text1, paraSpaceAfter: 6, valign: "top", isTextBox: true, margin: 0 });
}

// 11 References
{
  const s = content("References", "Full reviews of every paper are in docs/literature/literature_review_combined.md in the repo.");
  const R = [
    "Saeed, Q. B., & Ahmed, I. (2025). Early detection of mental health issues using social media posts. arXiv:2503.07653.",
    "Low, D. M., et al. (2020). NLP reveals vulnerable mental health support groups and heightened health anxiety on Reddit during COVID-19. JMIR 22(10), e22635.",
    "Cohan, A., et al. (2018). SMHD: A large-scale resource for multiple mental health conditions. COLING 2018.",
    "Kumar, R., Maharaj, K., Saxena, A., & Bhattacharyya, P. (2024). Mental disorder classification via temporal representation of text. Findings of EMNLP 2024.",
    "Parapar, J., Pérez, A., Wang, X., & Crestani, F. (2025). Overview of eRisk at CLEF 2025. CEUR-WS 4038.",
    "Ji, S., et al. (2022). MentalBERT: Publicly available pretrained language models for mental healthcare. LREC 2022.",
    "Cao, Y., et al. (2024). ML approaches for mental illness detection on social media: a systematic review of biases. arXiv:2410.16204.",
    "Kamarudin, N. S., Beigi, G., Manikonda, L., & Liu, H. (2025). Social media for mental health: Data, methods, and findings. arXiv:2511.07914.",
    "Zhang, T., et al. (2025). Menta: A small language model for on-device mental health prediction. arXiv:2512.02716.",
    "Miyaguchi, A., et al. (2025). DS@GT at eRisk 2025. arXiv:2507.10958.",
    "World Health Organization (2025). Depression fact sheet; (2022) World mental health report; (2025) Suicide worldwide in 2021.",
    "Data: Kaggle Mental Disorders Identification (Reddit), kamaruladha; Low et al. Reddit Mental Health Dataset, Zenodo 3941387.",
  ];
  s.addText(R.map((t, i) => ({ text: `[${i + 1}] ${t}`, options: { breakLine: i < R.length - 1 } })), { x: 0.5, y: 1.2, w: 9, h: 3.9, fontSize: 10, color: C.text1, paraSpaceAfter: 3, valign: "top", isTextBox: true, margin: 0 });
}

(async () => {
  const out = path.join(__dirname, "Phase1_Timing_Matters.pptx");
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("wrote", out);
})();
