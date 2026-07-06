"use client";

import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [apiKeys, setApiKeys] = useState({
    openai: "",
    firebase: "",
    ragEngine: "https://rag.student-twin-engine.ai/v1"
  });

  const [aiConfig, setAiConfig] = useState({
    assistantVoice: "",
    speechSpeed: "1.0",
    modelSelection: "gpt-4o-mini",
    rigorLevel: "advanced"
  });

  // Load browser speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const list = window.speechSynthesis.getVoices();
        const englishVoices = list.filter(v => v.lang.startsWith("en"));
        setAvailableVoices(englishVoices);

        setAiConfig(prev => {
          if (prev.assistantVoice) return prev;
          const defaultVoice = englishVoices.find(v => 
            v.name.toLowerCase().includes("natural") || 
            v.name.toLowerCase().includes("google") || 
            v.name.toLowerCase().includes("aria") || 
            v.name.toLowerCase().includes("guy")
          ) || englishVoices[0];
          return { ...prev, assistantVoice: defaultVoice ? defaultVoice.name : "alloy" };
        });
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Load saved settings from localStorage & backend
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      let loadedSettings = null;

      try {
        const res = await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.settings) {
            loadedSettings = json.data.settings;
          }
        }
      } catch (err) {
        console.error("Failed to load settings from DB:", err);
      }

      if (!loadedSettings) {
        const saved = localStorage.getItem(`student_settings_${user.uid}`) || localStorage.getItem("student_settings");
        if (saved) {
          try {
            loadedSettings = JSON.parse(saved);
          } catch {}
        }
      }

      if (loadedSettings) {
        if (loadedSettings.apiKeys) {
          setApiKeys(prev => ({ ...prev, ...loadedSettings.apiKeys }));
        }
        if (loadedSettings.aiConfig) {
          setAiConfig(prev => ({ ...prev, ...loadedSettings.aiConfig }));
        }
      }
    };

    loadSettings();
  }, [user]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleTestVoice = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const text = "Hello! This is a preview of my synthesized placement twin voice.";
      const utterance = new SpeechSynthesisUtterance(text);
      const list = window.speechSynthesis.getVoices();
      const chosenVoice = list.find(v => v.name === aiConfig.assistantVoice) || 
                          list.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("natural")) ||
                          list.find(v => v.lang.startsWith("en")) || 
                          list[0];
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
      utterance.rate = Number(aiConfig.speechSpeed || "1.0");
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleResetData = async () => {
    // Clear custom sandbox states to defaults
    if (user) {
      localStorage.removeItem(`student_profile_${user.uid}`);
      localStorage.removeItem(`applied_internships_${user.uid}`);
      localStorage.removeItem(`coding_handles_${user.uid}`);
      localStorage.removeItem(`daily_checklist_${user.uid}`);
      localStorage.removeItem(`practice_logs_${user.uid}`);
      localStorage.removeItem(`student_settings_${user.uid}`);

      // Sync reset to backend
      try {
        await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: "",
            headline: "",
            location: "",
            email: "",
            phone: "",
            university: "",
            degree: "",
            gradYear: "",
            github: "",
            linkedin: "",
            portfolio: "",
            codingHandles: { leetcode: "", codeforces: "", codechef: "" },
            settings: {},
            dailyChecklist: [],
            practiceLogs: []
          })
        });
      } catch (err) {
        console.error("Failed to sync reset to DB:", err);
      }
    }
    localStorage.removeItem("student_profile");
    localStorage.removeItem("applied_internships");
    localStorage.removeItem("coding_metrics");
    localStorage.removeItem("interview_sessions");
    localStorage.removeItem("coding_handles_v3");
    localStorage.removeItem("daily_checklist_v1");
    localStorage.removeItem("practice_logs_v1");
    localStorage.removeItem("student_settings");
    
    // Reset state values
    setApiKeys({
      openai: "",
      firebase: "",
      ragEngine: "https://rag.student-twin-engine.ai/v1"
    });
    setAiConfig({
      assistantVoice: "",
      speechSpeed: "1.0",
      modelSelection: "gpt-4o-mini",
      rigorLevel: "advanced"
    });

    // Dispatch events to notify other tabs
    window.dispatchEvent(new Event('profile_updated'));
    window.dispatchEvent(new Event('student_settings_updated'));
    triggerToast("Sandbox identity variables reset to default values!");
  };

  const handleSaveSettings = async () => {
    const payload = { apiKeys, aiConfig };
    if (user) {
      localStorage.setItem(`student_settings_${user.uid}`, JSON.stringify(payload));
      localStorage.setItem("student_settings", JSON.stringify(payload));
      
      // Save settings to backend MongoDB DB
      try {
        await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: payload })
        });
      } catch (err) {
        console.error("Failed to save settings to DB:", err);
      }
      
      window.dispatchEvent(new Event("student_settings_updated"));
    } else {
      localStorage.setItem("student_settings", JSON.stringify(payload));
      window.dispatchEvent(new Event("student_settings_updated"));
    }
    triggerToast("System parameter registers updated successfully!");
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-white/80 dark:bg-zinc-950/80 border border-emerald-500/30 text-emerald-500 px-5 py-3.5 rounded-2xl backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <i className="fa-regular fa-circle-check w-5 h-5 animate-pulse" ></i>
          <span className="font-extrabold text-xs uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Configure artificial twin parameters and developer API gateways.</p>
        </div>
        
        <button 
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)] active:scale-95 transition-all cursor-pointer border border-white/10"
        >
          Save Settings
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Configuration Panels */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Settings panel */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-sliders w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              AI Assistant Orchestration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Twin Speech Voice</label>
                <div className="flex gap-2">
                  <select
                    value={aiConfig.assistantVoice}
                    onChange={(e) => setAiConfig({ ...aiConfig, assistantVoice: e.target.value })}
                    className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all cursor-pointer"
                  >
                    {availableVoices.length === 0 ? (
                      <>
                        <option value="alloy">Alloy (Balanced)</option>
                        <option value="echo">Echo (Warm)</option>
                        <option value="fable">Fable (Expressive)</option>
                        <option value="onyx">Onyx (Professional)</option>
                      </>
                    ) : (
                      availableVoices.map(voice => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang}) {voice.name.toLowerCase().includes("natural") ? "🌟 Premium" : ""}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={handleTestVoice}
                    className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-zinc-250 dark:border-zinc-800 active:scale-95 cursor-pointer"
                  >
                    <i className="fa-solid fa-volume-high w-4 h-4 text-zinc-900 dark:text-white" ></i>
                    Test Voice
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Interview Rigor Level</label>
                <select
                  value={aiConfig.rigorLevel}
                  onChange={(e) => setAiConfig({ ...aiConfig, rigorLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all cursor-pointer"
                >
                  <option value="standard">Standard Mentorship</option>
                  <option value="advanced">Advanced Auditor (Recommended)</option>
                  <option value="brutal">Brutal FAANG Drill</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Speech Pace Coefficient</label>
                <select
                  value={aiConfig.speechSpeed}
                  onChange={(e) => setAiConfig({ ...aiConfig, speechSpeed: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all cursor-pointer"
                >
                  <option value="0.8">0.8x (Deliberate)</option>
                  <option value="1.0">1.0x (Natural)</option>
                  <option value="1.2">1.2x (Fast)</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Core LLM Gateway Model</label>
                <select
                  value={aiConfig.modelSelection}
                  onChange={(e) => setAiConfig({ ...aiConfig, modelSelection: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all cursor-pointer"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Ultra-speed)</option>
                  <option value="gpt-4o">GPT-4o (Deep Analysis)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Logic-heavy)</option>
                </select>
              </div>
            </div>
          </div>

          {/* API Keys Settings panel */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-key w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              API Developer Gateways
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">OpenAI API Key Token</label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? "text" : "password"}
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                    placeholder="sk-proj-..."
                    className="w-full pl-4 pr-11 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-550"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors"
                  >
                    {showOpenAIKey ? <i className="fa-solid fa-eye-slash w-4 h-4" ></i> : <i className="fa-solid fa-eye w-4 h-4" ></i>}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Firebase Configuration Token</label>
                <div className="relative">
                  <input
                    type={showFirebaseKey ? "text" : "password"}
                    value={apiKeys.firebase}
                    onChange={(e) => setApiKeys({ ...apiKeys, firebase: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full pl-4 pr-11 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-550"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFirebaseKey(!showFirebaseKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors"
                  >
                    {showFirebaseKey ? <i className="fa-solid fa-eye-slash w-4 h-4" ></i> : <i className="fa-solid fa-eye w-4 h-4" ></i>}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">RAG Vector DB Endpoint</label>
                <input
                  type="text"
                  value={apiKeys.ragEngine}
                  onChange={(e) => setApiKeys({ ...apiKeys, ragEngine: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-550"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sandbox Management */}
        <div className="space-y-8">
          
          {/* Developer Sandbox Options */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border-indigo-500/15">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-shield w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              Sandbox Variables
            </h2>
            
            <div className="space-y-4 text-xs">
              <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-500 font-extrabold uppercase tracking-wide text-[10px]">
                  <i className="fa-solid fa-wand-magic-sparkles w-4.5 h-4.5 animate-pulse" ></i>
                  Twin Sync Status
                </div>
                <p className="text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
                  Sandbox active. Speech assessments, ATS scoring, and local profile metrics bypass remote networks and store directly in local buffers.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/35 text-rose-500 rounded-xl font-bold uppercase tracking-wider text-[10px] active:scale-95 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-arrows-rotate w-4 h-4" ></i>
                  Reset Identity Data
                </button>
                <p className="text-[10px] text-center text-zinc-400 font-medium leading-relaxed">
                  Resetting clears your custom profile settings, coding scores, and resume files back to developer baseline values.
                </p>
              </div>
            </div>
          </div>

          {/* System Specs */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-database w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              System Specs
            </h2>
            <div className="space-y-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
              <div className="flex justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-2">
                <span>RAG Protocol</span>
                <span className="text-zinc-900 dark:text-white">v2.4.1</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-2">
                <span>Next.js Framework</span>
                <span className="text-zinc-900 dark:text-white">v15.0</span>
              </div>
              <div className="flex justify-between">
                <span>Tailwind Engine</span>
                <span className="text-zinc-900 dark:text-white">v4.0 Alpha</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
