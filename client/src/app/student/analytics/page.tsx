"use client";

import { useState } from "react";
import { TrendingUp, BarChart2, Calendar, Target, Award, ArrowUpRight, Zap, Code, ShieldCheck } from "lucide-react";

export default function StudentAnalytics() {
  const [placementReadyIndex] = useState(82);
  const [codingStreak] = useState(18);
  const [totalSubmissions] = useState(144);
  const [avgInterviewScore] = useState(84);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Analytics</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Real-time placement indices, skill diagnostics, and preparation performance trackers.</p>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Placement Readiness</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{placementReadyIndex}%</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center">
              +4% <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Coding Streak</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{codingStreak} Days</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center">
              Active <Zap className="w-3 h-3 fill-emerald-500 ml-1" />
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">LeetCode Solved</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{totalSubmissions}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Problems</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avg Interview Score</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{avgInterviewScore}/100</span>
            <span className="text-xs font-bold text-indigo-500 flex items-center">
              Top 10%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Placement Readiness SVG Chart */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Preparation Growth Curve (Last 6 Weeks)
            </h3>
            <span className="text-xs text-zinc-400 font-bold uppercase">Weekly Updated</span>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="w-full h-64 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 relative overflow-hidden p-6 flex flex-col justify-between">
            {/* SVG Plot */}
            <div className="absolute inset-x-6 bottom-12 top-6">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                
                {/* Area under curve */}
                <path
                  d="M 0 110 L 100 95 L 200 80 L 300 65 L 400 45 L 500 25 L 500 150 L 0 150 Z"
                  fill="url(#chartGradient)"
                />
                
                {/* Line Path */}
                <path
                  d="M 0 110 L 100 95 L 200 80 L 300 65 L 400 45 L 500 25"
                  fill="transparent"
                  stroke="#6366f1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data Points */}
                <circle cx="0" cy="110" r="5.5" fill="#6366f1" stroke="white" strokeWidth="2" />
                <circle cx="100" cy="95" r="5.5" fill="#6366f1" stroke="white" strokeWidth="2" />
                <circle cx="200" cy="80" r="5.5" fill="#6366f1" stroke="white" strokeWidth="2" />
                <circle cx="300" cy="65" r="5.5" fill="#6366f1" stroke="white" strokeWidth="2" />
                <circle cx="400" cy="45" r="5.5" fill="#6366f1" stroke="white" strokeWidth="2" />
                <circle cx="500" cy="25" r="5.5" fill="#6366f1" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            
            {/* Y Axis Mock labels */}
            <div className="absolute left-6 top-6 bottom-12 flex flex-col justify-between text-[9px] font-black text-zinc-400 uppercase pointer-events-none">
              <span>95%</span>
              <span>75%</span>
              <span>55%</span>
            </div>

            <div className="mt-auto flex justify-between text-[10px] font-bold text-zinc-400 uppercase pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40 z-10 bg-transparent">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Week 5</span>
              <span>Week 6 (Current)</span>
            </div>
          </div>
        </div>

        {/* Skill Mastery Breakdown */}
        <div className="lg:col-span-4 glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            Skill Mastery Metrics
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-350">Data Structures & Algos</span>
                <span className="text-indigo-500 font-extrabold">85%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-350">System Architecture Design</span>
                <span className="text-cyan-500 font-extrabold">72%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: "72%" }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-350">Speech & Interview Delivery</span>
                <span className="text-purple-500 font-extrabold">90%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-350">ATS Profile Score Match</span>
                <span className="text-emerald-505 font-extrabold">78%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "78%" }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
