"use client";

import { useState, useEffect } from "react";
import { Cpu, Copy, ExternalLink, Sparkles, MessageSquare, Users, Clock, Send, Check, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AIStudentClone() {
  const { user } = useAuth();
  const [instructions, setInstructions] = useState(
    "You are my AI Twin. Represent me accurately as a passionate developer who specializes in Full Stack Web Applications, RAG search pipelines, and decentralized systems. Emphasize my experience with React/Next.js and Python. Be professional, direct, and highlight my placement readiness."
  );
  const [copied, setCopied] = useState(false);
  const [visitorCount, setVisitorCount] = useState(14);
  const [chatsCount, setChatsCount] = useState(9);
  const [savedMinutes, setSavedMinutes] = useState(135);
  const [savingInstructions, setSavingInstructions] = useState(false);

  const mockPublicLink = `http://localhost:3000/clone/share/${user?.uid || "student-demo-id"}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockPublicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveInstructions = () => {
    setSavingInstructions(true);
    setTimeout(() => {
      setSavingInstructions(false);
      alert("AI Twin Personality settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Student Clone</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Configure your AI clone personality matrix and share it with potential recruiters.</p>
        </div>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-550/15 flex items-center justify-center text-indigo-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recruiter Visits</p>
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">{visitorCount}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-550/15 flex items-center justify-center text-cyan-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chats Initiated</p>
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">{chatsCount}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-550/15 flex items-center justify-center text-emerald-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Time Saved (Minutes)</p>
              <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-white mt-1">{savedMinutes}m</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Configuration Prompt */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-indigo-500" />
              AI Twin Prompts & Knowledge Matrix
            </h2>

            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-550">Clone Identity Context Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all font-sans leading-relaxed resize-none"
                placeholder="Give instructions on how your AI Clone should speak, what they should prioritize..."
              />
              <p className="text-[10px] text-zinc-400 leading-normal font-medium">
                These directives will shape the prompt payload injected when recruiters chat with your public clone chatbot. Keep instructions brief and concise.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveInstructions}
                disabled={savingInstructions}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)] active:scale-95 transition-all cursor-pointer border border-white/10"
              >
                {savingInstructions ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Configuration
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sharing Links & Live Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Public Link Card */}
          <div className="glass-panel rounded-3xl p-6 space-y-5 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Share Public AI Twin Link</h2>
            
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
              Publish this link to your resume, LinkedIn profile, or portfolio site so recruiters can interview your simulated chatbot.
            </p>

            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl">
              <input
                type="text"
                readOnly
                value={mockPublicLink}
                className="flex-1 bg-transparent border-none text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 outline-none px-2 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-500 rounded-lg transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4.5 h-4.5 text-emerald-500" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-800/40">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">AI Clone Status: Active</span>
              <a
                href={mockPublicLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-indigo-550 dark:text-indigo-400 hover:underline font-bold"
              >
                Open Share View
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Visitor Analytics Map / Table Mock */}
          <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Recent Twin Interactions</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-200/50 dark:border-zinc-800/40">
                <div>
                  <p className="font-extrabold text-zinc-800 dark:text-white">Recruiter from Stripe</p>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Asked about React performance</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">2 hours ago</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-200/50 dark:border-zinc-800/40">
                <div>
                  <p className="font-extrabold text-zinc-800 dark:text-white">Hiring Manager at Uber</p>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Asked about Solidity experience</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">1 day ago</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <div>
                  <p className="font-extrabold text-zinc-800 dark:text-white">Recruiter from Google</p>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Discussed RAG architecture</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">3 days ago</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
