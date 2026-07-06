"use client";

import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

export default function RecruiterSettings() {
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  const [apiKeys, setApiKeys] = useState({
    openai: "",
    ragEngine: "https://rag.student-twin-engine.ai/v1"
  });

  const [atsConfig, setAtsConfig] = useState({
    minAtsScore: "80",
    screeningMode: "AI Twin Chat + Resume Index",
    interviewNotification: "instant"
  });

  // Load saved settings from localStorage
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`recruiter_settings_${user.uid}`) || localStorage.getItem("recruiter_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.apiKeys) {
          setApiKeys(prev => ({ ...prev, ...parsed.apiKeys }));
        }
        if (parsed.atsConfig) {
          setAtsConfig(prev => ({ ...prev, ...parsed.atsConfig }));
        }
      } catch (e) {
        console.error("Failed to parse recruiter settings:", e);
      }
    }
  }, [user]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveSettings = () => {
    if (user) {
      const payload = { apiKeys, atsConfig };
      localStorage.setItem(`recruiter_settings_${user.uid}`, JSON.stringify(payload));
      localStorage.setItem("recruiter_settings", JSON.stringify(payload));
    } else {
      const payload = { apiKeys, atsConfig };
      localStorage.setItem("recruiter_settings", JSON.stringify(payload));
    }
    triggerToast("Recruiter parameter preferences updated successfully!");
  };

  const handleResetData = () => {
    if (user) {
      localStorage.removeItem(`shortlisted_candidates_${user.uid}`);
    }
    localStorage.removeItem("shortlisted_candidates");
    triggerToast("Shortlisted candidates registers reset!");
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
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Settings</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Configure automated screening criteria and developer key integrations.</p>
        </div>
        
        <button 
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-purple-500 to-indigo-650 hover:from-purple-650 hover:to-indigo-750 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:shadow-[0_4px_15px_rgba(168,85,247,0.25)] active:scale-95 transition-all cursor-pointer border border-white/10"
        >
          Save Settings
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Configuration Panels */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ATS Config panel */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-sliders w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              ATS Screening Benchmarks
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">Minimum ATS Score Target</label>
                <select
                  value={atsConfig.minAtsScore}
                  onChange={(e) => setAtsConfig({ ...atsConfig, minAtsScore: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-550 transition-all cursor-pointer"
                >
                  <option value="70">70+ (Moderate pool)</option>
                  <option value="80">80+ (Highly qualified)</option>
                  <option value="90">90+ (Top tier matches)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">Screening Protocol Mode</label>
                <select
                  value={atsConfig.screeningMode}
                  onChange={(e) => setAtsConfig({ ...atsConfig, screeningMode: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-550 transition-all cursor-pointer"
                >
                  <option value="AI Twin Chat + Resume Index">AI Twin Chat + Resume Index</option>
                  <option value="Resume Only">Resume parser only</option>
                  <option value="Chat Only">Direct clone messaging only</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">Interview Notification Protocol</label>
                <select
                  value={atsConfig.interviewNotification}
                  onChange={(e) => setAtsConfig({ ...atsConfig, interviewNotification: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-550 transition-all cursor-pointer"
                >
                  <option value="instant">Instant Webhook & Email Alerts</option>
                  <option value="digest">Daily Digest Summary Report</option>
                  <option value="disabled">Disabled (No notifications)</option>
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
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">OpenAI API Key Token</label>
                <div className="relative">
                  <input
                    type={showOpenAIKey ? "text" : "password"}
                    value={apiKeys.openai}
                    onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                    placeholder="sk-proj-..."
                    className="w-full pl-4 pr-11 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-550"
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
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">RAG Vector DB Endpoint</label>
                <input
                  type="text"
                  value={apiKeys.ragEngine}
                  onChange={(e) => setApiKeys({ ...apiKeys, ragEngine: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-550"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sandbox Management */}
        <div className="space-y-8">
          
          {/* Developer Sandbox Options */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border-purple-500/15">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-shield w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              Sandbox Variables
            </h2>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/35 text-rose-500 rounded-xl font-bold uppercase tracking-wider text-[10px] active:scale-95 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-arrows-rotate w-4 h-4" ></i>
                  Reset Shortlist Data
                </button>
              </div>
            </div>
          </div>

          {/* System Specs */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-database w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              System Specs
            </h2>
            <div className="space-y-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-555 dark:text-zinc-450">
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
