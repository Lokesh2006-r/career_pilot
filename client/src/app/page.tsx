"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  BrainCircuit, 
  Target, 
  Code, 
  Briefcase, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Star,
  Layers,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import CareerPilotLogo from "@/components/CareerPilotLogo";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("resume");

  // Bento Mockup Features Data
  const mockupData = {
    resume: {
      title: "ATS Resume Analyzer",
      badge: "AI Optimization",
      desc: "Instantly score resumes, map missing keywords, and match specific job listings with high accuracy.",
      gaugeVal: 92,
      details: [
        { label: "Keywords Match", val: "94%", status: "excellent" },
        { label: "Structural Score", val: "89%", status: "good" },
        { label: "Readability Rating", val: "95%", status: "excellent" }
      ]
    },
    interview: {
      title: "AI Voice Mock Interviews",
      badge: "Real-time Feedback",
      desc: "Simulate coding and behavioral loops. Track confidence, voice modulations, and correct keyword answers.",
      gaugeVal: 87,
      details: [
        { label: "Confidence Index", val: "88%", status: "excellent" },
        { label: "Clarity Score", val: "85%", status: "good" },
        { label: "Technical Coverage", val: "89%", status: "excellent" }
      ]
    },
    tracker: {
      title: "Coding Mastery Analytics",
      badge: "Platform Integrations",
      desc: "Sync LeetCode and CodeChef metrics automatically. Uncover weak sub-concepts and track streak heatmaps.",
      gaugeVal: 95,
      details: [
        { label: "Global Rating", val: "1850+", status: "excellent" },
        { label: "Weekly Streaks", val: "12 weeks", status: "excellent" },
        { label: "Topic Coverage", val: "91%", status: "excellent" }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Mesh Glow Blobs for Landing */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-[10000ms]"></div>

      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50">
        <div className="glass-panel rounded-2xl px-6 h-16 flex items-center justify-between border-zinc-200/40 dark:border-zinc-800/40 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md">
          <CareerPilotLogo size={38} colored={true} showText={true} />

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
            <Link href="#features" className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Features</Link>
            <Link href="#preview" className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Platform</Link>
            <Link href="#stats" className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Stats</Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-350 hover:text-indigo-500 dark:hover:text-indigo-450 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 active:scale-95 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-44 pb-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Context */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              Meet your professional clone
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]"
            >
              Your ultimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-500">
                Academic & Career
              </span> <br />
              AI Twin Agent.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed font-medium"
            >
              A premium AI-powered visual ecosystem that scores your resume, executes voice-based mock interviews, maps LeetCode streaks, and operates an interactive RAG clone to network with recruiters 24/7.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link href="/signup" className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-[0_10px_20px_-5px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all">
                Build My Agent Twin
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 text-zinc-900 dark:text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all">
                Access Dashboard
              </Link>
            </motion.div>
          </div>

          {/* Right Hero Interactive Bento Preview */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0">
            {/* Visual background glows */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 rounded-[2.5rem] blur-xl opacity-80 -z-10"></div>
            
            <div id="preview" className="glass-panel border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/40">
                  {Object.keys(mockupData).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === tab 
                          ? "bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm" 
                          : "text-zinc-400 hover:text-zinc-500"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Interactive Render of the tab */}
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-extrabold uppercase tracking-wide">
                      {mockupData[activeTab as keyof typeof mockupData].badge}
                    </span>
                    <h3 className="text-lg font-black tracking-tight">{mockupData[activeTab as keyof typeof mockupData].title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      {mockupData[activeTab as keyof typeof mockupData].desc}
                    </p>
                  </div>

                  {/* Circle SVG Gauge */}
                  <div className="relative shrink-0 w-20 h-20 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-250 dark:border-zinc-800 shadow-inner">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="3" fill="transparent" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="26" 
                        stroke="url(#grad)" 
                        strokeWidth="3.5" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 26} 
                        strokeDashoffset={2 * Math.PI * 26 * (1 - mockupData[activeTab as keyof typeof mockupData].gaugeVal / 100)} 
                        strokeLinecap="round" 
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-xs font-black tracking-tighter text-indigo-500 dark:text-indigo-400">
                      {mockupData[activeTab as keyof typeof mockupData].gaugeVal}%
                    </span>
                  </div>
                </div>

                {/* Sub details metrics */}
                <div className="grid grid-cols-3 gap-3 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-5">
                  {mockupData[activeTab as keyof typeof mockupData].details.map((det, i) => (
                    <div key={i} className="bg-zinc-50/50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850/40 text-center space-y-1 shadow-sm">
                      <span className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider truncate">{det.label}</span>
                      <span className="block text-sm font-black bg-gradient-to-tr from-indigo-500 to-cyan-500 bg-clip-text text-transparent">{det.val}</span>
                      <span className="inline-block px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[7px] font-bold uppercase tracking-wider">{det.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 border-y border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/20 dark:bg-zinc-950/20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Successful Placements", value: "10K+", icon: <Briefcase className="w-5 h-5 text-indigo-500" /> },
              { label: "Mock Trials Run", value: "50K+", icon: <Target className="w-5 h-5 text-cyan-500" /> },
              { label: "Average ATS Boost", value: "85%", icon: <Zap className="w-5 h-5 text-yellow-500" /> },
              { label: "Recruiting Corporate Hubs", value: "500+", icon: <Layers className="w-5 h-5 text-purple-500" /> }
            ].map((stat, i) => (
              <div key={i} className="glass-panel border-zinc-200/40 dark:border-zinc-800/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative group hover:scale-[1.02] hover:border-indigo-500/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-zinc-150/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-center mb-4">
                  {stat.icon}
                </div>
                <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-500 to-zinc-900 dark:from-white dark:via-indigo-400 dark:to-white bg-clip-text text-transparent mb-1.5">{stat.value}</span>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
              Everything you need to accelerate your potential.
            </h2>
            <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
              A comprehensive technical suite constructed on modern artificial intelligence to secure high-growth career options.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 - RAG Clone */}
            <div className="glass-panel rounded-3xl p-8 shadow-sm border-zinc-200/50 dark:border-zinc-800/40 hover:border-indigo-500/20 hover:shadow-[0_10px_30px_-10px_var(--glow-color)] transition-all md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
                Personal AI RAG Twin Agent
                <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[8px] font-bold uppercase tracking-wider">Unique</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-xl">
                Synthesize a custom conversational agent trained on your project files, LeetCode ratings, and work history. Allow corporate HR professionals and system matching algorithms to audit your twin through secure sandbox environments.
              </p>
            </div>

            {/* Box 2 - ATS Score */}
            <div className="glass-panel rounded-3xl p-8 shadow-sm border-zinc-200/50 dark:border-zinc-800/40 hover:border-cyan-500/20 hover:shadow-[0_10px_30px_-10px_var(--glow-color)] transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mb-2">ATS Resume Lab</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Unlock instant feedback loops on missing skill identifiers. Drag-and-drop resumes onto targeted jobs and inspect detailed metric indicators.
              </p>
            </div>

            {/* Box 3 - Coding metrics */}
            <div className="glass-panel rounded-3xl p-8 shadow-sm border-zinc-200/50 dark:border-zinc-800/40 hover:border-yellow-500/20 hover:shadow-[0_10px_30px_-10px_var(--glow-color)] transition-all relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mb-2">Coding Trackers</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Map competitive profiles directly. Monitor weekly growth, topic mastery indices, and access direct AI recommended algorithmic queries.
              </p>
            </div>

            {/* Box 4 - Mock interviews */}
            <div className="glass-panel rounded-3xl p-8 shadow-sm border-zinc-200/50 dark:border-zinc-800/40 hover:border-purple-500/20 hover:shadow-[0_10px_30px_-10px_var(--glow-color)] transition-all md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight mb-2">Real-time AI Mock Interviews</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium max-w-xl">
                Test communication variables directly. Run native audio loops simulating complex structural tech questions. Inspect real-time transcripts, structural scoring, and correct concept mapping lists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive premium CTA Area */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-[3rem] blur-3xl pointer-events-none -z-10"></div>
        
        <div className="glass-panel border-zinc-200/50 dark:border-zinc-800/40 rounded-[2.5rem] p-12 text-center max-w-4xl mx-auto space-y-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,var(--card-hover-border),transparent_50%)] pointer-events-none"></div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-wider">
            Now Recruiting Beta Testers
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none max-w-2xl mx-auto">
            Build your professional identity twin today.
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            Acquire unique insights, improve academic credentials, practice voice interviews, and stand out to recruiters automatically.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link href="/signup" className="flex items-center gap-2 px-8 py-4 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all">
              Launch Identity Agent
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/40 dark:bg-zinc-950/40 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="space-y-3">
            <div className="flex justify-center md:justify-start">
              <CareerPilotLogo size={38} colored={true} showText={true} />
            </div>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Next-Generation Academic Agent Co-pilot</p>
          </div>
          
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <Link href="#" className="hover:text-indigo-500 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-indigo-500 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-indigo-500 transition-colors">Contact</Link>
          </div>
          
          <div className="text-xs text-zinc-400 md:text-right font-medium">
            © 2026 CareerPilot. Configured for premium student identities.
          </div>
        </div>
      </footer>
    </div>
  );
}
