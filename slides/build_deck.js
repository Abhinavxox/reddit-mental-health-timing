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
  s.addText("Group 2  ·  COMP 8790 Topics in Applied AI  ·  Phase I", { x: 0.7, y: 4.4, w: 8.6, h: 0.4, fontSize: 14, color: "2A9D8F", bold: true, isTextBox: true, margin: 0 });
  s.addNotes("Introduce the team and the question. One sentence: we tested whether a claim in a recent paper, that adding posting time helps classify mental-health posts, holds up.");
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
  const m = [["A", "TF-IDF + logistic regression", "Counts words and word pairs. Fast, a strong baseline.", C.accent1], ["B", "MentalRoBERTa", "Pretrained on mental-health Reddit, fine-tuned on our data (Colab GPU).", C.accent5], ["C", "BiLSTM + cross-modal attention", "The anchor paper's model, rebuilt from its equations.", C.accent2]];
  m.forEach((r, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.4, 2.9, 2.5, `method card ${r[0]}`);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: 1.6, w: 0.6, h: 0.6, fill: { color: r[3] }, line: { color: "FFFFFF", width: 0 }, objectName: `method badge ${r[0]}` });
    s.addText(r[0], { x: x + 0.2, y: 1.6, w: 0.6, h: 0.6, align: "center", valign: "middle", fontSize: 20, bold: true, color: C.background1, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: x + 0.2, y: 2.3, w: 2.5, h: 0.6, fontSize: 15, bold: true, color: C.text1, isTextBox: true, margin: 0 });
    s.addText(r[2], { x: x + 0.2, y: 2.95, w: 2.5, h: 0.9, fontSize: 12, color: C.accent3, isTextBox: true, margin: 0 });
  });
  s.addText("Each trained text-only and text + time, on a random split and on a later-period test (Aug to Nov 2022). Five replicates, paired bootstrap intervals.", { x: 0.5, y: 4.2, w: 9, h: 0.7, fontSize: 14, color: C.text1, isTextBox: true, margin: 0 });
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

(async () => {
  const out = path.join(__dirname, "Phase1_Timing_Matters.pptx");
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("wrote", out);
})();
