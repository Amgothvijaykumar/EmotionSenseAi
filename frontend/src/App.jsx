import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Mic, MicOff, Play, Trash2, Send, History, 
  MessageSquare, Calendar, PieChart, Sun, Moon, 
  RefreshCw, Music, CheckCircle, AlertCircle, Compass, Smile
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5002/api";
if (baseUrl && !baseUrl.endsWith('/api')) {
  baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}
const API_BASE_URL = baseUrl;

const EMOTION_THEMES = {
  Happy: {
    emoji: "😊",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50/80 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/40",
    gradient: "from-amber-400 to-yellow-500",
    accentColor: "amber",
    ringColor: "focus:ring-amber-500",
    progressBar: "bg-amber-500",
    shadow: "shadow-amber-100 dark:shadow-amber-950/30"
  },
  Sad: {
    emoji: "😔",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50/80 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900/40",
    gradient: "from-blue-400 to-indigo-500",
    accentColor: "blue",
    ringColor: "focus:ring-blue-500",
    progressBar: "bg-blue-500",
    shadow: "shadow-blue-100 dark:shadow-blue-950/30"
  },
  Angry: {
    emoji: "😠",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50/80 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-900/40",
    gradient: "from-red-400 to-rose-600",
    accentColor: "red",
    ringColor: "focus:ring-red-500",
    progressBar: "bg-red-500",
    shadow: "shadow-red-100 dark:shadow-red-950/30"
  },
  Love: {
    emoji: "❤️",
    textColor: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50/80 dark:bg-pink-950/20",
    borderColor: "border-pink-200 dark:border-pink-900/40",
    gradient: "from-pink-400 to-pink-600",
    accentColor: "pink",
    ringColor: "focus:ring-pink-500",
    progressBar: "bg-pink-500",
    shadow: "shadow-pink-100 dark:shadow-pink-950/30"
  },
  Fear: {
    emoji: "😨",
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50/80 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-900/40",
    gradient: "from-purple-400 to-indigo-600",
    accentColor: "purple",
    ringColor: "focus:ring-purple-500",
    progressBar: "bg-purple-500",
    shadow: "shadow-purple-100 dark:shadow-purple-950/30"
  },
  Surprise: {
    emoji: "😲",
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50/80 dark:bg-orange-950/20",
    borderColor: "border-orange-200 dark:border-orange-900/40",
    gradient: "from-orange-400 to-amber-500",
    accentColor: "orange",
    ringColor: "focus:ring-orange-500",
    progressBar: "bg-orange-500",
    shadow: "shadow-orange-100 dark:shadow-orange-950/30"
  },
  Neutral: {
    emoji: "😐",
    textColor: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50/80 dark:bg-slate-900/20",
    borderColor: "border-slate-200 dark:border-slate-800",
    gradient: "from-slate-400 to-slate-500",
    accentColor: "slate",
    ringColor: "focus:ring-slate-500",
    progressBar: "bg-slate-500",
    shadow: "shadow-slate-100 dark:shadow-slate-950/30"
  }
};

const MUSIC_RECOMMENDATIONS = {
  Happy: [
    { name: "Upbeat Sunshine", desc: "Energy & Pop Beats", url: "#" },
    { name: "Happy Hits Radio", desc: "Classic good vibe jams", url: "#" },
    { name: "Feel Good Pop", desc: "Vibrant dance rhythms", url: "#" }
  ],
  Sad: [
    { name: "Rainy Day Acoustics", desc: "Soft vocals & acoustic strings", url: "#" },
    { name: "Chill Lofi Beats", desc: "Relaxing atmospheric instrumentals", url: "#" },
    { name: "Peaceful Melancholy", desc: "Gentle piano compositions", url: "#" }
  ],
  Angry: [
    { name: "Calm Mind Meditation", desc: "Ambient frequency waves", url: "#" },
    { name: "Deep Breathing Zen", desc: "Guided relaxation soundscapes", url: "#" },
    { name: "Anger Release Frequency", desc: "Binaural beats for tension", url: "#" }
  ],
  Love: [
    { name: "Acoustic Love Ballads", desc: "Sweet, romantic melodies", url: "#" },
    { name: "Late Night Jazz Romance", desc: "Soft horns & piano duets", url: "#" },
    { name: "Warm Hug Acoustics", desc: "Cozy songwriting playlist", url: "#" }
  ],
  Fear: [
    { name: "Anxiety Relief Ambient", desc: "Ultra-soothing slow synths", url: "#" },
    { name: "Soothing Ocean Waves", desc: "Nature sounds with soft ambient", url: "#" },
    { name: "Sleep Space", desc: "Calming starfield instrumentals", url: "#" }
  ],
  Surprise: [
    { name: "Energetic Beats", desc: "Uplifting modern electro-pop", url: "#" },
    { name: "Synthwave Ride", desc: "Retrofuturistic synth loops", url: "#" },
    { name: "High Energy Rock", desc: "Thumping basslines & drive", url: "#" }
  ],
  Neutral: [
    { name: "Focus & Flow Ambient", desc: "Steady background focus noise", url: "#" },
    { name: "Productivity Chill", desc: "Middle-tempo acoustic grooves", url: "#" },
    { name: "Coffee Shop Bossa Nova", desc: "Light, jazzy background melodies", url: "#" }
  ]
};

function App() {
  // Input & Predictions
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  
  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // States
  const [history, setHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const chatSectionRef = useRef(null);

  // Initialize Theme and Local Storage
  useEffect(() => {
    // Dark mode classes
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true");
    } else {
      localStorage.setItem("darkMode", "true");
    }

    // Load History
    const savedHistory = localStorage.getItem("emotionHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Update HTML class when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // Sync history to local storage
  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem("emotionHistory", JSON.stringify(newHistory));
  };

  // Scroll Chat to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Scroll smoothly to Chat Companion window when opened
  useEffect(() => {
    if (showChatWindow && chatSectionRef.current) {
      chatSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showChatWindow]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setError("");
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error", e);
        setError("Speech recognition failed or permission denied.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Toggle Microphone
  const handleMicToggle = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Analyze Emotion Submission
  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setSuggestions([]);
    setError("");
    setShowChatWindow(false);

    try {
      // 1. Fetch prediction
      const predictResponse = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!predictResponse.ok) {
        throw new Error("Unable to analyze emotion. Please ensure the backend is running.");
      }

      const predictionData = await predictResponse.json();
      setResult(predictionData);

      // Add to History & Timeline
      const timestamp = new Date().toISOString();
      const newHistoryItem = {
        id: Date.now(),
        text: text,
        emotion: predictionData.emotion,
        confidence: predictionData.confidence,
        timestamp: timestamp
      };
      
      const updatedHistory = [newHistoryItem, ...history];
      saveHistory(updatedHistory);

      // Reset Chat companion with new context
      const welcomeMsg = `Hey there, I detected you might be feeling some ${predictionData.emotion} ${EMOTION_THEMES[predictionData.emotion]?.emoji || ""}. I am here to chat empathetically with you. How's everything going?`;
      setChatMessages([
        { sender: "bot", text: welcomeMsg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);

      // 2. Fetch suggestions asynchronously to feel fast
      setIsFetchingSuggestions(true);
      const suggestionsResponse = await fetch(`${API_BASE_URL}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, emotion: predictionData.emotion })
      });

      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        setSuggestions(suggestionsData.suggestions);
      } else {
        setSuggestions(EMOTION_THEMES[predictionData.emotion] ? EMOTION_THEMES[predictionData.emotion].fallbackSuggestions : []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during prediction.");
    } finally {
      setIsAnalyzing(false);
      setIsFetchingSuggestions(false);
    }
  };

  // Clear analysis history
  const handleClearHistory = () => {
    saveHistory([]);
  };

  // Chat message submission
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setIsChatSending(true);

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...chatMessages, { sender: "user", text: userMsg, timestamp: timeString }];
    setChatMessages(newMessages);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(0, -1), // Send previous messages
          emotion: result?.emotion || "Neutral"
        })
      });

      if (!response.ok) {
        throw new Error("Chat companion is temporarily unavailable.");
      }

      const chatData = await response.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: chatData.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I'm sorry, I'm having trouble connecting right now. But I am still here to support you in spirit.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Setup Distribution Chart Data
  const getChartData = () => {
    const counts = { Happy: 0, Sad: 0, Angry: 0, Love: 0, Fear: 0, Surprise: 0, Neutral: 0 };
    history.forEach(item => {
      if (counts[item.emotion] !== undefined) {
        counts[item.emotion]++;
      }
    });

    const activeEmotions = Object.keys(counts).filter(key => counts[key] > 0);
    const dataValues = activeEmotions.map(key => counts[key]);
    
    // Emotion specific pie slice colors
    const colorsMap = {
      Happy: "#f59e0b", // Amber
      Sad: "#3b82f6", // Blue
      Angry: "#ef4444", // Red
      Love: "#ec4899", // Pink
      Fear: "#a855f7", // Purple
      Surprise: "#f97316", // Orange
      Neutral: "#64748b" // Slate
    };
    
    const bgColors = activeEmotions.map(key => colorsMap[key]);

    return {
      labels: activeEmotions,
      datasets: [
        {
          data: dataValues,
          backgroundColor: bgColors,
          borderWidth: darkMode ? 1 : 2,
          borderColor: darkMode ? "#1e293b" : "#ffffff"
        }
      ]
    };
  };

  // Group timeline by week days or format nicely
  const getTimelineDate = (isoString) => {
    const date = new Date(isoString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${days[date.getDay()]} (${date.toLocaleDateString()}) at ${time}`;
  };

  const activeTheme = result ? EMOTION_THEMES[result.emotion] : EMOTION_THEMES.Neutral;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-zinc-100 to-slate-200 dark:from-slate-950 dark:via-zinc-950 dark:to-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans pb-16">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-2.5 rounded-2xl text-white shadow-lg shadow-purple-500/20">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                EmotionSense AI
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Cognitive Analyzer
              </p>
            </div>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Toggle theme mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Analyzer Input and Output */}
        <section className="lg:col-span-7 flex flex-col space-y-8">
          
          {/* Main Input Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
            <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <Smile className="w-5 h-5 text-indigo-500" />
              <span>How are you feeling today?</span>
            </h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or speak a sentence describing your current mood, feelings, or day..."
                  rows="4"
                  maxLength={1000}
                  className="w-full px-4 py-3 pb-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                />
                
                {/* Micro and Counter Section */}
                <div className="absolute right-3 bottom-3 flex items-center space-x-3">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {text.length}/1000
                  </span>
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isListening 
                      ? "bg-red-500 border-red-500 text-white animate-bounce shadow-lg shadow-red-500/20" 
                      : "bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-800"
                    }`}
                    title={isListening ? "Stop listening" : "Record voice input"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-3.5 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing || !text.trim()}
                className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing Emotion Patterns...</span>
                  </>
                ) : (
                  <span>Analyze Emotion</span>
                )}
              </button>
            </form>
          </div>

          {/* Emotion Prediction Output Result Card */}
          {result && (
            <div className={`transition-all duration-500 rounded-3xl p-6 border ${activeTheme.bgColor} ${activeTheme.borderColor} ${activeTheme.shadow} shadow-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block mb-1">
                    Analysis Results
                  </span>
                  <h3 className={`text-2xl font-extrabold flex items-center space-x-2 ${activeTheme.textColor}`}>
                    <span>Emotion Detected: {result.emotion}</span>
                    <span>{activeTheme.emoji}</span>
                  </h3>
                </div>
                <div className={`px-3.5 py-1.5 rounded-full text-xs font-black bg-white dark:bg-slate-900 border ${activeTheme.borderColor} ${activeTheme.textColor}`}>
                  Confidence: {result.confidence}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5">
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${activeTheme.progressBar}`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Cleaned Input Text</p>
                <p className="text-sm italic text-slate-700 dark:text-slate-300 font-medium">"{result.cleaned_text || result.original_text}"</p>
              </div>

              <div className="mt-6 flex justify-between items-center border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Feel free to discuss this further with the companion.
                </p>
                <button
                  onClick={() => setShowChatWindow(true)}
                  className={`px-4 py-2 rounded-xl text-white font-bold text-sm bg-gradient-to-r ${activeTheme.gradient} hover:opacity-90 transition-all`}
                >
                  Chat with AI
                </button>
              </div>
            </div>
          )}

          {/* AI-Based Suggestions Card */}
          {result && (
            <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/20 transition-all duration-300">
              <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Compass className="w-5 h-5 text-purple-500" />
                <span>AI-Powered Suggestions for You</span>
              </h3>
              
              {isFetchingSuggestions ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                  <p className="text-sm font-medium text-slate-400">Generating personal suggestions...</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {suggestions.map((suggestion, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900/60 hover:translate-x-1 transition-transform"
                    >
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${activeTheme.textColor}`} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* AI Chat Companion Section */}
          {showChatWindow && result && (
            <div ref={chatSectionRef} className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-3xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-black/30 flex flex-col h-[400px]">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className={`w-5 h-5 ${activeTheme.textColor}`} />
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">AI Chat Companion</h4>
                  <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <button 
                  onClick={() => setShowChatWindow(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                >
                  Close Chat
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium ${
                      msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-slate-800/30'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2 mt-auto">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Say anything you're feeling...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatSending}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
                >
                  {isChatSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

        </section>

        {/* Right Side: Mood Tracker, Music Recommendations, Distribution Chart, History */}
        <section className="lg:col-span-5 flex flex-col space-y-8">
          
          {/* Emotion Distribution Pie Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              <span>Emotion Distribution</span>
            </h3>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                <PieChart className="w-12 h-12 stroke-[1] mb-2 opacity-50" />
                <p className="text-xs font-semibold">No data points analyzed yet</p>
              </div>
            ) : (
              <div className="max-w-[210px] mx-auto">
                <Pie 
                  data={getChartData()} 
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 12,
                          font: { size: 10, weight: 'bold' },
                          color: darkMode ? '#94a3b8' : '#475569'
                        }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Music Recommendations */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <Music className="w-5 h-5 text-pink-500" />
              <span>Recommended Playlists</span>
            </h3>
            
            <div className="space-y-3">
              {(MUSIC_RECOMMENDATIONS[result?.emotion] || MUSIC_RECOMMENDATIONS.Neutral).map((song, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/30 text-pink-500">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{song.name}</h4>
                      <p className="text-[11px] font-semibold text-slate-400">{song.desc}</p>
                    </div>
                  </div>
                  <a 
                    href={song.url} 
                    className={`p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 hover:text-pink-500 transition-colors`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Mood Tracker Timeline */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span>Daily Mood Tracker</span>
            </h3>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                <Calendar className="w-12 h-12 stroke-[1] mb-2 opacity-50" />
                <p className="text-xs font-semibold">Mood timeline is empty</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 pl-4 space-y-6">
                {history.slice(0, 4).map((item) => (
                  <div key={item.id} className="relative">
                    <span className={`absolute -left-[25px] top-0.5 rounded-full border bg-white dark:bg-slate-900 p-0.5 text-sm flex items-center justify-center border-slate-200 dark:border-slate-800`}>
                      {EMOTION_THEMES[item.emotion]?.emoji || "😐"}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400">{getTimelineDate(item.timestamp)}</h4>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                        Mood: {item.emotion} <span className="text-xs font-medium text-slate-400">({item.confidence}%)</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate mt-0.5">"{item.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emotion Analysis History log */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <History className="w-5 h-5 text-amber-500" />
                <span>Emotion History Log</span>
              </h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                <History className="w-12 h-12 stroke-[1] mb-2 opacity-50" />
                <p className="text-xs font-semibold">History log is empty</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5">Input Text</th>
                      <th className="py-2.5 pr-2">Emotion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                        <td className="py-3 pr-4 font-medium max-w-[200px] truncate" title={item.text}>{item.text}</td>
                        <td className="py-3 font-semibold flex items-center space-x-1.5">
                          <span>{EMOTION_THEMES[item.emotion]?.emoji || "😐"}</span>
                          <span>{item.emotion}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </section>

      </main>
    </div>
  );
}

export default App;
