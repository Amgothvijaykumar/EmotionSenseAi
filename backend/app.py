import os
import json
import requests
# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from utils import EmotionClassifier

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for frontend connection

# Initialize classifier
try:
    classifier = EmotionClassifier()
    print("Emotion Classifier loaded successfully!")
except Exception as e:
    print(f"Error loading Emotion Classifier: {e}")
    classifier = None

# Static suggestions fallback in case Gemini key is missing or API fails
FALLBACK_SUGGESTIONS = {
    "Happy": [
        "Celebrate your achievement and share the joy with your loved ones!",
        "Capture this moment—write down what made you happy today.",
        "Keep this positive momentum going; spread kindness to someone else.",
        "Treat yourself to something you enjoy."
    ],
    "Sad": [
        "Listen to calming, gentle music to ease your mind.",
        "Talk to a friend or someone you trust about how you feel.",
        "Go for a short walk in nature to change your surroundings.",
        "Give yourself permission to rest and take it easy."
    ],
    "Angry": [
        "Take a short break and step away from the trigger.",
        "Try breathing exercises (inhale for 4s, hold 4s, exhale 4s, hold 4s).",
        "Avoid making important decisions or responding immediately.",
        "Channel your energy into a physical activity like walking or jogging."
    ],
    "Love": [
        "Express your gratitude and love to the person on your mind.",
        "Plan a meaningful gesture or write a heartfelt note.",
        "Engage in self-care to nurture your own well-being.",
        "Cherish and hold onto this warm connection."
    ],
    "Fear": [
        "Calm your senses: focus on 5 things you see, 4 you touch, 3 you hear.",
        "Remind yourself that you are safe in the present moment.",
        "Break down what is worrying you into small, manageable steps.",
        "Listen to peaceful instrumental music."
    ],
    "Surprise": [
        "Embrace the unexpected and find the learning opportunity in it.",
        "Take a moment to process the news before reacting.",
        "Share the surprise with friends or family.",
        "Stay curious and open to what happens next."
    ],
    "Neutral": [
        "Enjoy the calm and quiet moment of balance.",
        "Reflect on your day or read a book.",
        "Engage in light planning or list your goals.",
        "Take a deep breath and stay present."
    ]
}

# Static chatbot fallback
def get_fallback_chat_response(message, history, emotion):
    msg = message.lower()
    
    if emotion == "Happy":
        return "I'm so glad to see you in such high spirits! Happiness is contagious. What is making you feel so cheerful today?"
    elif emotion == "Sad":
        if "lonely" in msg or "alone" in msg:
            return "I know how tough it is to feel alone, but I'm right here with you. It's okay to feel sad. Is there a memory or feeling you'd like to share?"
        return "I hear you, and it's completely okay to feel sad. Take all the time you need. I'm here to listen. What's on your mind?"
    elif emotion == "Angry":
        return "It sounds like you're carrying a lot of frustration, and that's completely valid. Angry feelings need space to be felt. What happened to trigger this?"
    elif emotion == "Love":
        return "Love is a beautiful thing. It warms the heart. Who or what is inspiring this feeling in you right now?"
    elif emotion == "Fear":
        return "I can hear the anxiety in your words. Let's take a slow, deep breath together. You are safe. What is causing you the most worry right now?"
    elif emotion == "Surprise":
        return "Wow, that sounds like it caught you completely off guard! Is it a good surprise, or are you still trying to process it?"
    else:
        return "I see. It's good to have a neutral, calm space to reflect. How are you feeling overall, and what would you like to talk about?"


# --- Gemini API Helpers ---
def generate_suggestions_gemini(emotion, text):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    prompt = (
        f"The user wrote: '{text}' and the detected emotion is '{emotion}'. "
        f"Provide a JSON array containing 3 to 5 short, personalized, actionable, empathetic suggestions for the user. "
        f"Respond ONLY with the raw JSON list of strings (no markdown blocks like ```json, no explanation). "
        f"Example format: [\"Suggestion one.\", \"Suggestion two.\", \"Suggestion three.\"]"
    )
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024,
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=8)
        if response.status_code == 200:
            res_text = response.json()['candidates'][0]['content']['parts'][0]['text'].strip()
            # Try to strip markdown if LLM returned it anyway
            if res_text.startswith("```"):
                res_text = res_text.replace("```json", "").replace("```", "").strip()
            suggestions = json.loads(res_text)
            if isinstance(suggestions, list) and len(suggestions) > 0:
                return suggestions
    except Exception as e:
        print(f"Error fetching Gemini suggestions: {e}")
    return None


def call_gemini_chat(message, history, emotion):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    system_prompt = (
        f"You are a warm, highly empathetic, supportive AI chat companion. "
        f"The user currently feels '{emotion}'. Speak to them with deep understanding, "
        f"validate their feelings, and gently suggest 1-2 small, practical activities to improve or support their mood based on their emotion. "
        f"Keep your responses supportive, warm, short (2-3 sentences), and highly conversational. "
        f"Never use markdown formatting like bolding, bullet points, or code blocks. Speak naturally."
    )
    
    # Construct history in Gemini's API format
    contents = []
    
    # Add conversation history
    for chat in history[-10:]: # Keep last 10 exchanges to save context window
        role = "user" if chat.get("sender") == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": chat.get("text", "")}]
        })
        
    # Add active user message
    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })
    
    data = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024,
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=8)
        if response.status_code == 200:
            return response.json()['candidates'][0]['content']['parts'][0]['text'].strip()
    except Exception as e:
        print(f"Error fetching Gemini chat response: {e}")
    return None


# --- API Routes ---

@app.route('/api/predict', methods=['POST'])
def predict():
    if not classifier:
        return jsonify({"error": "Classifier model is not initialized."}), 500
        
    data = request.get_json() or {}
    text = data.get("text", "").strip()
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
        
    try:
        # 1. Run classifier prediction
        result = classifier.predict(text)
        emotion = result["emotion"]
        confidence = result["confidence"]
        
        return jsonify({
            "emotion": emotion,
            "confidence": confidence,
            "original_text": text,
            "cleaned_text": result["cleaned_text"]
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    data = request.get_json() or {}
    text = data.get("text", "").strip()
    emotion = data.get("emotion", "").strip()
    
    if not emotion:
        return jsonify({"error": "Emotion label is required"}), 400
        
    # Try Gemini API
    suggestions = generate_suggestions_gemini(emotion, text)
    
    # Fallback to local suggestions
    if not suggestions:
        suggestions = FALLBACK_SUGGESTIONS.get(emotion, FALLBACK_SUGGESTIONS["Neutral"])
        
    return jsonify({
        "emotion": emotion,
        "suggestions": suggestions
    })


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])
    emotion = data.get("emotion", "Neutral").strip()
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
        
    # Try Gemini API
    response = call_gemini_chat(message, history, emotion)
    
    # Fallback to static conversational helper
    if not response:
        response = get_fallback_chat_response(message, history, emotion)
        
    return jsonify({
        "response": response
    })


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": classifier is not None
    })


if __name__ == '__main__':
    port = int(os.getenv("PORT", 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
