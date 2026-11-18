"""Adds the presenter and speaker notes to each slide, and writes speaker_script.md.
Run after build_deck.js:  python slides/speaker_notes.py"""
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

HERE = Path(__file__).parent
S = [
 ("Abhinav", "Title", ["Hi, we are Group 2. Our project: Does Timing Matter?", "Introduce the team in one line each (names on the slide).", "Domain: healthcare, mental health on Reddit."]),
 ("Abhinav", "Why this problem matters", ["Millions live with depression and anxiety (read the three numbers).", "Many people write about distress online before seeing anyone.", "Moderators cannot read every post, so AI can help them sort.", "Key point: AI supports a human, it never diagnoses."]),
 ("Sudesh", "Five core papers and the gap", ["Each of us reviewed papers; these are the five core ones.", "Walk the table quickly: anchor paper, Low (simple baseline), Cohan (low recall), Kumar (time as post order), eRisk (recall alone misleads).", "Gap: nobody checked if timing helps against a strong text model, with repeated runs and a proper later-period test."]),
 ("Abhinav", "A paper says timing helps. We checked.", ["Anchor paper claims 0.7222 to 0.7376 by adding posting time.", "One run, no strong baseline, no code.", "Our two questions: does timing really help, and do models still work on later posts?"]),
 ("Abhinav", "How the study works", ["Follow the arrows: Kaggle data, cleaning, stratified sample, splits.", "Same data goes into three models.", "Orange box is the experiment: text only vs text + time, nothing else changes.", "Then we score everything the same way, with confidence intervals."]),
 ("Xing", "The data, and what we removed first", ["701,787 Reddit posts from 6 subreddits; the label is the subreddit, not a diagnosis.", "After cleaning: 483,715 posts from 2021 and 2022.", "Leakage = the model cheating. We removed subreddit mentions, cross-posts with two labels, and duplicates.", "Everything is learned from training data only."]),
 ("Xing", "Splits and metrics", ["Random split is the paper's setup.", "Same-size random has the training size of the time split, so a drop can only come from time.", "Later period: train Nov 2021 to Jun 2022, test Aug to Nov 2022.", "Main metric macro F1, so small classes like schizophrenia (4%) count as much as big ones."]),
 ("Xing", "Do leakage removal and stratification matter?", ["We tested it: turned each cleaning step off.", "Score barely moved, 0.620 vs 0.624, because leakage was only about 3% of posts.", "So cleaning is insurance: it proves the score is honest.", "Stratified and plain random sampling score the same; class-balanced is worse (0.607)."]),
 ("Jaskamal", "Three methods, same data and splits", ["A: TF-IDF + logistic regression. Words become scores, the model learns which words point to which class. Simple and strong.", "B: MentalRoBERTa, a language model pretrained on mental-health Reddit.", "C: the anchor paper's BiLSTM with attention, rebuilt from its equations.", "Each one trained twice: text only and text + time."]),
 ("Sudesh", "Reproducing the anchor paper", ["No code was released, so we rebuilt their model from the paper.", "Text only we match them: 0.730 vs their 0.722.", "But adding time gives no gain: 0.730 vs 0.730, they reported +0.015.", "Possible reasons are all logged in our decision log."]),
 ("Jaskamal", "All three methods side by side", ["Same posts, later-period test, text only.", "MentalRoBERTa is best: accuracy 0.78, macro F1 0.68.", "Method A (mine) 0.74 accuracy, 0.64 macro F1, close behind for a much simpler model.", "Macro F1 is lower than accuracy because the small classes are harder."]),
 ("Abhinav", "Better text model helps. Timing does not.", ["Dark bars: text only. Orange: text + time.", "Changing the model moves the score by up to 7 points.", "Adding time moves it by under 2 points, and for the best model by zero."]),
 ("Sudesh", "Does timing help? Almost never", ["Each cell: change from adding time, with a 95% interval.", "If the interval includes 0, there is no real effect. That is most cells.", "Orange: time made TF-IDF worse. Green: tiny gain for the BiLSTM only, half a point.", "Time alone scores 0.15, the same as guessing."]),
 ("Abhinav", "Later posts cost nothing", ["Later-period vs same-size random: about 0 for all three models.", "So models did not get worse on later posts in these months.", "The chart: three classes only start in Nov 2021. That is why the paper's 2021 to 2022 split is misleading."]),
 ("Zohaib", "What the model looks at", ["We can read which words Method A relies on for each class.", "Mostly condition names, medications (lamictal), symptoms (voices) and therapy (dbt).", "No subreddit names, so the leakage removal worked.", "Main mistakes go into depression: 35% of mentalillness and 18% of bpd posts.", "For a moderator, showing these words is a simple explanation of a flag."]),
 ("Abhinav", "What we found", ["One: timing is not a reliable signal.", "Two: the choice of text model matters far more.", "Three: later posts were not harder here.", "Four: the paper's split is confounded by how the data was collected."]),
 ("Zohaib", "Team and responsibilities", ["Each of us owns one part: data (Xing), Method A (Jaskamal), statistics and paper comparison (Sudesh), explanations (me), Methods B and C and coordination (Abhinav).", "Everyone reviewed papers. Phase II is shared."]),
 ("Zohaib", "Limits, and what comes next", ["Limits: labels are subreddits, condition names stay in the text, no author column, short time window.", "Phase II: a triage assistant for moderators, with explanations, where a human always decides.", "Thank you, happy to take questions."]),
 ("-", "References", ["Leave on screen during questions."]),
]


VISUAL = {
 2: "Point at the three big numbers left to right, read each one slowly, then the two boxes below.",
 3: "Do not read the table. Point at one row at a time, say only the Finding and Limitation columns, then land on the orange Gap line and read it fully.",
 4: "Point at 0.7222 then 0.7376 and say: one and a half points, from one run. Then point to the right card for our two questions.",
 5: "Trace the arrows with your hand: top row left to right, down to the orange box, then the three models, then the bottom box. Stop on orange: this is the one thing we change.",
 6: "Start with the two big numbers (701,787 to 483,715), then walk down the numbered circles 1 to 5, one sentence each.",
 7: "Left table: read only the Purpose column. Right card: say macro F1 first, it is our main metric.",
 8: "Left table: point at full cleaning (0.620) and no leakage control (0.620): almost the same. Right table: point at class balanced (0.607), the only lower one. Then read the sentence below.",
 9: "Point at the A, B and C circles in order. For each, say what it is and the 'Why' line.",
 10: "Point at the Paper column, then Ours. The key cell is the last row: +0.015 for them, -0.001 for us.",
 11: "Point at the MentalRoBERTa row first (numbers in teal): it is best on every column. Then compare A, then C.",
 12: "Explain the colours first: dark is text only, orange is text + time. Show that each pair of bars is nearly the same height. Then point at the right card: the gain from time is near zero.",
 13: "Explain the colours first: white means no real effect, orange means time made it worse, green means a tiny gain. Most cells are white.",
 14: "On the chart, point at Nov 2021 where the colours suddenly change: three classes appear only from then. On the right card, read one number: all near zero.",
 15: "Left table: pick two rows (bipolar: lamictal, schizophrenia: voices) instead of reading all six. Right card: read the two big percentages.",
 16: "Count on your fingers 1 to 4 and read only the bold lines; the grey lines are for questions.",
}

def main():
    path = HERE / "Phase1_Timing_Matters.pptx"
    p = Presentation(path)
    assert len(p.slides) == len(S), (len(p.slides), len(S))
    for slide, (who, title, cues) in zip(p.slides, S):
        tf = slide.notes_slide.notes_text_frame
        i = list(p.slides).index(slide) + 1
        tf.text = f"PRESENTER: {who}\n" + "\n".join("- " + c for c in cues) + (f"\nHOW TO SHOW THE VISUAL: {VISUAL[i]}" if i in VISUAL else "")
        if who != "-":
            dark = slide.slide_layout.name == "DARK"
            tb = slide.shapes.add_textbox(Inches(0.5), Inches(5.2), Inches(3), Inches(0.3))
            tb.name = "presenter tag"
            r = tb.text_frame.paragraphs[0].add_run()
            r.text = f"Presenter: {who}"
            r.font.size = Pt(10)
            r.font.color.rgb = RGBColor(0xCB, 0xD5, 0xE1) if dark else RGBColor(0x6C, 0x7A, 0x89)
    p.save(path)
    md = ["# Speaker script: who says what", "", "| Presenter | Slides |", "|---|---|"]
    for who in ["Abhinav", "Xing", "Jaskamal", "Sudesh", "Zohaib"]:
        md.append(f"| {who} | " + ", ".join(str(i + 1) for i, s in enumerate(S) if s[0] == who) + " |")
    md += ["", "General tips: face the audience, not the screen. Point at one thing at a time. Say what the picture shows before what it means. Never read a whole table aloud.", ""]
    for i, (who, title, cues) in enumerate(S, 1):
        md += [f"## Slide {i}: {title} ({who})", ""] + [f"- {c}" for c in cues] + ([f"", f"*How to show the visual:* {VISUAL[i]}"] if i in VISUAL else []) + [""]
    (HERE / "speaker_script.md").write_text("\n".join(md))
    print("notes added to", len(S), "slides")

if __name__ == "__main__":
    main()
