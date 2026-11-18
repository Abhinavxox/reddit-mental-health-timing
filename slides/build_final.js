// node build_final.js (9-slide final presentation + backup). -> Phase1_Timing_Matters.pptx (numbers from deck_data.json). Then run: python slides/speaker_notes.py (presenters and notes)
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


const demoTag = (s, cmd) => { s.addShape(pres.ShapeType.roundRect, { x: 5.2, y: 5.0, w: 3.8, h: 0.38, rectRadius: 0.08, fill: { color: "E76F51" }, line: { color: "E76F51", width: 0 }, objectName: "demo tag" }); s.addText([{ text: "LIVE DEMO  ", options: { bold: true } }, { text: cmd, options: { fontFace: "Courier New" } }], { x: 5.2, y: 5.0, w: 3.8, h: 0.38, fontSize: 11, color: "FFFFFF", align: "center", valign: "middle", isTextBox: true, margin: 2 }); };

// S1 Title and team
{
  const s = pres.addSlide({ masterName: "DARK" });
  s.addText("Does Timing Matter?", { x: 0.6, y: 0.45, w: 8.8, h: 0.8, fontFace: "Cambria", fontSize: 40, bold: true, color: C.background1, isTextBox: true, margin: 0 });
  s.addText("Temporal signals and time-robustness in AI detection of mental-health risk from Reddit posts", { x: 0.6, y: 1.25, w: 8.8, h: 0.6, fontSize: 16, color: "CBD5E1", isTextBox: true, margin: 0 });
  const team = [["Abhinav Pandey (lead)", "Methods B and C, timing experiment"], ["Thotagamuwage Sudesh Nimesha", "Statistics, paper comparison"], ["Jaskamal", "Method A (TF-IDF + LR)"], ["Zohaib Jawaid", "Model explanations"], ["Xing Liao", "Data, leakage removal, splits"]];
  team.forEach((t, i) => {
    const x = 0.6 + (i % 3) * 3.0, y = 2.25 + Math.floor(i / 3) * 1.05;
    s.addShape(pres.ShapeType.roundRect, { x, y, w: 2.8, h: 0.85, rectRadius: 0.08, fill: { color: "324A5F" }, line: { color: "324A5F", width: 0 }, objectName: `team card ${i}` });
    s.addText(t[0], { x: x + 0.15, y: y + 0.08, w: 2.5, h: 0.35, fontSize: 13, bold: true, color: "FFFFFF", isTextBox: true, margin: 0 });
    s.addText(t[1], { x: x + 0.15, y: y + 0.43, w: 2.5, h: 0.35, fontSize: 11, color: "CBD5E1", isTextBox: true, margin: 0 });
  });
  s.addText("Group 2  ·  COMP 8790 Topics in Applied AI  ·  Healthcare (mental health)  ·  Phase I final", { x: 0.6, y: 4.75, w: 8.8, h: 0.35, fontSize: 12, color: "2A9D8F", bold: true, isTextBox: true, margin: 0 });
}

// S2 Problem and motivation
{
  const s = content("Problem and research motivation");
  [["280M", "people with depression (WHO 2025)"], ["301M", "with anxiety disorders (WHO 2022)"], ["727k", "suicide deaths in 2021 (WHO 2025)"]].forEach((r, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.2, 2.9, 1.15, `stat card ${i}`);
    s.addText(r[0], { x: x + 0.2, y: 1.25, w: 2.5, h: 0.6, fontFace: "Cambria", fontSize: 28, bold: true, color: C.accent2, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: x + 0.2, y: 1.85, w: 2.5, h: 0.4, fontSize: 11, color: C.accent3, isTextBox: true, margin: 0 });
  });
  s.addText([{ text: "Task: ", options: { bold: true } }, { text: "classify a Reddit post into one of 6 mental-health communities, to help moderators sort posts. AI supports a human, it never diagnoses." }], { x: 0.5, y: 2.6, w: 9, h: 0.6, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
  card(s, 0.5, 3.35, 9, 1.5, "claim card");
  s.addText([{ text: "The claim we test: ", options: { bold: true, color: "E76F51" } }, { text: "Saeed & Ahmed (2025) add posting time to a BiLSTM and report weighted F1 0.7222 → 0.7376. One run, no strong baseline, no code.", options: { breakLine: true } },
    { text: "Our question: ", options: { bold: true, color: "2A9D8F" } }, { text: "do posting-time features really help over a strong text model, and do models lose accuracy on later posts?" }], { x: 0.7, y: 3.45, w: 8.6, h: 1.3, fontSize: 14, color: C.text1, paraSpaceAfter: 6, valign: "middle", isTextBox: true, margin: 0 });
}

// S3 Literature and gap
{
  const s = content("Literature review and research gap");
  const rows = [[hdrc("Paper (reviewer)"), hdrc("Approach"), hdrc("Finding"), hdrc("Limitation")],
    ["Saeed & Ahmed 2025 (Abhinav)", "BiLSTM + time, attention", "+1.5 F1 from time", "one split, no transformer, no code"],
    ["Low et al. 2020 (Sudesh)", "TF-IDF + linear models", "weighted F1 0.851, COVID shift", "never tests robustness"],
    ["Cohan et al. 2018 (Jaskamal)", "SMHD, TF-IDF, CNN", "high precision, low recall", "no time split"],
    ["Kumar et al. 2024 (Zohaib)", "post history as time series", "post order matters", "user level only"],
    ["Parapar et al. 2025 (Xing)", "eRisk benchmark", "recall alone misleads", "no timestamp features"]].map((r, i) => i === 0 ? r : r.map(t => ({ text: t, options: { fontSize: 11 } })));
  s.addTable(rows, { x: 0.5, y: 1.2, w: 9, colW: [2.3, 2.2, 2.2, 2.3], rowH: 0.4, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  card(s, 0.5, 3.85, 9, 0.95, "gap card");
  s.addText([{ text: "Gap: ", options: { bold: true, color: "E76F51" } }, { text: "nobody tested whether timestamp features help against a strong text model, with repeated runs, leakage control and a valid later-period test." }], { x: 0.7, y: 3.85, w: 8.6, h: 0.95, fontSize: 14, color: C.text1, valign: "middle", isTextBox: true, margin: 0 });
}

// S4 Implemented methodology
{
  const s = content("Implemented research methodology");
  const steps = ["Kaggle Reddit\n701,787 posts", "Clean and\nremove leakage", "Stratified 60k\nx 5 replicates", "Splits: random,\nsame-size, later"];
  steps.forEach((t, i) => { box(s, 0.5 + i * 2.35, 1.2, 2.0, 0.85, t, "324A5F", "FFFFFF", `flow step ${i}`); if (i < 3) arrow(s, 2.5 + i * 2.35, 1.625, 2.85 + i * 2.35, 1.625, `flow arrow ${i}`); });
  arrow(s, 5.0, 2.05, 5.0, 2.35, "down arrow");
  [["A  TF-IDF + LR", "2A9D8F", "class weights, C tuned on validation"], ["B  MentalRoBERTa", "5B6C9D", "fine-tuned on Colab T4, 20k train cap"], ["C  BiLSTM + attention", "E76F51", "rebuilt from the paper's equations"]].forEach((t, i) => {
    box(s, 0.5 + i * 3.05, 2.4, 2.85, 0.5, t[0], t[1], "FFFFFF", `method ${i}`, 13);
    s.addText(t[2], { x: 0.5 + i * 3.05, y: 2.92, w: 2.85, h: 0.35, fontSize: 11, color: C.accent3, align: "center", isTextBox: true, margin: 0 });
  });
  box(s, 0.5, 3.4, 9.0, 0.55, "Each model trained twice: text only  vs  text + 6 time features (hour, weekday, month, day, weekend, working hour)", "F4A261", "1B2A41", "focus box", 13);
  arrow(s, 5.0, 3.95, 5.0, 4.2, "eval arrow");
  box(s, 0.5, 4.2, 9.0, 0.55, "Evaluate: macro F1 (main), weighted F1, accuracy · 95% paired bootstrap · McNemar", "EEF2F6", "1B2A41", "eval box", 13);
}

// S5 Dataset and setup
{
  const s = content("Dataset and experimental setup");
  s.addText("701,787 → 483,715", { x: 0.5, y: 1.15, w: 4.4, h: 0.55, fontFace: "Cambria", fontSize: 26, bold: true, color: C.accent1, isTextBox: true, margin: 0 });
  s.addText("Kaggle Reddit posts, 6 subreddits, 2021–2022. Label = subreddit.", { x: 0.5, y: 1.7, w: 4.4, h: 0.35, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText([{ text: "Removed subreddit mentions (6,741 posts)", options: { bullet: true, breakLine: true } }, { text: "Dropped cross-posts with two labels", options: { bullet: true, breakLine: true } }, { text: "Dropped duplicates", options: { bullet: true, breakLine: true } }, { text: "Stratified sample by class and month", options: { bullet: true, breakLine: true } }, { text: "Everything fitted on training data only", options: { bullet: true } }], { x: 0.5, y: 2.15, w: 4.4, h: 1.9, fontSize: 13, color: C.text1, paraSpaceAfter: 4, valign: "top", isTextBox: true, margin: 0 });
  const rows = [[hdrc("Split"), hdrc("Train / test"), hdrc("Purpose")], ["random", "43,200 / 12,000", "paper's setup"], ["same-size random", "24,732 / 12,000", "controls train size"], ["later period", "24,732 / 13,031", "Nov21–Jun22 → Aug–Nov22"]].map((r, i) => i === 0 ? r : r.map(t => ({ text: t, options: { fontSize: 11 } })));
  s.addTable(rows, { x: 5.1, y: 1.15, w: 4.4, colW: [1.35, 1.35, 1.7], rowH: 0.4, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  card(s, 5.1, 2.95, 4.4, 1.85, "metrics card");
  s.addText([{ text: "Baselines: ", options: { bold: true } }, { text: "random guess (macro F1 0.145), time only, text only", options: { breakLine: true } }, { text: "Main metric: ", options: { bold: true } }, { text: "macro F1, every class counts equally (schizophrenia is 4%)", options: { breakLine: true } }, { text: "Also: ", options: { bold: true } }, { text: "weighted F1 and accuracy to compare with the paper" }], { x: 5.3, y: 3.05, w: 4.0, h: 1.65, fontSize: 12, color: C.text1, paraSpaceAfter: 5, valign: "top", isTextBox: true, margin: 0 });
}

// S6 Reproduction (demo)
{
  const s = content("Reproduction of existing methods");
  demoTag(s, "python demo.py repro");
  const rows = [[hdrc("Method (source)", 12), hdrc("Original result", 12), hdrc("Ours", 12), hdrc("Comparable?", 12)],
    ["C BiLSTM, text only (Saeed & Ahmed)", "0.722 weighted F1", fmt(g("bilstm", "text", "random", "weighted_f1_mean")), "yes, same data"],
    ["C BiLSTM, text + time (Saeed & Ahmed)", "0.738 weighted F1", fmt(g("bilstm", "text_time", "random", "weighted_f1_mean")), "yes, same data"],
    ["A TF-IDF + LR (Low et al.)", "0.851 weighted F1", fmt(g("tfidf", "text", "random", "weighted_f1_mean")), "no, 15 subreddits"],
    ["B MentalRoBERTa (Ji et al.)", "best on most of 8 benchmarks", fmt(g("roberta", "text", "temporal_late", "weighted_f1_mean")) + " (later)", "no, other datasets"]].map((r, i) => i === 0 ? r : r.map((t, j) => ({ text: t, options: { fontSize: 11, bold: j === 2 } })));
  s.addTable(rows, { x: 0.5, y: 1.2, w: 9, colW: [3.2, 1.9, 1.3, 2.6], rowH: 0.42, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  card(s, 0.5, 3.45, 9, 1.4, "discrepancy card");
  s.addText([{ text: "Text-only level reproduced (0.730 vs 0.722). Timing gain not reproduced (+0.015 vs -0.001).", options: { bold: true, breakLine: true } },
    { text: "Possible reasons: no code released, so we chose embeddings, stopword handling and early stopping on a separate validation set (the paper selects on its reported set); different sample. Every choice is written in our decision log.", options: {} }], { x: 0.7, y: 3.5, w: 8.6, h: 1.3, fontSize: 12, color: C.text1, valign: "middle", isTextBox: true, margin: 0 });
}

// S7 Comparative evaluation
{
  const s = content("Comparative experimental evaluation");
  const ms = ["tfidf", "roberta", "bilstm"];
  s.addChart(pres.charts.BAR, [
    { name: "text only", labels: ms.map(m => NAMES[m]), values: ms.map(m => +fmt(f(m, "text", "temporal_late"))) },
    { name: "text + time", labels: ms.map(m => NAMES[m]), values: ms.map(m => +fmt(f(m, "text_time", "temporal_late"))) },
  ], { x: 0.4, y: 1.1, w: 5.4, h: 3.6, barDir: "col", barGapWidthPct: 60, chartColors: ["1B2A41", "E76F51"], showLegend: true, legendPos: "b", legendFontSize: 11, legendFontFace: "+mn-lt", showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0.000", valAxisMinVal: 0, valAxisMaxVal: 0.8, valAxisLabelFontSize: 10, catAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", valAxisLabelColor: "6C7A89", catAxisLabelColor: "1B2A41", valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" }, showTitle: true, title: "Macro F1, later-period test", titleFontSize: 12, titleFontFace: "+mn-lt", titleColor: "1B2A41" });
  const rows = [[hdrc("Text only", 11), hdrc("Acc", 11), hdrc("Macro F1", 11)]];
  ms.forEach(m => rows.push([{ text: NAMES[m], options: { fontSize: 11, bold: true } }, { text: fmt(g(m, "text", "temporal_late", "accuracy_mean")), options: { fontSize: 11, color: m === "roberta" ? "2A9D8F" : "1B2A41", bold: m === "roberta" } }, { text: fmt(g(m, "text", "temporal_late", "macro_f1_mean")), options: { fontSize: 11, color: m === "roberta" ? "2A9D8F" : "1B2A41", bold: m === "roberta" } }]));
  s.addTable(rows, { x: 6.0, y: 1.2, w: 3.5, colW: [1.7, 0.8, 1.0], rowH: 0.4, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  s.addText([{ text: "B beats A and C on the same posts (McNemar p < 0.001).", options: { breakLine: true } }, { text: "Model choice moves macro F1 by up to 7 points; adding time by under 2.", options: { breakLine: true } }, { text: "Limit: B uses 3 replicates and a 20k training cap." }], { x: 6.0, y: 2.95, w: 3.5, h: 1.8, fontSize: 12, color: C.text1, paraSpaceAfter: 6, valign: "top", isTextBox: true, margin: 0 });
}

// S8 Extension and findings (demo)
{
  const s = content("Extension experiment and research findings");
  demoTag(s, "python demo.py extension");
  const cell = (m, sp) => { const r = dt(m, sp); if (!r) return { text: "not run", options: { fontSize: 11, color: "6C7A89" } }; const bad = r.ci_excludes_0 && r.delta_macro_f1 < 0, good = r.ci_excludes_0 && r.delta_macro_f1 > 0; return { text: `${sgn(r.delta_macro_f1)} [${fmt(r.ci_low)}, ${fmt(r.ci_high)}]`, options: { fontSize: 10, color: bad ? "C2410C" : "1B2A41", bold: bad || good, fill: { color: bad ? "FDE8E0" : good ? "E1F3EF" : "FFFFFF" } } }; };
  const rows = [[hdrc("Gain from time", 11), hdrc("Random", 11), hdrc("Later period", 11)]];
  ["tfidf", "roberta", "bilstm"].forEach(m => rows.push([{ text: NAMES[m], options: { fontSize: 11, bold: true } }, cell(m, "random"), cell(m, "temporal_late")]));
  s.addTable(rows, { x: 0.5, y: 1.2, w: 5.6, colW: [1.8, 1.9, 1.9], rowH: 0.42, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  s.addText("Change in macro F1, 95% bootstrap interval. Orange = worse, green = better, white = no real effect.", { x: 0.5, y: 2.95, w: 5.6, h: 0.45, fontSize: 10, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText([{ text: "Later posts vs same-size random: ", options: { bold: true } }, { text: "A -0.001, B +0.008, C -0.001, all intervals include 0." }], { x: 0.5, y: 3.4, w: 5.6, h: 0.6, fontSize: 12, color: C.text1, isTextBox: true, margin: 0 });
  card(s, 6.35, 1.2, 3.15, 3.6, "findings card");
  s.addText("Hypothesis not supported", { x: 6.55, y: 1.3, w: 2.8, h: 0.4, fontSize: 14, bold: true, color: C.accent2, isTextBox: true, margin: 0 });
  s.addText([{ text: "Time alone = chance (0.15)", options: { bullet: true, breakLine: true } }, { text: "Paper's 2021→2022 split is confounded: 3 classes only exist from Nov 2021", options: { bullet: true, breakLine: true } }, { text: "Month features there drop A to 0.25", options: { bullet: true } }], { x: 6.55, y: 1.75, w: 2.8, h: 1.9, fontSize: 11, color: C.text1, paraSpaceAfter: 4, valign: "top", isTextBox: true, margin: 0 });
  s.addText([{ text: "Contribution: ", options: { bold: true, color: "2A9D8F" } }, { text: "first repeated, leakage-controlled test of the timing claim; shows it fails against strong text models and exposes the data confound." }], { x: 0.5, y: 4.05, w: 5.6, h: 0.8, fontSize: 12, color: C.text1, isTextBox: true, margin: 0 });
}

// S9 Conclusion and Phase II
{
  const s = pres.addSlide({ masterName: "DARK" });
  s.addText("Conclusion and Phase II direction", { x: 0.6, y: 0.35, w: 8.8, h: 0.6, fontFace: "Cambria", fontSize: 30, bold: true, color: C.background1, isTextBox: true, margin: 0 });
  s.addText("Findings", { x: 0.6, y: 1.1, w: 4.2, h: 0.35, fontSize: 15, bold: true, color: "2A9D8F", isTextBox: true, margin: 0 });
  s.addText([{ text: "Timing is not a reliable signal", options: { bullet: true, breakLine: true } }, { text: "Model choice matters far more (B best, 0.68 macro F1)", options: { bullet: true, breakLine: true } }, { text: "No loss on later posts (Nov 2021 to Nov 2022)", options: { bullet: true, breakLine: true } }, { text: "Paper's time split is confounded", options: { bullet: true } }], { x: 0.6, y: 1.5, w: 4.2, h: 1.7, fontSize: 13, color: "FFFFFF", paraSpaceAfter: 5, valign: "top", isTextBox: true, margin: 0 });
  s.addText("Limitations", { x: 0.6, y: 3.25, w: 4.2, h: 0.35, fontSize: 15, bold: true, color: "F4A261", isTextBox: true, margin: 0 });
  s.addText("Labels are subreddits, not diagnoses. No author column. Short time window. B on a 20k cap.", { x: 0.6, y: 3.6, w: 4.2, h: 0.9, fontSize: 12, color: "CBD5E1", isTextBox: true, margin: 0 });
  s.addText("Phase II: moderator triage assistant", { x: 5.2, y: 1.1, w: 4.3, h: 0.35, fontSize: 15, bold: true, color: "2A9D8F", isTextBox: true, margin: 0 });
  s.addText([{ text: "Use the strongest text model, drop time features", options: { bullet: true, breakLine: true } }, { text: "Explain each flag with its key words (e.g. lamictal → bipolar, voices → schizophrenia)", options: { bullet: true, breakLine: true } }, { text: "Warn on the weak class: 35% of mentalillness posts go to depression", options: { bullet: true, breakLine: true } }, { text: "A human always makes the final call", options: { bullet: true } }], { x: 5.2, y: 1.5, w: 4.3, h: 2.6, fontSize: 13, color: "FFFFFF", paraSpaceAfter: 5, valign: "top", isTextBox: true, margin: 0 });
  s.addText("Thank you. Questions?", { x: 5.2, y: 4.4, w: 4.3, h: 0.45, fontSize: 16, bold: true, color: "F4A261", isTextBox: true, margin: 0 });
}

// Backup slides
{
  const s = pres.addSlide({ masterName: "DARK" });
  s.addText("Backup slides", { x: 0.6, y: 2.2, w: 8.8, h: 0.8, fontFace: "Cambria", fontSize: 36, bold: true, color: C.background1, isTextBox: true, margin: 0 });
  s.addText("For questions only", { x: 0.6, y: 3.0, w: 8.8, h: 0.4, fontSize: 16, color: "CBD5E1", isTextBox: true, margin: 0 });
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

// 8b What the model looks at (Zohaib)
{
  const s = content("What the model looks at", "Method A gives each word a weight per class, so we can read the words it relies on most. It mostly finds people naming their condition, medications, symptoms and therapy. Errors flow into depression, the biggest class. Written up by Zohaib in phase1/results/README.md.");
  const rows = [[hdrc("Class"), hdrc("Top words (Method A)")],
    ["anxiety", "anxiety, anxious, panic"], ["bipolar", "bipolar, manic, lamictal"], ["bpd", "bpd, fp (favourite person), dbt"],
    ["depression", "depression, depressed, suicide"], ["mentalillness", "mental, ocd, adhd"], ["schizophrenia", "schizophrenia, voices, delusions"]].map((r, i) => i === 0 ? r : r.map(t => ({ text: t, options: { fontSize: 12 } })));
  s.addTable(rows, { x: 0.5, y: 1.3, w: 5.0, colW: [1.6, 3.4], rowH: 0.42, border: { type: "solid", color: "D5DCE4", pt: 0.5 }, color: "1B2A41", valign: "middle" });
  card(s, 5.8, 1.3, 3.7, 3.5, "confusion card");
  s.addText("Most common mistakes", { x: 6.0, y: 1.45, w: 3.3, h: 0.35, fontSize: 15, bold: true, color: C.text1, isTextBox: true, margin: 0 });
  s.addText("35%", { x: 6.0, y: 1.9, w: 3.3, h: 0.55, fontFace: "Cambria", fontSize: 28, bold: true, color: C.accent2, isTextBox: true, margin: 0 });
  s.addText("of mentalillness posts are taken for depression", { x: 6.0, y: 2.45, w: 3.3, h: 0.45, fontSize: 12, color: C.text1, isTextBox: true, margin: 0 });
  s.addText("18%", { x: 6.0, y: 3.0, w: 3.3, h: 0.55, fontFace: "Cambria", fontSize: 28, bold: true, color: C.accent2, isTextBox: true, margin: 0 });
  s.addText("of bpd posts are taken for depression", { x: 6.0, y: 3.55, w: 3.3, h: 0.45, fontSize: 12, color: C.text1, isTextBox: true, margin: 0 });
  s.addText("When unsure, the model picks the biggest class.", { x: 6.0, y: 4.1, w: 3.3, h: 0.55, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  s.addText("No subreddit names in the top words, so the leakage removal worked. Labels are communities, not diagnoses.", { x: 0.5, y: 4.4, w: 5.0, h: 0.6, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
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
  const out = path.join(__dirname, "Phase1_Final_Presentation.pptx");
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("wrote", out);
})();
