"use client";

import { useState, useEffect } from "react";


export default function AdminSettings() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);

  const [apiKeys, setApiKeys] = useState({
    openai: "",
    firebase: "",
    ragEngine: "https://rag.student-twin-engine.ai/v1"
  });

  const [platformConfig, setPlatformConfig] = useState({
    maintenanceMode: "Disabled",
    registrationLock: "Unlocked",
    logRetention: "30 Days"
  });

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.apiKeys) {
          setApiKeys(prev => ({ ...prev, ...parsed.apiKeys }));
        }
        if (parsed.platformConfig) {
          setPlatformConfig(prev => ({ ...prev, ...parsed.platformConfig }));
        }
      } catch (e) {
        console.error("Failed to parse admin settings:", e);
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveSettings = () => {
    const payload = { apiKeys, platformConfig };
    localStorage.setItem("admin_settings", JSON.stringify(payload));
    triggerToast("Platform master settings updated successfully!");
  };

  const handleResetLogs = () => {
    triggerToast("Platform log registers cleared!");
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
          <p className="text-zinc-555 dark:text-zinc-400 mt-1">Configure global platform locks and developer database adapters.</p>
        </div>
        
        <button 
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-rose-500 to-red-600 hover:from-rose-650 hover:to-red-750 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:shadow-[0_4px_15px_rgba(244,63,94,0.25)] active:scale-95 transition-all cursor-pointer border border-white/10"
        >
          Save Settings
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Configuration Panels */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Platform Config panel */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-sliders w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              Platform Control Locks
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">Maintenance Mode</label>
                <select
                  value={platformConfig.maintenanceMode}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, maintenanceMode: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-550 transition-all cursor-pointer"
                >
                  <option value="Disabled">Disabled (Normal Operations)</option>
                  <option value="Enabled">Enabled (Admin Only)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">Registration Lock</label>
                <select
                  value={platformConfig.registrationLock}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, registrationLock: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-550 transition-all cursor-pointer"
                >
                  <option value="Unlocked">Unlocked (Public signup)</option>
                  <option value="Locked">Locked (Invite only)</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">System Logs Retention Period</label>
                <select
                  value={platformConfig.logRetention}
                  onChange={(e) => setPlatformConfig({ ...platformConfig, logRetention: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-550 transition-all cursor-pointer"
                >
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="90 Days">90 Days</option>
                  <option value="Indefinite">Indefinite Report Retention</option>
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
                    className="w-full pl-4 pr-11 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-550"
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
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">Firebase Configuration Token</label>
                <div className="relative">
                  <input
                    type={showFirebaseKey ? "text" : "password"}
                    value={apiKeys.firebase}
                    onChange={(e) => setApiKeys({ ...apiKeys, firebase: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full pl-4 pr-11 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-550"
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
            </div>
          </div>
        </div>

        {/* Right Column - Sandbox Management */}
        <div className="space-y-8">
          
          {/* Developer Sandbox Options */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border-rose-500/15">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-shield w-4.5 h-4.5 text-zinc-900 dark:text-white" ></i>
              Sandbox Variables
            </h2>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <button
                  onClick={handleResetLogs}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/35 text-rose-500 rounded-xl font-bold uppercase tracking-wider text-[10px] active:scale-95 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-arrows-rotate w-4 h-4" ></i>
                  Clear Platform Logs
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
