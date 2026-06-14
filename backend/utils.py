import re
import pickle
import os
# pyrefly: ignore [missing-import]
import nltk
# pyrefly: ignore [missing-import]
from nltk.corpus import stopwords
# pyrefly: ignore [missing-import]
from nltk.stem import WordNetLemmatizer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(os.path.dirname(BASE_DIR), "models")

# Ensure NLTK packages are downloaded
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)

try:
    nltk.data.find('corpora/omw-1.4')
except LookupError:
    nltk.download('omw-1.4', quiet=True)

stop_words = set(stopwords.words('english'))

# Important words to preserve in sentiment analysis
important_words = {
    'not', 'no', 'nor', 'never', 'very', 'too', 'so', 'really', 'just', 'still', 'again', 'only'
}
stop_words = stop_words - important_words

lemmatizer = WordNetLemmatizer()

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Convert to lowercase
    text = text.lower()
    # Remove URLs
    text = re.sub(r'http\S+|www\S+', '', text)
    # Remove mentions (@username)
    text = re.sub(r'@\w+', '', text)
    # Remove hashtags
    text = re.sub(r'#\w+', '', text)
    # Remove punctuation, numbers, special characters
    text = re.sub(r'[^a-z\s]', ' ', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    # Tokenize
    words = text.split()
    # Stopword removal and lemmatization
    words = [
        lemmatizer.lemmatize(word)
        for word in words
        if word not in stop_words
    ]
    return ' '.join(words)

class EmotionClassifier:
    def __init__(self):
        self.model = None
        self.tfidf = None
        self.encoder = None
        self.load_models()

    def load_models(self):
        model_path = os.path.join(MODELS_DIR, "emotion_model.pkl")
        tfidf_path = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
        encoder_path = os.path.join(MODELS_DIR, "label_encoder.pkl")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
        if not os.path.exists(tfidf_path):
            raise FileNotFoundError(f"Vectorizer file not found at {tfidf_path}")
        if not os.path.exists(encoder_path):
            raise FileNotFoundError(f"Encoder file not found at {encoder_path}")

        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
        with open(tfidf_path, 'rb') as f:
            self.tfidf = pickle.load(f)
        with open(encoder_path, 'rb') as f:
            self.encoder = pickle.load(f)

    def predict(self, raw_text):
        cleaned = clean_text(raw_text)
        if not cleaned.strip():
            cleaned = raw_text.lower().strip()
            
        vectorized = self.tfidf.transform([cleaned])
        prediction = self.model.predict(vectorized)[0]
        
        try:
            probabilities = self.model.predict_proba(vectorized)[0]
            confidence = float(probabilities[prediction])
        except AttributeError:
            confidence = 1.0
            
        emotion = self.encoder.inverse_transform([prediction])[0]
        
        # Map dataset emotion labels to required specification names
        # Raw classes are: ['sadness', 'neutral', 'surprise', 'love', 'anger', 'fear', 'joy']
        mapping = {
            'joy': 'Happy',
            'sadness': 'Sad',
            'anger': 'Angry',
            'fear': 'Fear',
            'love': 'Love',
            'surprise': 'Surprise',
            'neutral': 'Neutral'
        }
        mapped_emotion = mapping.get(emotion.lower(), emotion.capitalize())
        
        return {
            "emotion": mapped_emotion,
            "confidence": round(confidence * 100, 2),
            "cleaned_text": cleaned
        }
