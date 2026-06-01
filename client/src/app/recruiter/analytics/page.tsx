"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Users, Clock, Briefcase, Sparkles, ArrowUpRight } from "lucide-react";

export default function RecruiterAnalytics() {
  const [searchesCount] = useState(64);
  const [chatsCount] = useState(128);
  const [pipelineCount] = useState(25);
  const [conversionRate] = useState(14.8);

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Analytics</h1>
        <p className="text-zinc-550 dark:text-zinc-400 mt-1">Monitor screening efficiency, match ratios, and automated candidate conversations.</p>
      </header>

      {/* Grid of basic stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Candidate Searches</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{searchesCount}</span>
            <span className="text-xs font-bold text-emerald-555 flex items-center">
              +12% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AI Chats Screened</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{chatsCount}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Convos</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Pipeline</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{pipelineCount}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Profiles</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Shortlist Conv. Rate</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{conversionRate}%</span>
            <span className="text-xs font-bold text-purple-500 font-semibold">Excellent</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Screening activity SVG Graph */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-555" />
              Sourcing & Screening Volume (Weekly)
            </h3>
            <span className="text-xs text-zinc-400 font-bold uppercase">Updated live</span>
          </div>

          <div className="w-full h-64 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 relative overflow-hidden p-6 flex flex-col justify-between">
            <div className="absolute inset-x-6 bottom-12 top-6">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="recGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                
                <path d="M 0 130 L 100 110 L 200 90 L 300 70 L 400 40 L 500 30 L 500 150 L 0 150 Z" fill="url(#recGradient)" />
                <path d="M 0 130 L 100 110 L 200 90 L 300 70 L 400 40 L 500 30" fill="transparent" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
                
                <circle cx="0" cy="130" r="5" fill="#a855f7" stroke="white" strokeWidth="1.5" />
                <circle cx="100" cy="110" r="5" fill="#a855f7" stroke="white" strokeWidth="1.5" />
                <circle cx="200" cy="90" r="5" fill="#a855f7" stroke="white" strokeWidth="1.5" />
                <circle cx="300" cy="70" r="5" fill="#a855f7" stroke="white" strokeWidth="1.5" />
                <circle cx="400" cy="40" r="5" fill="#a855f7" stroke="white" strokeWidth="1.5" />
                <circle cx="500" cy="30" r="5" fill="#a855f7" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            
            <div className="absolute left-6 top-6 bottom-12 flex flex-col justify-between text-[9px] font-black text-zinc-400 pointer-events-none">
              <span>150</span>
              <span>100</span>
              <span>50</span>
            </div>

            <div className="mt-auto flex justify-between text-[10px] font-bold text-zinc-400 uppercase pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40 z-10">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Week 5</span>
              <span>Week 6 (Current)</span>
            </div>
          </div>
        </div>

        {/* Screening statistics breakdown */}
        <div className="lg:col-span-4 glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Time Savings Matrix
          </h3>

          <div className="space-y-4 text-xs font-semibold text-zinc-600 dark:text-zinc-355">
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-2">
              <h4 className="font-extrabold text-purple-550 uppercase tracking-wide text-[10px]">Candidate Screening AI Chat</h4>
              <p className="leading-relaxed">
                By allowing recruiters to chat directly with candidate clones, standard screen calls have been reduced from 30m to a 3m replica audit.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 space-y-2">
              <h4 className="font-extrabold text-pink-550 uppercase tracking-wide text-[10px]">Shortlist Conversion Gain</h4>
              <p className="leading-relaxed">
                Matches are checked automatically using parser compliance engines, improving placement rates by over 25%.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
