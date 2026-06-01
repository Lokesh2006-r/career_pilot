"use client";

import { useState } from "react";
import { Sliders, KeyRound, Shield, Database, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminSettings() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [apiKeys, setApiKeys] = useState({
    openai: "••••••••••••••••••••••••••••••••",
    firebase: "••••••••••••••••••••••••••••••••",
    ragEngine: "https://rag.student-twin-engine.ai/v1"
  });

  const [platformConfig, setPlatformConfig] = useState({
    maintenanceMode: "Disabled",
    registrationLock: "Unlocked",
    logRetention: "30 Days"
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveSettings = () => {
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
          <CheckCircle className="w-5 h-5 animate-pulse" />
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
              <Sliders className="w-4.5 h-4.5 text-rose-555" />
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
            </div>
          </div>

          {/* API Keys Settings panel */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <KeyRound className="w-4.5 h-4.5 text-rose-555" />
              API Developer Gateways
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">OpenAI API Key Token</label>
                <input
                  type="password"
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-550"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">Firebase Configuration Token</label>
                <input
                  type="password"
                  value={apiKeys.firebase}
                  onChange={(e) => setApiKeys({ ...apiKeys, firebase: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-550"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sandbox Management */}
        <div className="space-y-8">
          
          {/* Developer Sandbox Options */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border-rose-500/15">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Shield className="w-4.5 h-4.5 text-rose-555" />
              Sandbox Variables
            </h2>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <button
                  onClick={handleResetLogs}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/35 text-rose-500 rounded-xl font-bold uppercase tracking-wider text-[10px] active:scale-95 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Platform Logs
                </button>
              </div>
            </div>
          </div>

          {/* System Specs */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-rose-555" />
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
