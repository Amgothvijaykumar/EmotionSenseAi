# EmotionSense AI 🧠✨

**EmotionSense AI** is a modern, cognitive web application that performs real-time Natural Language Processing (NLP) to detect the emotional tone of text. Built on top of pre-trained Machine Learning classification models, it wraps sentiment intelligence in a premium, responsive dashboard featuring dynamic styling, actionable suggestions, voice inputs, history logs, analytics, and an empathetic AI chat companion.

---

## 🎯 Project Aim & Intention
The core aim of this project is to bridge the gap between machine learning models and end-user accessibility. It demonstrates how a custom-trained text classification model can be served via a lightweight Flask API and integrated with:
* **Interactive Frontend Dashboards:** Giving visual significance to numerical prediction outputs.
* **Large Language Models (LLMs):** Extending simple static classifiers into conversational wellness companions that can validate user feelings and suggest customized mood-improving exercises.

---

## 🚀 Core Features
1. **Dynamic Emotion Classification:** Categorizes inputs into 7 emotions: *Happy 😊, Sad 😔, Angry 😠, Fear 😨, Love ❤️, Surprise 😲, and Neutral 😐*.
2. **Interactive Color Themes:** The entire dashboard's card color changes dynamically based on the detected emotion.
3. **AI-Based Suggestions:** Leverages Gemini 3.5 Flash to generate 3–5 personalized, empathetic suggestions matching your state.
4. **Voice Input (Speech-to-Text):** Integrated with the browser Speech Recognition API to convert spoken words into text.
5. **Empathetic AI Chat Companion:** An inline chatbot tuned to respond empathetically and suggest exercises to support or lift the user's mood.
6. **Music Recommendations:** Matches your current mood with curated music genres and playlists.
7. **Daily Mood Tracker Timeline:** Keeps a visual timeline of your emotion check-ins stored with timestamps.
8. **Distribution Analytics:** Renders a Chart.js pie chart tracking the percentage spread of your analyzed emotions.
9. **Dark Mode Support:** A sleek, premium dark-to-light theme toggle.

---

## 🛠️ Tech Stack
* **Frontend:** React, Tailwind CSS (v4), Chart.js
* **Backend:** Flask, Scikit-Learn, Pandas, NumPy, NLTK, requests
* **AI Engine:** Gemini 3.5 Flash API (Google Generative AI)

---

## 💻 Local Installation & Setup

Follow these steps to clone, configure, and run **EmotionSense AI** on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Amgothvijaykumar/EmotionSenseAi.git
cd EmotionSenseAi
```

---

### 2. Backend Server Setup (Flask)
The pre-trained models are already saved in the `models/` directory (`emotion_model.pkl`, `tfidf_vectorizer.pkl`, `label_encoder.pkl`), so no extra model downloads are required.

Navigate into the backend folder, set up a virtual environment, and install python dependencies:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a file named `.env` inside the `backend/` folder:
```bash
touch .env
```
Open `.env` and configure your API keys and ports:
```ini
# backend/.env
GEMINI_API_KEY=your_actual_gemini_api_key
PORT=5002
```

#### Run the Backend Server
```bash
python app.py
```
*The server will start on **`http://localhost:5002`**. (All NLTK resource packages like `stopwords` and `wordnet` are checked and downloaded automatically on boot).*

---

### 3. Frontend Setup (React)
Open a new terminal window, navigate into the frontend folder, install packages, and start the development server:
```bash
cd EmotionSenseAi/frontend
npm install
npm run dev
```
*The frontend development server will start on **`http://localhost:5173`**.*

---

## 🌐 Cloud Deployment Guide

### 1. Deploy the Backend on **Render**
1. Connect your repository to [Render](https://render.com).
2. Create a new **Web Service** and set:
   * **Root Directory:** `backend`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `gunicorn --bind 0.0.0.0:$PORT app:app` (Gunicorn is already configured in the dependencies).
3. Under the **Environment** tab, add your environment variables:
   * `GEMINI_API_KEY` = `your_key`
4. Copy your live Render URL (e.g. `https://emotionsenseai1.onrender.com`).

### 2. Deploy the Frontend on **Vercel**
1. Connect your repository to [Vercel](https://vercel.com).
2. Create a new project and set:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite` (auto-detected)
3. Under **Environment Variables**, configure the API pointer:
   * **Key:** `VITE_API_URL`
   * **Value:** `https://your-render-url.onrender.com/api`
4. Click **Deploy**. Vercel will build your static assets and provide your live application link!
