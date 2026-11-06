# Literature Review by Abhinav Pandey

## Paper 1

**Citation**

Saeed, Q. B., and Ahmed, I. (2025). Early detection of mental health issues using social media posts. arXiv preprint arXiv:2503.07653. https://arxiv.org/abs/2503.07653

**Problem addressed**

The paper tries to find mental health problems like depression anxiety bipolar and BPD from reddit posts. The authors say older work only looks at the text and ignores when a post was made so they use both the words and the posting time. The idea is that things like posting late at night may say something about how a person feels. They call it early detection but each post is classified on its own with no user history so it is really post classification.

**AI methodology**

The model has two parts. The text goes through word embeddings and a BiLSTM with 64 units and max pooling turns it into one vector. The time part takes six features from the timestamp which are month day hour weekday working hour and weekend and passes them through an LSTM. A cross modal attention layer then decides how much to trust each part and mixes them before a softmax layer gives the class. Training uses RMSprop with dropout 0.6 for 30 epochs.

**Dataset(s)**

The kaggle mental disorders identification reddit dataset with 701,809 posts (https://www.kaggle.com/datasets/kamaruladha/mental-disorders-identification-reddit-nlp). Each post has a title body timestamp and subreddit and the subreddit is used as the label. NSFW posts are dropped and only 2021 to 2022 is kept. The paper says seven labels but only six show up in the results.

**Baseline(s)**

Text only BiLSTM LSTM and CNN models trained the same way.

**Evaluation metrics**

Precision recall F1 and accuracy on one stratified train test split. The best epoch is chosen on the same validation set they report.

**Major findings**

The model gets 0.7376 F1 and 74.55 percent accuracy while the best text only BiLSTM gets 0.7222 so the gain is about 1.5 points. It takes around twice the training time and parameters. Depression was easiest and anxiety and BPD got confused the most.

**Limitations**

The gain is small and comes from one split with no repeated runs so we cant tell if its real. Choosing the best epoch on the reported set makes results look better than they are. There is no transformer baseline like MentalBERT. They never compare the attention with just joining the two vectors so we dont know if attention helps. The month feature might leak because post counts per subreddit change a lot over time so time may just tell the model which subreddit a post came from. Labels come from the subreddit and are not a real diagnosis.

**Code availability**

No code given. The dataset is public on kaggle.

**Relevance to our project**

This is our anchor paper. With no code we will rebuild it from the equations in the paper which fits the reproduction part of the project. Its small gain and missing tests lead to our research question which is whether timing really helps over a strong text model and whether models still work on posts from a later year. We will also remove the time part and test again to see what timing adds.

## Paper 2

**Citation**

Ji, S., Zhang, T., Ansari, L., Fu, J., Tiwari, P., and Cambria, E. (2022). MentalBERT. Publicly available pretrained language models for mental healthcare. In Proceedings of the 13th Language Resources and Evaluation Conference (LREC 2022). https://arxiv.org/abs/2110.15621

**Problem addressed**

Models like BERT learn from general text like wikipedia and books so they dont know much about how people talk about mental health online. Fields like medicine already had their own BERT versions but mental health did not. This paper trains BERT and RoBERTa further on mental health posts and checks if that helps detect depression stress and suicidal thoughts.

**AI methodology**

They start from normal BERT base and RoBERTa base and keep training them by hiding words in sentences and making the model guess them. This is called domain adaptive pretraining. The extra text is about 13.6 million sentences from subreddits like depression suicidewatch anxiety bipolar and mentalhealth. For each task they fine tune the model with a small classifier on top using Adam.

**Dataset(s)**

Eight public benchmarks on depression (eRisk18 CLPsych15 depression reddit) stress (dreaddit SAD) suicide risk (UMD T SID) and mixed mental health posts (SWMH). Most are from reddit with one from twitter.

**Baseline(s)**

Normal BERT and RoBERTa plus BioBERT trained on medical papers and ClinicalBERT trained on hospital notes.

**Evaluation metrics**

Recall and F1. Recall is reported because missing someone who needs help is the worst error here.

**Major findings**

MentalRoBERTa was best on most datasets for example 93.38 F1 on eRisk against 92.25 for normal RoBERTa and 69.71 against 66.07 on CLPsych. Medical models did worse so the right kind of text matters more than medical text in general. It does not win everywhere though since normal RoBERTa was better on depression reddit and UMD.

**Limitations**

Many gains are tiny like 72.16 against 72.03 on SWMH and every result is from one run with no significance testing. The pretraining posts come from the same subreddits as several test sets and nobody checks for overlap so some of the gain might be memory and not understanding. It only uses text and nothing about posting time or user history. It is english only and bias and fairness were not tested. Pretraining also needs a lot of compute.

**Code availability**

The models are free on hugging face (https://huggingface.co/mental) after accepting their terms. Training data and fine tuning code are not shared.

**Relevance to our project**

MentalRoBERTa is the strong text only model our anchor paper never compared with so it will be our second method. If timing helps a weak BiLSTM but not MentalRoBERTa then the anchor gain is not very useful and that is the main point of our research question. The public weights and given settings mean we can run it on free colab. Its tiny untested gains also remind us to use several seeds and confidence intervals in our own comparisons.
