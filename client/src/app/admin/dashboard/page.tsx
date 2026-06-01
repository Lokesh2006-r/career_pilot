"use client";

import { useState, useEffect } from "react";
import { Users, Cpu, Activity, HardDrive, Terminal as TermIcon, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "SUCCESS";
  message: string;
}

const INITIAL_LOGS: LogEntry[] = [
  { timestamp: "22:15:32", level: "INFO", message: "Initial system startup checks completed." },
  { timestamp: "22:16:04", level: "SUCCESS", message: "Connected to MongoDB Atlas clusters securely." },
  { timestamp: "22:18:41", level: "INFO", message: "Parsed ATS checklist scoring matrices." },
  { timestamp: "22:20:12", level: "WARN", message: "Firebase Auth callback latency warning (230ms)." },
  { timestamp: "22:21:05", level: "SUCCESS", message: "Simulated twin replica chat session created for candidate Alex Johnson." },
  { timestamp: "22:24:50", level: "INFO", message: "Ingestion job #104 initialized for resume parser backend." }
];

export default function AdminDashboardOverview() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [serverStatus] = useState("Online");
  const [apiUsage] = useState(84.2); // percentage
  const [studentCount, setStudentCount] = useState(142);
  const [recruiterCount, setRecruiterCount] = useState(28);

  // Simulate incoming live terminal logs
  useEffect(() => {
    const timer = setInterval(() => {
      const messages = [
        "Ingested student profile update to local buffer.",
        "Shortlisted candidate list updated for recruiter #4.",
        "RAG search query completed on Pinecone Index 'candidate-embeddings'.",
        "Refreshed speech assessment tokens for mock-interviews.",
        "Secure auth route guard checked matching scopes."
      ];
      const levels: ("INFO" | "WARN" | "SUCCESS")[] = ["INFO", "SUCCESS", "INFO", "SUCCESS", "WARN"];
      const randomIdx = Math.floor(Math.random() * messages.length);
      const time = new Date().toTimeString().split(" ")[0];
      
      setLogs(prev => [
        { timestamp: time, level: levels[randomIdx], message: messages[randomIdx] },
        ...prev.slice(0, 8)
      ]);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Console */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-8 shadow-sm group">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Sparkles className="w-3 h-3" />
              Master Control System Active
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              Platform Admin Console
            </h2>
            <p className="text-sm text-zinc-550 dark:text-zinc-450">
              Monitor active users, monitor simulated server clusters logs, or update API access boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Students</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{studentCount}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Registrations</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Recruiters</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{recruiterCount}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Companies</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">API Utilization</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{apiUsage}%</span>
            <span className="text-xs text-rose-500 font-bold">High usage</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Server Status</p>
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{serverStatus}</span>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">Node-US-East</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Signups over time SVG Graph */}
        <div className="lg:col-span-6 glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            User Signups & Registration Flow (6 Weeks)
          </h3>

          <div className="w-full h-60 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 relative overflow-hidden p-6 flex flex-col justify-between">
            <div className="absolute inset-x-6 bottom-12 top-6">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
                
                <path d="M 0 120 L 100 100 L 200 85 L 300 70 L 400 45 L 500 35 L 500 150 L 0 150 Z" fill="url(#adminGradient)" />
                <path d="M 0 120 L 100 100 L 200 85 L 300 70 L 400 45 L 500 35" fill="transparent" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
                
                <circle cx="500" cy="35" r="5" fill="#f43f5e" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="mt-auto flex justify-between text-[10px] font-bold text-zinc-400 uppercase pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40 z-10">
              <span>W1</span>
              <span>W2</span>
              <span>W3</span>
              <span>W4</span>
              <span>W5</span>
              <span>W6</span>
            </div>
          </div>
        </div>

        {/* Live console terminal logs */}
        <div className="lg:col-span-6 glass-panel p-8 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <TermIcon className="w-5 h-5 text-rose-500" />
              Interactive Console Monitor
            </h3>
            <span className="text-[9px] font-black uppercase bg-rose-500/10 text-rose-550 border border-rose-500/20 px-2 py-0.5 rounded">Live Stream</span>
          </div>

          {/* Code block style console */}
          <div className="flex-1 min-h-[220px] bg-zinc-950 rounded-2xl p-4 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-2 border border-zinc-850">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-zinc-550 shrink-0">[{log.timestamp}]</span>
                <span className={`font-black shrink-0 ${
                  log.level === 'SUCCESS' ? 'text-emerald-500' : log.level === 'WARN' ? 'text-amber-500' : 'text-cyan-500'
                }`}>
                  {log.level}
                </span>
                <span className="text-zinc-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
