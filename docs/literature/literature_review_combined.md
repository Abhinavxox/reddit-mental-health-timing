# Literature Review and Research Question Report

**Group Number:** 2

**Domain:** Healthcare (Mental Health)

**Project Title:** Early Detection of Mental Health Issues from Social Media Posts

**Group Members:** Abhinav Pandey, Thotagamuwage Sudesh Nimesha, Jaskamal, Zohaib Jawaid, Xing Liao

---

## PART A: Literature Overview

| No | Citation of papers reviewed | Is it core paper? (yes/no) | Why is it a core paper? | Name of team member who reviewed |
|---|---|---|---|---|
| 1 | Saeed, Q. B., and Ahmed, I. (2025). Early detection of mental health issues using social media posts. arXiv preprint arXiv:2503.07653. | Yes | Our anchor paper. We rebuild its BiLSTM with cross modal attention and its small untested timing gain is what our research question starts from. | Abhinav Pandey |
| 2 | Low, D. M., Rumker, L., Talkar, T., Torous, J., Cecchi, G., and Ghosh, S. S. (2020). Natural language processing reveals vulnerable mental health support groups and heightened health anxiety on Reddit during COVID-19. Journal of Medical Internet Research, 22(10), e22635. | Yes | Gives our simple linear baseline and the public dataset split into pre COVID and mid COVID periods which we need for the time shift test. | Thotagamuwage Sudesh Nimesha |
| 3 | Cohan, A., Desmet, B., Yates, A., Soldaini, L., MacAvaney, S., and Goharian, N. (2018). SMHD: A large-scale resource for exploring online language usage for multiple mental health conditions. COLING 2018. arXiv:1806.05258. | Yes | Large reddit benchmark built from self reported diagnoses with TF IDF baselines. Shows the user level setting and that nobody tested models across time. | Jaskamal |
| 4 | Kumar, R., Maharaj, K., Saxena, A., and Bhattacharyya, P. (2024). Mental disorder classification via temporal representation of text. Findings of EMNLP 2024, 10901–10916. arXiv:2406.15470. | Yes | Peer reviewed work that turns a user's post history into a time series and shows post order matters. Uses public eRisk data so results can be compared. | Zohaib Jawaid |
| 5 | Parapar, J., Pérez, A., Wang, X., and Crestani, F. (2025). Overview of eRisk at CLEF 2025: Early risk prediction on the internet. CEUR Workshop Proceedings, 4038, 1449–1473. | Yes | The main shared task for early depression detection. Gives the standard metrics for both accuracy and how fast a system raises an alert. | Xing Liao |
| 6 | Miyaguchi, A., Guecha, D., Chiu, Y., and Gaur, S. (2025). DS@GT at eRisk 2025: From prompts to predictions, benchmarking early depression detection with conversational agent based assessments and temporal attention models. arXiv:2507.10958. | No | Supporting. One team's system inside the eRisk 2025 challenge. It uses MentalRoBERTa with temporal attention so it is useful for our methods but the overview paper covers it and all other teams. | Xing Liao |
| 7 | Ji, S., Zhang, T., Ansari, L., Fu, J., Tiwari, P., and Cambria, E. (2022). MentalBERT: Publicly available pretrained language models for mental healthcare. LREC 2022. arXiv:2110.15621. | No | Supporting. Gives MentalRoBERTa which is the strong text only model our anchor never compared with. We use it as one of our reproduced methods. | Abhinav Pandey |
| 8 | Cao, Y., Dai, J., Wang, Z., Zhang, Y., Shen, X., Liu, Y., and Tian, Y. (2024). Machine learning approaches for mental illness detection on social media: A systematic review of biases and methodological challenges. arXiv:2410.16204. | No | Supporting. A review of 47 studies that shows common evaluation mistakes in this field and guides how we set up our experiments. | Thotagamuwage Sudesh Nimesha |
| 9 | Kamarudin, N. S., Beigi, G., Manikonda, L., and Liu, H. (2025). Social media for mental health: Data, methods, and findings. arXiv:2511.07914. | No | Supporting. Background survey of data sources features and metrics with no experiments of its own. | Jaskamal |
| 10 | Zhang, T., Xue, X., Ruan, L., Fu, S., Xia, F., D'Alfonso, S., Kostakos, V., Dang, T., and Jia, H. (2025). Menta: A small language model for on-device mental health prediction. arXiv:2512.02716. | No | Supporting. Useful for privacy and running on a phone which matters for Phase II but it is a preprint and classifies each post alone. | Zohaib Jawaid |

**Why these five papers were selected as core:** Together they cover the whole study. Saeed and Ahmed is the method we rebuild and question. Low et al. gives the simple baseline and the time split data. Cohan et al. and Kumar et al. show how the field went from user level word count models to models that follow a user over time. Parapar et al. gives the standard benchmark and metrics for early detection. Each core paper is the one its reviewer picked as the best of the papers they read.

---

## PART B: Literature Review

### 1. Early detection of mental health issues using social media posts: By Abhinav Pandey

**Citation:** Saeed, Q. B., and Ahmed, I. (2025). Early detection of mental health issues using social media posts. arXiv preprint arXiv:2503.07653. https://arxiv.org/abs/2503.07653

**Problem addressed:** The paper tries to find mental health problems like depression anxiety bipolar and BPD from reddit posts. The authors say older work only looks at the text and ignores when a post was made so they use both the words and the posting time. The idea is that things like posting late at night may say something about how a person feels. They call it early detection but each post is classified on its own with no user history so it is really post classification.

**AI methodology:** The model has two parts. The text goes through word embeddings and a BiLSTM with 64 units and max pooling turns it into one vector. The time part takes six features from the timestamp which are month day hour weekday working hour and weekend and passes them through an LSTM. A cross modal attention layer then decides how much to trust each part and mixes them before a softmax layer gives the class. Training uses RMSprop with dropout 0.6 for 30 epochs.

**Dataset(s):** The kaggle mental disorders identification reddit dataset with 701,809 posts (https://www.kaggle.com/datasets/kamaruladha/mental-disorders-identification-reddit-nlp). Each post has a title body timestamp and subreddit and the subreddit is used as the label. NSFW posts are dropped and only 2021 to 2022 is kept. The paper says seven labels but only six show up in the results. This is obv big but we are going to stratify it and use it.

**Baseline(s):** Text only BiLSTM LSTM and CNN models trained the same way.

**Evaluation metrics:** Precision recall F1 and accuracy on one stratified train test split. The best epoch is chosen on the same validation set they report.

**Major findings:** The model gets 0.7376 F1 and 74.55 percent accuracy while the best text only BiLSTM gets 0.7222 so the gain is about 1.5 points. It takes around twice the training time and parameters. Depression was easiest and anxiety and BPD got confused the most.

**Limitations:** The gain is small and comes from one split with no repeated runs so we cant tell if its real. Choosing the best epoch on the reported set makes results look better than they are. There is no transformer baseline like MentalBERT. They never compare the attention with just joining the two vectors so we dont know if attention helps. The month feature might leak because post counts per subreddit change a lot over time so time may just tell the model which subreddit a post came from. Labels come from the subreddit and are not a real diagnosis.

**Code availability:** No code given. The dataset is public on kaggle.

**Relevance to our project:** This is our anchor paper. With no code we will rebuild it from the equations in the paper which fits the reproduction part of the project. Its small gain and missing tests lead to our research question which is whether timing really helps over a strong text model and whether models still work on posts from a later year. We will also remove the time part and test again to see what timing adds.

### 2. Natural language processing reveals vulnerable mental health support groups and heightened health anxiety on Reddit during COVID-19: By Thotagamuwage Sudesh Nimesha

**Citation:** Low, D. M., Rumker, L., Talkar, T., Torous, J., Cecchi, G., and Ghosh, S. S. (2020). Natural language processing reveals vulnerable mental health support groups and heightened health anxiety on Reddit during COVID-19: Observational study. Journal of Medical Internet Research, 22(10), e22635. https://www.jmir.org/2020/10/e22635/

**Problem addressed:** The study looks at how a big life event like the COVID pandemic changed mental health communities on reddit. It tracks changes in distress health anxiety and language across 15 large mental health support subreddits like depression anxiety suicidewatch and bipolar and compares them with non mental health groups.

**AI methodology:** Each post is turned into 346 features made of TF IDF words LIWC word categories sentiment and readability scores. They train linear classifiers with stochastic gradient descent and a linear SVM and also try two tree based models to tell the subreddits apart. They then use Mann Whitney U tests to check change between years and use UMAP with unsupervised clustering and topic modelling to find themes before and during the pandemic.

**Dataset(s):** A large reddit dataset of about 3.1 GB on zenodo with posts from 28 subreddits including the mental health groups and control groups like jokes and fitness. Posts are split into pre COVID (2018 to 2019) and mid COVID (early 2020) periods. Each post has its date and the 346 features already computed.

**Baseline(s):** Simple linear classifiers on TF IDF and LIWC features. They pick the simplest model that works well instead of comparing against outside methods.

**Evaluation metrics:** Weighted F1 for the classifiers plus statistical tests for change over time.

**Major findings:** All models did about the same with weighted F1 between 0.798 and 0.857 so the simple SGD model (0.851) was used. The health anxiety subreddit started talking about COVID about two months before the others. ADHD eating disorder and anxiety groups had the most negative change and the suicidality and loneliness clusters more than doubled during the pandemic.

**Limitations:** It uses older surface features like TF IDF and LIWC and no domain transformer like MentalBERT. It classifies single posts and not users over time. It only compares fixed periods before and during COVID and does not study how and why the language keeps changing.

**Code availability:** Code is on github (https://github.com/danielmlow/reddit) and the full dataset is on zenodo (https://zenodo.org/records/3941387).

**Relevance to our project:** It gives our main simple baseline which is TF IDF with a linear classifier. Its public zenodo data already has pre COVID and mid COVID periods so we can train on the earlier period and test on the later one to see how much each model drops under a shift in time.

### 3. SMHD, a large scale resource for exploring online language usage for multiple mental health conditions: By Jaskamal

**Citation:** Cohan, A., Desmet, B., Yates, A., Soldaini, L., MacAvaney, S., and Goharian, N. (2018). SMHD: A large-scale resource for exploring online language usage for multiple mental health conditions. COLING 2018. https://arxiv.org/pdf/1806.05258

**Problem addressed:** Mental health research has very little labelled text because getting doctors to label data is costly. Older twitter datasets only had a few hundred diagnosed users per condition and the posts were short. This paper uses users own public statements that they were diagnosed as labels. They do this on reddit for nine conditions and test how well normal text classifiers can spot these users.

**AI methodology:** First a rule based matcher links diagnosis statements to condition words and a match only counts if the two are within 40 characters. All posts that openly talk about mental health are then removed so models must use ordinary language. Each diagnosed user gets about nine matched control users with similar activity. Then classifiers work at the user level both as one binary task per condition and as a multi label task.

**Dataset(s):** 20,406 diagnosed users and 335,952 control users with reddit posts from 2006 to 2017. It covers depression ADHD anxiety bipolar PTSD autism OCD schizophrenia and eating disorders. An extra set adds 16,542 diagnosed users and about a quarter of users report more than one condition.

**Baseline(s):** Logistic regression XGBoost and a linear SVM on TF IDF words plus FastText and a CNN.

**Evaluation metrics:** Precision recall and F1 on the diagnosed class.

**Major findings:** FastText was best in most cases (53.56 F1 for depression and 53.71 for anxiety) while SVM led for bipolar and CNN for eating disorders. The word count models were very careful. Logistic regression on depression had 85.0 precision but only 28.7 recall. Rare conditions were hard for every model and logistic regression got zero on eating disorders.

**Limitations:** Labels depend on what users choose to share and not on medical records. The authors found about 96 percent label precision but tuned the matching on the same sample so it is optimistic. Some mental health words may be left in and the data may lean toward one gender. F1 stays low at about 0.4 to 0.6 and there are no transformers. No test splits early and later posts so we dont know if models hold up over time.

**Code availability:** The data is only shared under a data use agreement. The matching patterns are shared but there is no code for the experiments so baselines have to be rebuilt from the text.

**Relevance to our project:** Their TF IDF logistic regression setup is a template for our first baseline. High precision with low recall shows why we should report recall on high risk classes and not accuracy. Their labels were checked by hand while ours come from the subreddit so we should hand check a sample too. Many users have more than one condition so one label per post is a simplification we should state. The data ends in 2017 and is never split by time which leaves our time shift question open. They classify users after removing mental health words while we classify single posts so our scores cant be compared directly.

### 4. Mental disorder classification via temporal representation of text: By Zohaib Jawaid

**Citation:** Kumar, R., Maharaj, K., Saxena, A., and Bhattacharyya, P. (2024). Mental disorder classification via temporal representation of text. Findings of the Association for Computational Linguistics: EMNLP 2024, 10901–10916. https://doi.org/10.18653/v1/2024.findings-emnlp.639

**Problem addressed:** Language models can only read a limited amount of text so a user's long reddit history cant be fed in at once. The usual fix cuts the history into chunks classifies each one and takes a vote. The authors say this throws away the order of posts and how mood changes over time and it waters down the few posts that matter. The task is detecting anorexia depression and self harm at the user level.

**AI methodology:** Each post is turned into an embedding with a frozen MPNet sentence encoder. For each disorder an anchor embedding is made by averaging posts from matching subreddits in a separate dataset so there is no leakage. The similarity between each post and the anchor in time order turns the whole history into one number per post which makes a time series. A small network on the top 30 time series features or an LSTM CNN or time series transformer then labels it. No chunking or voting is used.

**Dataset(s):** eRisk reddit collections for anorexia (1,307 users) depression (1,799) and self harm (763) with about 360 to 640 posts per user. Depression labels come from Beck Depression Inventory scores. The reddit mental health dataset is only used to build the anchors.

**Baseline(s):** BERT MentalBERT and DisorBERT results taken from an earlier paper that used chunks of 35 posts with voting. They also run MPNet zero shot and fine tuned and GPT 3.5 and MentalLLaMA zero shot.

**Evaluation metrics:** F1 on the positive class using the official eRisk splits with 20 percent of training kept for validation. They also report compute cost an ablation without the anchor a test where post order is shuffled and a cross disorder transfer test.

**Major findings:** F1 is 0.83 for anorexia which ties the best earlier model, 0.75 for depression against 0.69 before and 0.83 for self harm against 0.74. So the gain comes from depression and self harm. Shuffling post order lowers results which shows order matters. The smallest model needs about 25 million FLOPs against 8.4 billion for the smallest baseline. Depression transfers poorly to other disorders and zero shot LLMs scored very low (0.02 to 0.08 F1).

**Limitations:** Only reddit and only three disorders. Moderation deletes posts so some users have very short histories and off topic posts can confuse the model. Some models are sensitive to settings and the full context test uses tiny samples like 7 against 8 users. From my reading one similarity number per post hides which words drove a prediction and the baseline numbers were copied from another paper instead of run again.

**Code availability:** The paper says code is on github for academic use but the link did not show in the arXiv or ACL versions I checked.

**Relevance to our project:** This is the best template for treating a user's history as an ordered sequence instead of separate posts. It gives public benchmarks strong baselines a clear metric and a light model we can compare with small language models like Menta. It also raises questions we can test like whether the time gain holds when baselines are run again on the same splits.

### 5. Overview of eRisk at CLEF 2025, early risk prediction on the internet: By Xing Liao

**Citation:** Parapar, J., Pérez, A., Wang, X., and Crestani, F. (2025). Overview of eRisk at CLEF 2025: Early risk prediction on the internet (extended overview). CEUR Workshop Proceedings, 4038, 1449–1473. https://ceur-ws.org/Vol-4038/paper_117.pdf

**Problem addressed:** The paper looks at how AI systems can spot signs of depression from online activity while thinking about conversation context and when to make a prediction. It reports the results of the eRisk 2025 challenge where many teams built systems to find depression risk.

**AI methodology:** There were three tasks. Task 1 ranked reddit sentences by how well they match the 21 symptoms in the BDI II depression questionnaire. Task 2 had systems read reddit threads in time order and decide when to raise a depression alert. Task 3 used LLM made personas for interactive symptom checks. Teams used classic machine learning transformers and LLM based systems.

**Dataset(s):** Task 1 had about 17.5 million sentences from 9,000 reddit users. Task 2 had 909 users with 102 depressed and 807 control users and their reddit histories. Task 3 used 12 simulated personas.

**Baseline(s):** There is no single baseline. The paper compares team submissions from TF IDF with logistic regression or SVM up to transformer based systems.

**Evaluation metrics:** Task 1 used average precision R precision precision at 10 and NDCG. Task 2 used precision recall F1 ERDE and latency weighted F1 which reward being both right and early. Task 3 measured severity estimation and symptom identification.

**Major findings:** In Task 2 the HIT SCIR team got the best F1 of 0.85 with a median delay of eight posts. The DS GT team got perfect recall of 1.00 but F1 of only 0.20 which shows high recall alone does not mean useful predictions. In Task 3 systems were better at overall severity than at single symptoms.

**Limitations:** Task 2 had far fewer depressed users than controls. Teams used very different methods so its hard to say which features helped. It studies early detection but does not test posting time features or how models do on data from a later period.

**Code availability:** No single code repository. The eRisk data is available for research through a user agreement.

**Relevance to our project:** It gives us evaluation methods for both accuracy and early detection and shows why false alerts matter in mental health. Our project can build on it by testing if posting time features help and how performance changes on posts from later time periods.

### Supporting papers

### 6. MentalBERT, publicly available pretrained language models for mental healthcare: By Abhinav Pandey

**Citation:** Ji, S., Zhang, T., Ansari, L., Fu, J., Tiwari, P., and Cambria, E. (2022). MentalBERT: Publicly available pretrained language models for mental healthcare. In Proceedings of the 13th Language Resources and Evaluation Conference (LREC 2022). https://arxiv.org/abs/2110.15621

**Problem addressed:** Models like BERT learn from general text like wikipedia and books so they dont know much about how people talk about mental health online. Fields like medicine already had their own BERT versions but mental health did not. This paper trains BERT and RoBERTa further on mental health posts and checks if that helps detect depression stress and suicidal thoughts.

**AI methodology:** They start from normal BERT base and RoBERTa base and keep training them by hiding words in sentences and making the model guess them. This is called domain adaptive pretraining. The extra text is about 13.6 million sentences from subreddits like depression suicidewatch anxiety bipolar and mentalhealth. For each task they fine tune the model with a small classifier on top using Adam.

**Dataset(s):** Eight public benchmarks on depression (eRisk18 CLPsych15 depression reddit) stress (dreaddit SAD) suicide risk (UMD T SID) and mixed mental health posts (SWMH). Most are from reddit with one from twitter.

**Baseline(s):** Normal BERT and RoBERTa plus BioBERT trained on medical papers and ClinicalBERT trained on hospital notes.

**Evaluation metrics:** Recall and F1. Recall is reported because missing someone who needs help is the worst error here.

**Major findings:** MentalRoBERTa was best on most datasets for example 93.38 F1 on eRisk against 92.25 for normal RoBERTa and 69.71 against 66.07 on CLPsych. Medical models did worse so the right kind of text matters more than medical text in general. It does not win everywhere though since normal RoBERTa was better on depression reddit and UMD.

**Limitations:** Many gains are tiny like 72.16 against 72.03 on SWMH and every result is from one run with no significance testing. The pretraining posts come from the same subreddits as several test sets and nobody checks for overlap so some of the gain might be memory and not understanding. It only uses text and nothing about posting time or user history. It is english only and bias and fairness were not tested. Pretraining also needs a lot of compute.

**Code availability:** The models are free on hugging face (https://huggingface.co/mental) after accepting their terms. Training data and fine tuning code are not shared.

**Relevance to our project:** MentalRoBERTa is the strong text only model our anchor paper never compared with so it will be our second method. If timing helps a weak BiLSTM but not MentalRoBERTa then the anchor gain is not very useful and that is the main point of our research question. The public weights and given settings mean we can run it on free colab. Its tiny untested gains also remind us to use several seeds and confidence intervals in our own comparisons.

### 7. Machine learning approaches for mental illness detection on social media, a systematic review of biases and methodological challenges: By Thotagamuwage Sudesh Nimesha

**Citation:** Cao, Y., Dai, J., Wang, Z., Zhang, Y., Shen, X., Liu, Y., and Tian, Y. (2024). Machine learning approaches for mental illness detection on social media: A systematic review of biases and methodological challenges. arXiv preprint arXiv:2410.16204v3. https://arxiv.org/abs/2410.16204

**Problem addressed:** The paper reviews how well studies on detecting mental illness from social media were done. It looks for bias and weak methods at every step of machine learning from collecting data and cleaning it to tuning models splitting data and reporting results.

**AI methodology:** The authors searched PubMed IEEE Xplore and Google Scholar and found 328 studies after 2010 and kept 47. They scored each one with PROBAST which is a tool that checks risk of bias using 20 questions across four areas which are participants predictors outcome and analysis.

**Dataset(s):** The 47 studies all used their own data. Most used twitter (63.8 percent) and over 90 percent used only english posts mostly from the US and Europe.

**Baseline(s):** It summarises the models the studies used. Classic ones like SVM (19 studies) random forest (13) logistic regression (6) decision trees (6) and XGBoost (3) and deep ones like CNN (9) BERT style transformers (9) and LSTM (5).

**Evaluation metrics:** It checks whether studies used and reported metrics like accuracy precision recall macro F1 and AUC properly when classes are imbalanced.

**Major findings:** About 80 percent used convenience sampling or keyword filters so the data does not represent real populations. Only about 23 percent dealt with negation like not happy. Only 27.7 percent tuned hyperparameters properly for all models while 40.4 percent did not report or tune them at all. About 17 percent did not split data properly. About 25.5 percent relied on accuracy even with imbalanced classes.

**Limitations:** Only english peer reviewed studies after 2010 were included and grey literature was left out. The studies were too different to combine numbers in a meta analysis.

**Code availability:** Review details and analysis files are on github (https://github.com/odile1999/Systematic-Review-Machine-Learning-on-Depression).

**Relevance to our project:** It shows the field has real evaluation problems which backs up how carefully we plan our experiments. Because of it we will use leakage free time based splits, tune all three models fairly, report macro F1 high risk recall and calibration instead of only accuracy and use transformers that can handle negation.

### 8. Social media for mental health, data, methods, and findings: By Jaskamal

**Citation:** Kamarudin, N. S., Beigi, G., Manikonda, L., and Liu, H. (2025). Social media for mental health: Data, methods, and findings. arXiv:2511.07914. https://arxiv.org/pdf/2511.07914

**Problem addressed:** The chapter gives newcomers a map of how social media has been used to study mental health. Instead of testing one model it asks which data tools and metrics earlier studies used and what they found about depression anxiety PTSD and suicidal thoughts.

**AI methodology:** It is a review so it has no model of its own. It groups earlier work into machine learning like classification clustering and prediction, feature engineering like word counts topic models LIWC and sentiment tools, and survey methods like crowd labelling and clinical questionnaires. Most classifiers covered are classic ones like decision trees SVM logistic regression and naive Bayes.

**Dataset(s):** Sources are text images or both. Text mostly comes from twitter and reddit and images from instagram. The CLPsych shared task data is the main public text resource and most other studies collected their own data.

**Baseline(s):** No shared benchmark is run so no baselines are compared.

**Evaluation metrics:** It lists the metrics used in the field like precision recall F1 accuracy ROC curves and agreement measures like Cohen's kappa.

**Major findings:** The survey finds that social media language and activity can reveal signs of conditions like depression and anxiety and that anonymous forums are where many people open up. It also finds most work relies on classic features and classifiers and on data collected by the researchers themselves.

**Limitations:** It was posted in 2025 but its references and framing are from around 2018. So it misses transformers MentalBERT and modern evaluation. It has no numbers comparing studies so its claims stay general. It leans toward twitter and gives little space to eating and psychotic disorders. It does not cover ethics calibration or how language changes over time.

**Code availability:** Not applicable since it is a review with no experiments.

**Relevance to our project:** It is good background but not technical evidence. It supports our motivation that people share distress on anonymous forums like reddit and shows where our TF IDF and linear baselines come from. It also shows what we add beyond the usual metrics like macro F1 high risk recall and calibration. It says nothing about change over time or timing features which leaves both of our questions open.

### 9. Menta, a small language model for on-device mental health prediction: By Zohaib Jawaid

**Citation:** Zhang, T., Xue, X., Ruan, L., Fu, S., Xia, F., D'Alfonso, S., Kostakos, V., Dang, T., and Jia, H. (2025). Menta: A small language model for on-device mental health prediction. arXiv:2512.02716v3. https://arxiv.org/abs/2512.02716

**Problem addressed:** Large language models do well at mental health prediction from social media but are too big and costly to run privately on a phone. Small language models are light but have rarely been tested on many mental health tasks at once.

**AI methodology:** Menta fine tunes Qwen3 4B with LoRA which trains only about 0.1 percent of the weights. It learns six tasks together covering stress depression and its severity suicidal thoughts and suicide risk levels. A sampling method balances the tasks and the loss adds a balanced accuracy term for imbalanced classes. The model is compressed and run on an iPhone 15 Pro Max.

**Dataset(s):** Dreaddit (715 posts) DepSeverity (3,553 posts) SDCNL (379 of 1,895 posts) and CSSRS Suicide (500 users). All public reddit data split 72 8 20 for train validation and test.

**Baseline(s):** Zero shot and few shot small models like Phi LLaMA Gemma Qwen TinyLLaMA Falcon and StableLM, fine tuned Phi 4 Mini StableLM and Falcon and the 13B Mental Alpaca and Mental FLAN T5 models.

**Evaluation metrics:** Accuracy and balanced accuracy for classification plus speed latency and memory for running on the phone.

**Major findings:** Menta gets average accuracy 0.637 and balanced accuracy 0.564 which is 1 to 3 percent better than the best fine tuned small models and about 15 percent better than zero shot Qwen 3. It matches or beats the 13B models on stress and depression (0.82 and 0.80 accuracy) but is much worse on suicide tasks (0.51 against 0.73 to 0.87). It runs in real time using about 3 GB of memory.

**Limitations:** The authors mention text only input three condition groups public non clinical data trouble with long posts and weak suicide results. From my reading the paper also has inconsistencies like saying nine baseline models but showing seven and task numbers that differ between sections. Posts are classified one at a time with no time modelling and the comparisons use accuracy on small test sets.

**Code availability:** Project page at https://hong-labs.github.io/menta-project/ and an anonymous repository at https://anonymous.4open.science/r/Menta-6CAF.

**Relevance to our project:** It shows a 4B model can be fine tuned and run on a phone which matters for private mental health tools in Phase II. It is the opposite of Kumar et al. since Menta uses a bigger model on single posts while Kumar uses a tiny model on whole histories. This suggests testing if the two ideas can be combined and if weak suicide results come from missing time context.

---

## PART C: Cross-Paper Analysis

| Analytical Dimension | Papers 1–5 | Overall Observation | Implication for Our Project |
|---|---|---|---|
| Methods | Simple TF IDF with linear models (Low, Cohan, many eRisk teams). BiLSTM with attention (Saeed). LSTM CNN and transformers over a time series of posts (Kumar). Transformers and LLM systems (eRisk 2025). | The field moved from word count models to deep and transformer models but simple linear models stay close (Low found all models within a few points). | Reproduce TF IDF with logistic regression, the Saeed BiLSTM with attention and MentalRoBERTa from our supporting papers on the same data. |
| Features | Words and n grams, LIWC categories and sentiment (Low, Cohan). Embeddings (Saeed, Kumar). Time used in different ways like posting hour and month per post (Saeed) or post order in a user history (Kumar, eRisk). | Text features show up in every paper but time is used differently each time and never compared directly against a strong text model. | Test per post timing features against text only versions of each model and check if month leaks the label. |
| Findings | Text carries useful signal everywhere. Post order helps at user level (Kumar shuffle test, eRisk). Saeed reports only a 1.5 point gain from timing. | Agreement that language works. Weak and untested evidence that posting time adds much for single posts. | Verify whether the timing gain survives a strong baseline repeated runs and confidence intervals. |
| Limitations | Labels from subreddit or self disclosure not diagnosis (Saeed, Low, Cohan). Single runs and no significance tests (Saeed). Baselines copied not rerun (Kumar). Imbalanced data (eRisk). | Almost no paper trains on one time period and tests on a later one. Cohan ends in 2017, Saeed only uses 2021 to 2022 and Low compares periods only to describe language change. | Our gap is robustness over time plus a fair test of timing features. |
| Evaluation | Accuracy and F1 (Saeed), weighted F1 (Low), positive class F1 (Cohan, Kumar), ERDE and latency F1 (eRisk). Posts in some papers and users in others. Different datasets everywhere. | Results cant be compared because metrics units datasets and splits all differ. | One controlled setup with the same data and time based splits, macro F1 and high risk recall, 5 seeds and bootstrap confidence intervals for every method. |

---

## PART D: Methodological Trends

Most work is moving toward transformer models. Domain trained models like MentalBERT and MentalRoBERTa are now the normal strong baseline and eRisk 2025 teams used transformers and LLMs. At the same time there is a push toward small and efficient models that can run privately on a phone like Menta and the tiny time series models in Kumar et al. Another trend is using time. Kumar et al. and eRisk read a user's posts in order and Saeed and Ahmed add posting time as a second input which is a simple multimodal idea. Ensembles and agent based systems are not common in this area yet.

The approaches do not always perform the same way. Transformers help most on general text tasks but the gain from domain training is often only about one point and normal RoBERTa sometimes wins. Zero shot LLMs do very badly without fine tuning (0.02 to 0.08 F1 in Kumar et al.) so fine tuning still matters. Simple linear models stay competitive when there is a lot of data like in Low et al. Time based models help when there are long user histories but this has not been shown for single posts. Small models fall behind on suicide risk tasks. In eRisk a system with perfect recall had very low F1 so a model can look good on one metric and fail on another.

---

## PART E: Research Gap / Unresolved Problem

| What students should ask themselves | Your answers |
|---|---|
| What have researchers already established? | Reddit language carries real signal about mental health. Simple TF IDF models are strong baselines. Domain trained transformers add a small amount. The order of a user's posts helps at the user level. |
| After reading all five papers, what is still unclear, inconsistent, or inadequately investigated? | Two things. First whether posting time features really help single post classification once a strong text model is used since the only evidence is a 1.5 point gain from one run. Second whether these models keep working on posts from a later time period because almost nobody trains on one period and tests on another. |
| Which papers demonstrate this gap? | Saeed and Ahmed (timing gain small single run no transformer baseline). Low et al. (compares periods only to describe language change with one model family). Cohan et al. (data ends in 2017 and is never split by time). Kumar et al. (time only at the user level and baselines not rerun). Parapar et al. (no test of posting time features or later data). |
| Why is it important to investigate this issue? | A real tool keeps seeing new posts after it is trained. If it gets worse over time without anyone noticing it could miss people at risk. Adding timing features also adds cost and may leak the label so we need to know if they are worth it. |
| What can our project actually do about the gap? | Rebuild three methods (TF IDF with logistic regression, MentalRoBERTa and the Saeed BiLSTM with attention). Run each with and without timing features. Train on earlier posts and test on later ones (2021 to 2022 on kaggle and pre to mid COVID on zenodo). Use 5 seeds and bootstrap confidence intervals so every claim has evidence. |

---

## PART F: Research Question

**RQ1:** Do posting time features significantly improve mental health classification of reddit posts over a strong text only model, and how much does each method lose when trained on earlier posts and tested on posts from a later time period?
