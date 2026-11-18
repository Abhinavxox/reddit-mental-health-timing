# Speaker script: who says what

| Presenter | Slides |
|---|---|
| Sudesh | 1, 2, 3, 4 |
| Xing | 5, 6, 7, 8 |
| Jaskamal | 9, 10 |
| Abhinav | 11, 12, 13, 14 |
| Zohaib | 15, 16, 17, 18 |

How to use this: the notes are written as what you say. When a line says in this table or on the right, point at that part of the slide. Face the audience, not the screen. On Jaskamal's slides, Abhinav adds the detail after Jaskamal's short intro.

## Slide 1: Title (Sudesh)

Good morning everyone. We are Group 2, and our project is called Does Timing Matter?

Our domain is healthcare, specifically mental health on Reddit.

On the slide you can see our team: Abhinav, me, Jaskamal, Zohaib and Xing. Each of us will present the part we worked on.


## Slide 2: Why this problem matters (Sudesh)

First, why this problem matters. In these three boxes we have figures from the World Health Organization.

About 280 million people live with depression, 301 million with anxiety disorders, and there were 727 thousand suicide deaths in 2021.

Below, on the left, we have who this is for: moderators and peer supporters of online communities. They read far more posts than they can handle.

On the right, why AI: the signal is in the text and there is too much to read by hand. So AI can help sort and flag posts, but a human always decides. It never diagnoses.


## Slide 3: Five core papers and the gap (Sudesh)

Our group reviewed ten papers. In this table we have the five core ones, with the person who reviewed each one in brackets.

For each paper you can see the approach, the main finding and the limitation.

The first row is our anchor paper, Saeed and Ahmed. They added posting time to a BiLSTM and got 1.5 points more F1, but from one run, with no strong baseline and no code.

Low et al. gave us our simple baseline, TF-IDF with a linear model. Cohan et al. showed these models find few of the positive cases. Kumar et al. used time as the order of a user's posts, not as a timestamp. And eRisk showed that high recall alone can be misleading.

The orange line at the bottom is the gap: nobody checked whether timing still helps against a strong text model, with repeated runs and a proper later-period test.


## Slide 4: A paper says timing helps. We checked. (Sudesh)

So here is the claim. On the left you see the two numbers from the anchor paper: 0.7222 with text only, and 0.7376 when they add posting time.

That is about one and a half points, from a single run, with no released code.

On the right we have our research question in two parts. First, do posting-time features really improve classification over a strong text-only model? Second, how much does each method lose when trained on earlier posts and tested on later ones?

*Hand over: Xing will now explain how we set up the study and the data.*


## Slide 5: How the study works (Xing)

Thank you. This diagram shows how the whole study works, from left to right.

In the top row, we start with the Kaggle Reddit data, 701,787 posts. Then we clean it and remove leakage. Then we take a stratified sample of 60,000 posts, five separate times. Then we make our splits.

In the middle row, the same data goes into all three models: A, B and C.

The orange box is the key part of the experiment. Each model is trained twice, once with text only and once with text plus time. Nothing else changes.

At the bottom, every model is scored the same way: macro F1, weighted F1 and accuracy, with confidence intervals and a McNemar test.


## Slide 6: The data, and what we removed first (Xing)

Now the data. On the left you see the two big numbers: we started with 701,787 posts and ended with 483,715 clean posts from 2021 and 2022.

The data comes from six subreddits: depression, anxiety, bipolar, BPD, schizophrenia and mentalillness. The label is the subreddit, so it is a community, not a medical diagnosis.

On the right are the five steps we took, numbered one to five.

One, we removed subreddit mentions like r/depression or this sub, because the post would be naming its own label. 6,741 posts had one.

Two, we dropped texts posted under two different labels, because they have two right answers.

Three, we dropped duplicates, so the same post can never be in both training and test.

Four, we took a stratified sample by class and month, so the sample looks like the full data.

And five, everything the model learns, like the vocabulary and the settings, is fitted on the training data only.


## Slide 7: Splits and metrics (Xing)

Next, how we split the data and how we score it.

In this table we have our three main splits. The random split is the paper's own setup: 43,200 posts to train and 12,000 to test.

The same-size random split is random too, but with the training set cut to 24,732 posts, the same size as our time split. That way, if the time split scores lower, we know it is because of time and not because of less data.

The later-period split trains on November 2021 to June 2022 and tests on August to November 2022.

On the right are our metrics. Our main one is macro F1, because it counts every class equally. Schizophrenia is only 4 percent of posts and anxiety is 33 percent, so with plain accuracy a model could ignore the small classes and still look good.

We also report weighted F1 and accuracy to compare with the paper, plus a 95 percent bootstrap interval to check if a difference is real, and McNemar to compare two models on the same posts.


## Slide 8: Do leakage removal and stratification matter? (Xing)

Finally for my part, we tested whether our cleaning and sampling actually changed the results.

In the left table we turned each cleaning step off. With full cleaning the macro F1 is 0.620, and with no leakage control at all it is also 0.620. Keeping subreddit mentions gives 0.624. So the score barely moves.

That is because leakage was rare, about 3 percent of posts. So the cleaning is insurance: it proves our scores are honest.

In the right table we compared sampling methods on the same test set. Stratified and plain random both give about 0.623. A class-balanced sample is lower, 0.607, because it hides the real class mix.

*Hand over: Jaskamal will now introduce the three methods.*


## Slide 9: Three methods, same data and splits (Jaskamal)

Thank you. Here we have the three methods we compared.

A is TF-IDF with logistic regression. B is MentalRoBERTa. C is the anchor paper's BiLSTM with attention.

Each one was trained with text only and with text plus time.

**Abhinav adds:** A turns each post into word scores, and logistic regression learns which words point to which class. It is the classic baseline from Low et al. B is a language model pretrained on mental-health Reddit, which we fine-tuned on Colab, because that is the strong model the paper never compared with. C is the paper's own model. They released no code, so we rebuilt it from the equations in the paper.


## Slide 10: Reproduction of existing methods (LIVE DEMO) (Jaskamal)

This table compares the original published results with ours. The first two rows are the anchor paper's BiLSTM, which we rebuilt.

ABHINAV ADDS (and runs the demo): in the terminal type  cd phase1 && python demo.py repro  . While it trains Method A live, about 50 seconds: text only we get 0.730 against their 0.722, so our rebuild matches. With time we get 0.730 against their 0.738, so their gain does not appear.

**Abhinav adds:** the Low et al. and MentalBERT rows used other datasets, so they are not directly comparable. The box gives possible reasons for the gap: no code was released, so we chose embeddings and early stopping ourselves, and the paper picked its best epoch on the set it reports. Then point at the demo output: paper versus ours.

*Hand over: Abhinav continues with the comparison of all three methods.*


## Slide 11: Comparative evaluation: all three methods (Abhinav)

This table shows all three methods on the same later-period test, with text only.

The row with the numbers in teal is MentalRoBERTa. It is the best on all three scores: accuracy 0.782 and macro F1 0.679.

Method A gets 0.741 accuracy and 0.636 macro F1, and the BiLSTM 0.733 and 0.608.

macro F1 is lower than accuracy because the small classes are harder. Random guessing gives 0.145. MentalRoBERTa is better than both others on the same posts, with a McNemar p-value under 0.001.


## Slide 12: Better text model helps. Timing does not. (Abhinav)

This chart shows macro F1 on the later-period test.

For each model, the dark bar is text only and the orange bar is text plus time.

As you can see, each pair is almost the same height. Adding time barely changes anything.

But moving from one model to another makes a much bigger difference: MentalRoBERTa is about four points above TF-IDF and seven above the BiLSTM.

On the right we have the gain from adding time: minus 0.015 for A, minus 0.002 for B, and plus 0.006 for C.


## Slide 13: Does timing help? Almost never (Abhinav)

Run the demo first:  python demo.py extension  . It trains Method A with and without time on the later period live, about a minute, then prints the results over all replicates. Explain the table while it runs.

This table gives the full picture, for every model and every split.

Each cell is the change in macro F1 when we add time, with the 95 percent interval in brackets. If the interval includes zero, there is no real effect.

The white cells are no effect, and that is most of them.

The orange cells show where time actually made TF-IDF worse, for example minus 0.015 on the later period.

The green cells are the only gains, for the BiLSTM, and they are about half a point.

MentalRoBERTa was not run on the random split because of our free GPU limit.

And at the bottom: time alone scores 0.15, which is the same as random guessing.

At the bottom: our hypothesis that timing helps is not supported.


## Slide 14: Later posts cost nothing (Abhinav)

Now the second part of our question: do models get worse on later posts?

On the right we compare the later-period test with the same-size random test. The difference is minus 0.001, plus 0.008 and minus 0.001, and every interval includes zero. So no measurable loss.

The chart on the left explains an important finding. It shows the share of each class per month. Look at November 2021: the colours suddenly change, because three classes only start appearing from then.

That means the paper's 2021 to 2022 split is not testing language change, it is testing a change in how the data was collected. When we used it, adding month features dropped Method A to 0.25.

*Hand over: Zohaib will now show what the model actually looks at.*


## Slide 15: What the model looks at (Zohaib)

Thank you. Method A gives every word a weight for each class, so we can read which words it relies on.

In this table we have the top words for each class. For bipolar it is bipolar, manic and lamictal, which is a medication. For schizophrenia it is schizophrenia, voices and delusions.

So the model mostly looks for people naming their condition, their medication, symptoms or therapy. There are no subreddit names, which shows the leakage removal worked.

On the right are the most common mistakes: 35 percent of mentalillness posts and 18 percent of BPD posts are taken for depression. When the model is unsure, it picks the biggest class.

For a moderator, showing these key words is a simple way to explain why a post was flagged.


## Slide 16: What we found (Zohaib)

So, what we found, in four points.

One, timing is not a reliable signal. It gave no gain for the strongest models and a small loss for TF-IDF under time shift.

Two, the choice of model matters much more. The pretrained mental-health model beats TF-IDF by about four points.

Three, later posts were not harder within November 2021 to November 2022.

And four, the paper's split is confounded, because the class mix changes with the collection date.


## Slide 17: Team and responsibilities (Zohaib)

This table shows who was responsible for what, and the papers each of us reviewed.

Abhinav led the project and did Methods B and C. Sudesh did the statistics and the comparison with the papers. Jaskamal did Method A. I did the explanations. Xing did the data.

Everyone reviewed papers, and Phase II will be shared by the whole team.


## Slide 18: Limits, and what comes next (Zohaib)

Finally, the limits of our work, on the left. Labels are subreddits and not diagnoses. Condition names stay in the text. The Kaggle file has no authors, so we could not check same-user leakage. Method B used a smaller training set, and our time window is about nine months.

On the right is how our findings guide Phase II: a triage assistant for moderators using the strongest text model and no time features. Each flag is explained with its key words, like lamictal or voices, and we warn that mentalillness posts are often taken for depression. A human always makes the final call.

Thank you for listening. We are happy to take your questions.


## Slide 19: References (-)

Leave on screen during questions.

