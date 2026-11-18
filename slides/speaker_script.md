# Speaker script: who says what

| Presenter | Slides |
|---|---|
| Abhinav | 1, 2, 3, 4, 5 |
| Xing | 6, 7, 8 |
| Jaskamal | 9, 10 |
| Sudesh | 11, 12, 13, 14 |
| Zohaib | 15, 16, 17, 18 |

General tips: face the audience, not the screen. Point at one thing at a time. Say what the picture shows before what it means. Never read a whole table aloud.

## Slide 1: Title (Abhinav)

- Hi, we are Group 2. Our project: Does Timing Matter?
- Introduce the team in one line each (names on the slide).
- Domain: healthcare, mental health on Reddit.

## Slide 2: Why this problem matters (Abhinav)

- Millions live with depression and anxiety (read the three numbers).
- Many people write about distress online before seeing anyone.
- Moderators cannot read every post, so AI can help them sort.
- Key point: AI supports a human, it never diagnoses.

*How to show the visual:* Point at the three big numbers left to right, read each one slowly, then the two boxes below.

## Slide 3: Five core papers and the gap (Abhinav)

- Each of us reviewed papers; these are the five core ones (the reviewer is in brackets).
- Walk the table quickly: anchor paper, Low (simple baseline), Cohan (low recall), Kumar (time as post order), eRisk (recall alone misleads).
- Gap: nobody checked if timing helps against a strong text model, with repeated runs and a proper later-period test.

*How to show the visual:* Do not read the table. Point at one row at a time, say only the Finding and Limitation columns, then land on the orange Gap line and read it fully.

## Slide 4: A paper says timing helps. We checked. (Abhinav)

- Anchor paper claims 0.7222 to 0.7376 by adding posting time.
- One run, no strong baseline, no code.
- Our two questions: does timing really help, and do models still work on later posts?

*How to show the visual:* Point at 0.7222 then 0.7376 and say: one and a half points, from one run. Then point to the right card for our two questions.

## Slide 5: How the study works (Abhinav)

- Follow the arrows: Kaggle data, cleaning, stratified sample, splits.
- Same data goes into three models.
- Orange box is the experiment: text only vs text + time, nothing else changes.
- Then we score everything the same way, with confidence intervals.
- Hand over: 'Xing will now take you through the data.'

*How to show the visual:* Trace the arrows with your hand: top row left to right, down to the orange box, then the three models, then the bottom box. Stop on orange: this is the one thing we change.

## Slide 6: The data, and what we removed first (Xing)

- 701,787 Reddit posts from 6 subreddits; the label is the subreddit, not a diagnosis.
- After cleaning: 483,715 posts from 2021 and 2022.
- Leakage = the model cheating. We removed subreddit mentions, cross-posts with two labels, and duplicates.
- Everything is learned from training data only.

*How to show the visual:* Start with the two big numbers (701,787 to 483,715), then walk down the numbered circles 1 to 5, one sentence each.

## Slide 7: Splits and metrics (Xing)

- Random split is the paper's setup.
- Same-size random has the training size of the time split, so a drop can only come from time.
- Later period: train Nov 2021 to Jun 2022, test Aug to Nov 2022.
- Main metric macro F1, so small classes like schizophrenia (4%) count as much as big ones.

*How to show the visual:* Left table: read only the Purpose column. Right card: say macro F1 first, it is our main metric.

## Slide 8: Do leakage removal and stratification matter? (Xing)

- We tested it: turned each cleaning step off.
- Score barely moved, 0.620 vs 0.624, because leakage was only about 3% of posts.
- So cleaning is insurance: it proves the score is honest.
- Stratified and plain random sampling score the same; class-balanced is worse (0.607).
- Hand over: 'Jaskamal will explain the three methods.'

*How to show the visual:* Left table: point at full cleaning (0.620) and no leakage control (0.620): almost the same. Right table: point at class balanced (0.607), the only lower one. Then read the sentence below.

## Slide 9: Three methods, same data and splits (Jaskamal)

- A: TF-IDF + logistic regression. Words become scores, the model learns which words point to which class. Simple and strong.
- B: MentalRoBERTa, a language model pretrained on mental-health Reddit.
- C: the anchor paper's BiLSTM with attention, rebuilt from its equations.
- Each one trained twice: text only and text + time.

*How to show the visual:* Point at the A, B and C circles in order. For each, say what it is and the 'Why' line.

## Slide 10: All three methods side by side (Jaskamal)

- Same posts, later-period test, text only.
- MentalRoBERTa is best: accuracy 0.78, macro F1 0.68.
- Method A (mine) 0.74 accuracy, 0.64 macro F1, close behind for a much simpler model.
- Macro F1 is lower than accuracy because the small classes are harder.
- Hand over: 'Sudesh will compare us with the paper and test timing.'

*How to show the visual:* Point at the MentalRoBERTa row first (numbers in teal): it is best on every column. Then compare A, then C.

## Slide 11: Reproducing the anchor paper (Sudesh)

- No code was released, so we rebuilt their model from the paper.
- Text only we match them: 0.730 vs their 0.722.
- But adding time gives no gain: 0.730 vs 0.730, they reported +0.015.
- Possible reasons are all logged in our decision log.

*How to show the visual:* Point at the Paper column, then Ours. The key cell is the last row: +0.015 for them, -0.001 for us.

## Slide 12: Better text model helps. Timing does not. (Sudesh)

- Dark bars: text only. Orange: text + time.
- Changing the model moves the score by up to 7 points.
- Adding time moves it by under 2 points, and for the best model by zero.

*How to show the visual:* Explain the colours first: dark is text only, orange is text + time. Show that each pair of bars is nearly the same height. Then point at the right card: the gain from time is near zero.

## Slide 13: Does timing help? Almost never (Sudesh)

- Each cell: change from adding time, with a 95% interval.
- If the interval includes 0, there is no real effect. That is most cells.
- Orange: time made TF-IDF worse. Green: tiny gain for the BiLSTM only, half a point.
- Time alone scores 0.15, the same as guessing.

*How to show the visual:* Explain the colours first: white means no real effect, orange means time made it worse, green means a tiny gain. Most cells are white.

## Slide 14: Later posts cost nothing (Sudesh)

- Later-period vs same-size random: about 0 for all three models.
- So models did not get worse on later posts in these months.
- The chart: three classes only start in Nov 2021. That is why the paper's 2021 to 2022 split is misleading.
- Hand over: 'Zohaib will show what the model looks at and wrap up.'

*How to show the visual:* On the chart, point at Nov 2021 where the colours suddenly change: three classes appear only from then. On the right card, read one number: all near zero.

## Slide 15: What the model looks at (Zohaib)

- We can read which words Method A relies on for each class.
- Mostly condition names, medications (lamictal), symptoms (voices) and therapy (dbt).
- No subreddit names, so the leakage removal worked.
- Main mistakes go into depression: 35% of mentalillness and 18% of bpd posts.
- For a moderator, showing these words is a simple explanation of a flag.

*How to show the visual:* Left table: pick two rows (bipolar: lamictal, schizophrenia: voices) instead of reading all six. Right card: read the two big percentages.

## Slide 16: What we found (Zohaib)

- One: timing is not a reliable signal.
- Two: the choice of text model matters far more.
- Three: later posts were not harder here.
- Four: the paper's split is confounded by how the data was collected.

*How to show the visual:* Count on your fingers 1 to 4 and read only the bold lines; the grey lines are for questions.

## Slide 17: Team and responsibilities (Zohaib)

- Each of us owns one part: Abhinav (coordination, Methods B and C), Xing (data), Jaskamal (Method A), Sudesh (statistics and paper comparison), me (explanations).
- Everyone reviewed papers. Phase II is shared.

## Slide 18: Limits, and what comes next (Zohaib)

- Limits: labels are subreddits, condition names stay in the text, no author column, short time window.
- Phase II: a triage assistant for moderators, with explanations, where a human always decides.
- Thank you, happy to take questions.

## Slide 19: References (-)

- Leave on screen during questions.
