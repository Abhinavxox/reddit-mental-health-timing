# Phase II: Mental-Health Post Review Assistant

**Status:** Category-labeling scope confirmed for this draft. Section 2 summarizes established Phase I findings. Implementation and evaluation remain proposed work; technical choices, owners, and dates still need to be finalized.

## 1. Objective

The proposed Phase II prototype will help a reviewer organize a mixed collection of mental-health-related Reddit posts by predicted community category and inspect the text influencing each prediction. Its practical purpose is to help locate posts by category and review uncertain or incorrect assignments. Predicting the category of a post whose subreddit is already known would provide limited additional value.

The initial demonstration will use a small collection of synthetic examples and allow manual text entry. Reviewers will be able to filter the collection by predicted category, inspect individual posts, and correct or dismiss assignments. The usefulness of this workflow remains to be evaluated; Phase I established classification performance, not moderator benefit.

The prototype will address the same classification problem investigated in Phase I. It will not provide a clinical diagnosis, determine whether a person is safe, or automatically contact users. A human reviewer will remain responsible for any decision.

The system's role in the moderator triage workflow is to provide category labels as information. It will not assign severity or importance weights to categories, calculate risk scores, or prioritize posts by predicted category. Moderators will decide what the information means, which posts need attention, and what action is appropriate.

## 2. Established Phase I Findings

Phase I compared TF-IDF with logistic regression, MentalRoBERTa, and a reconstructed BiLSTM model. Each method was evaluated with text-only and text-plus-time features.

MentalRoBERTa achieved the highest mean macro F1 on the later-period test: approximately 0.679, compared with 0.636 for TF-IDF and 0.608 for the text-only BiLSTM. Adding posting-time features did not reliably improve MentalRoBERTa. Therefore, the proposed Phase II model is text-only MentalRoBERTa. TF-IDF with logistic regression will be retained as a baseline for evaluating the trade-off between performance and computational cost.

The project will reuse the Phase I preprocessing, label definitions, model implementation, and evaluation code where appropriate. The relevant results are documented in [the Phase I results summary](../phase1/results/README.md).

The six output categories are depression, anxiety, bipolar, BPD, schizophrenia, and mentalillness. These labels were obtained from subreddits rather than clinical assessments. A category score must not be presented as the probability that the author has a condition or is experiencing a crisis. Topics can overlap even though the classifier assigns one category. Applying the model to other communities or data sources would require additional evaluation.

## 3. Proposed Scope and Workflow

The initial prototype will support the following workflow:

1. A reviewer selects a post from the demonstration collection or enters a post manually.
2. The system checks the input and applies preprocessing consistent with model training.
3. The model assigns one predicted community category to the post.
4. The interface displays the original text and predicted category. Any supporting explanation will describe the category prediction only.
5. The reviewer filters posts by predicted category and inspects individual assignments. The reviewer can retain an assignment, select another category, or dismiss the suggestion as unsuitable.

Reviewer decisions will be kept only for the current session and displayed separately from the original model prediction. They will not automatically retrain the model or replace the dataset labels used in evaluation.

The interface will identify labels as model predictions. The initial review display will focus on labels rather than numerical scores. Internal class scores may still be used to select the predicted label and evaluate explanations; these are not category-severity weights or risk scores. Empty inputs will be rejected, and users will be informed when input exceeds the model's supported token length and is truncated.

The classifier selects among the six classes even for unrelated text. Reliable detection of out-of-scope input has not been established, and a high score does not resolve this limitation. Any later abstention or rejection rule must be developed on validation data and evaluated separately; low confidence alone will not be treated as a validated out-of-scope detector.

The initial scope will use manual text entry and synthetic demonstration examples. Live Reddit monitoring, automated interventions, and persistent storage of submitted text are outside the initial scope.

### Category Labels and Moderator Judgment

The earlier project proposal referred to ranking posts by risk. The clarified Phase II scope is category labeling for moderators to interpret themselves. Urgency ranking is not part of this implementation. Phase I evaluated community classification, which directly supports this labeling task.

All six categories will be presented without a built-in severity hierarchy. Category filters will organize posts without treating one category as more concerning than another. The interface will preserve input order unless the moderator chooses a neutral ordering such as date. Labels, colors, badges, and explanations will not imply risk levels or urgency. The system will not automatically flag posts as concerning or recommend an intervention based on the category.

## 4. Proposed Implementation

| Component | Planned work |
|---|---|
| Model preparation | Confirm whether a fine-tuned checkpoint was retained. Document its configuration, seed, training split, and selection rule. If retraining is needed, use the documented Phase I configuration and report the new run separately. Save the tokenizer, label mapping, preprocessing settings, and checkpoint together. |
| Inference pipeline | Load the model once, validate and preprocess input, tokenize the text, and return a predicted category. Retain internal scores only where needed for model evaluation or explanations; do not convert them into risk or priority scores. |
| Review interface | Build a small Python interface, provisionally using Streamlit, with a demonstration collection, category filters, manual entry, prediction details, and session-only reviewer corrections. |
| Explanations | Evaluate a token- or phrase-removal method that measures how the predicted class score changes when parts of the input are removed. Limit the number of model calls to keep the interface usable. |
| Baseline integration | Run the Phase I TF-IDF model on the same evaluation posts for comparison. |
| Evaluation scripts | Produce classification metrics, timing measurements, explanation checks, and examples of successful and unsuccessful predictions. |

Explanations must be generated from the model being displayed. TF-IDF feature weights may explain the TF-IDF baseline, but they will not be presented as explanations of MentalRoBERTa. Highlighted text will be described as evidence influencing a model prediction, not as a clinical reason for a condition.

Phrase removal is a provisional explanation method. It can produce unnatural inputs, and a score decrease alone does not establish that an explanation is faithful or useful. Its interpretation will be checked through case inspection, and its extra inference cost will be measured. Where model or epoch selection is needed, the selection rule will use validation performance rather than the highest test score.

The proposed pipeline is:

**Post input → validation and preprocessing → MentalRoBERTa inference → explanation generation → moderator review display.**

## 5. Evaluation Plan

The complete system will be evaluated in addition to the underlying classifier. Development choices will use training or validation data. Test data will not be used to tune thresholds, select checkpoints, or select explanation settings.

### Proposed Primary Protocol

- Use the saved Kaggle `temporal_late` split for replicate 0 as the primary integration benchmark, subject to confirming that both corresponding model checkpoints are available or reproducible. Fix this choice before Phase II tuning rather than choosing the replicate with the best test score.
- Evaluate text-only MentalRoBERTa and text-only TF-IDF on exactly the same test row IDs and label mapping, using each model's documented Phase I preprocessing. Use the associated training and validation partitions for any retraining or selection.
- Record the code revision, seed, checkpoint identity, dependencies, input-length limits, and test row IDs. If a checkpoint is retrained, report its results as a new run rather than assuming it reproduces the saved scores exactly.
- Report Phase II single-checkpoint results separately from the Phase I averages across replicates. This benchmark already informed Phase I model selection and is not a newly independent test of generalization.
- Use a fixed validation subset for explanation development. Before final evaluation, document a reproducible sampling rule for the explanation audit and include both correct and incorrect predictions. Include all six classes where available and report the audit sample size.

If the proposed split cannot be reused, the replacement protocol and reason will be documented before final evaluation. A separate untouched evaluation set would provide stronger evidence if suitable data is available.

| Evaluation area | Planned method |
|---|---|
| Classification | Report macro F1, per-class precision, recall and F1, class counts, and a confusion matrix on the primary benchmark. |
| Baseline comparison | Compare MentalRoBERTa and TF-IDF on the same posts using compatible preprocessing and label definitions. |
| Later-period performance | Use the primary later-period benchmark to check integration performance. Refer to the Phase I repeated experiments for broader time-shift findings rather than inferring time robustness from one Phase II run. |
| Explanation behaviour | On the fixed audit sample, compare removal of highlighted phrases with random phrases of similar length. Treat this as a sensitivity check, since removal is also used to construct the highlights. Inspect context loss and misleading highlights; report explanation latency separately. |
| Interface and reliability | Check empty input, short text, long text, ambiguous posts, and text outside the six target communities. Verify that category filters and display order introduce no severity weights or automatic prioritization. Confirm that outputs do not imply safety or clinical assessment. |
| Review usefulness | Conduct a structured team walkthrough: locate posts by category, inspect an ambiguous assignment, correct or dismiss a suggestion, and explain what a category label does and does not mean. Record completion, misunderstandings, and feedback. State the participant count and that developers' feedback does not establish benefit for real moderators. |
| Computational resources | Record hardware, model loading time, inference time, explanation time, and relevant memory or deployment constraints. |

The report will include representative successful and unsuccessful cases and discuss possible causes, such as overlapping topics, small classes, explicit condition names, or truncation. Synthetic examples may demonstrate interface behaviour, but they will not substitute for held-out classification evaluation.

Evaluation will concern category accuracy and the usability of the labeling workflow. The project will not report crisis-detection performance, urgency-ranking quality, or intervention outcomes because those capabilities are outside this scope.

If explanations or other AI components are added, their contribution will be examined separately. For explanations, compare displays with and without highlights using comparable examples, alternate presentation order where practical, and report additional latency and observed usability differences. A small team walkthrough will support preliminary design feedback rather than a claim of improved moderation performance.

## 6. Ethics Risks and Safeguards

| Risk | Relevance to the project | Proposed safeguard and evaluation |
|---|---|---|
| Misleading diagnostic claims | Subreddit membership is not a verified diagnosis. | Label outputs as community-category predictions. Review all interface wording and sample outputs for diagnostic or crisis-risk claims. |
| Misinterpreting categories as severity | A moderator may assume one category is inherently more urgent, or that another category indicates safety. There is no healthy or safe class. | Assign no category-severity weights, risk badges, or priority order. Explain that labels describe predicted community categories and that attention and action remain moderator decisions. Check this distinction during the walkthrough. |
| Privacy and re-identification | Reddit posts may contain sensitive details, and quotations can be searchable even after usernames are removed. | Use synthetic examples in public demonstrations. Avoid saving submitted text by default, keep raw datasets out of GitHub, and avoid identifiable quotations in reports. |
| Uneven performance | Classes differ in size, and the model may perform poorly on unfamiliar language or populations. | Report per-class metrics and examine errors. Do not claim demographic fairness where suitable demographic labels are unavailable. |
| Overreliance on predicted labels | A reviewer may treat an incorrect category as an established fact about the author. | Identify labels as predictions, show the original text, and allow corrections or dismissal. Keep numerical model scores out of the initial review display and check understanding during the walkthrough. |
| Misleading explanations | Highlighted phrases may appear authoritative even when the model is wrong. | Test explanation behaviour, show failures, and state that highlights describe model sensitivity rather than medical evidence. |
| Credential exposure and security | Model or dataset access may require credentials. | Use environment variables or platform secrets. Check source files and demonstration outputs for exposed credentials before sharing. Track any credential-remediation tasks separately from this README. |
| Misuse beyond the intended setting | The prototype could be treated as a tool for diagnosing, profiling, or automatically acting on users. | State the intended educational and human-review scope, exclude automated interventions, and document unsupported uses. |

Phase I also leaves unresolved limitations: the Kaggle data has no author column, so same-user overlap could not be checked; condition names remain in the text; and the tested time window is limited. These constraints will remain visible in Phase II documentation.

## 7. Work Plan

| Stage | Expected output |
|---|---|
| 1. Finalize implementation choices | Use the confirmed category-labeling scope to agree on the review display, supported inputs, and explanation method. |
| 2. Prepare model and baseline | Obtain reproducible checkpoints and verify inference against saved Phase I examples or predictions. |
| 3. Implement the workflow | Connect input validation, preprocessing, inference, and the review interface. |
| 4. Add and check explanations | Integrate the selected method and measure its behaviour and computational cost. |
| 5. Evaluate the system | Run the held-out comparisons, failure analysis, resource measurements, and structured walkthrough. |
| 6. Complete deliverables | Finalize the working prototype, repository documentation, sample inputs/outputs, and technical report. |

Xing Liao will prepare the initial Phase II plan and ethics-risk documentation. Implementation owners and target dates will be agreed by the team. Each member will maintain a contribution log and be able to explain the complete system and results.

## 8. Planned Deliverables

- A working end-to-end AI prototype that labels posts by predicted community category for moderators to interpret, without category-severity weights or automatic prioritization.
- Phase II source code, dependencies, configuration, and installation instructions.
- Dataset information and instructions for obtaining permitted evaluation data.
- Evaluation scripts and instructions for reproducing the main results.
- Sample inputs and outputs, including representative failures.
- A 3–4-page technical report covering the connection to Phase I, architecture, implementation, evaluation, responsible-AI considerations, and computational resources.

### Setup and Reproduction

Exact installation, application-launch, and evaluation commands will be added after the implementation is agreed and verified. Required model files and their acquisition or training procedure will be documented without committing credentials or restricted data.

## 9. Decisions to Confirm

- Availability of the fine-tuned MentalRoBERTa checkpoint and the hardware used for deployment.
- The interface framework and explanation method.
- Whether the proposed replicate-0 later-period benchmark and corresponding checkpoints can be reused, and whether additional untouched evaluation data is available.
- Implementation owners and completion dates.
