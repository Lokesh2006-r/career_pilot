"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";

import Link from "next/link";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [activeJobs] = useState(0); // Feature not yet built
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [timeSaved] = useState(0); 
  const [topShortlisted, setTopShortlisted] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Load counts from local storage
    const chatsKey = `recruiter_analytics_chats_${user.uid}`;
    setChatsCount(parseInt(localStorage.getItem(chatsKey) || "0", 10));

    const shortKey = `shortlisted_candidates_${user.uid}`;
    const shortSaved = localStorage.getItem(shortKey);
    let shortIds: string[] = [];
    if (shortSaved) {
      try {
        shortIds = JSON.parse(shortSaved);
        setShortlistedCount(shortIds.length);
      } catch (e) {
        setShortlistedCount(0);
      }
    }

    // Fetch live candidates to map shortlisted top
    if (shortIds.length > 0) {
      fetch(`${API_BASE_URL}/api/recruiter/candidates`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            const allCandidates: any[] = json.data;
            const mapped = allCandidates.filter(c => shortIds.includes(c.id)).slice(0, 2);
            setTopShortlisted(mapped);
          }
        })
        .catch(err => console.error("Error fetching candidates for dashboard:", err));
    }
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-8 shadow-sm group">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-pink-500/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <i className="fa-solid fa-wand-magic-sparkles w-3 h-3" ></i>
              AI Recruiter Co-Pilot Active
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              Talent Acquisition Room
            </h2>
            <p className="text-sm text-zinc-550 dark:text-zinc-450">
              AI Student Twin systems are active. Screen candidate profiles and talk directly to their autonomous replica.
            </p>
          </div>
          
          <Link 
            href="/recruiter/search"
            className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-650 hover:from-purple-650 hover:to-indigo-750 text-white font-semibold text-sm shadow-[0_4px_20px_rgba(168,85,247,0.25)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.4)] active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <i className="fa-solid fa-users w-4 h-4" ></i>
            Explore Candidates Pool
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-550 dark:text-zinc-400 text-xs font-semibold tracking-wide uppercase">Active Openings</span>
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20">
              <i className="fa-solid fa-briefcase w-5 h-5" ></i>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-white leading-none mb-1">{activeJobs}</h3>
          <p className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider">Posted Roles</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-550 dark:text-zinc-400 text-xs font-semibold tracking-wide uppercase">Shortlisted Twins</span>
            <div className="p-2 bg-pink-500/10 rounded-xl text-pink-500 border border-pink-500/20">
              <i className="fa-solid fa-user-check w-5 h-5" ></i>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-white leading-none mb-1">{shortlistedCount}</h3>
          <p className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider">Ready to Interview</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-550 dark:text-zinc-400 text-xs font-semibold tracking-wide uppercase">AI Chats Initiated</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20">
              <i className="fa-solid fa-comment w-5 h-5" ></i>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-white leading-none mb-1">{chatsCount}</h3>
          <p className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider">Replica Interviews</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-550 dark:text-zinc-400 text-xs font-semibold tracking-wide uppercase">Screening Time Saved</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
              <i className="fa-solid fa-clock w-5 h-5" ></i>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-zinc-950 dark:text-white leading-none mb-1">{timeSaved}m</h3>
          <p className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-0.5">
            +18% Efficiency boost
          </p>
        </div>
      </div>

      {/* Main Charts & Pipeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recruitment Pipeline SVG Graph */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-chart-column w-5 h-5 text-purple-500" ></i>
              AI Pipeline Match Distribution (By Skill Groups)
            </h3>
            <span className="text-xs text-zinc-400 font-bold uppercase">Dynamic matching</span>
          </div>

          {/* Pipeline Graphic Bars */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-350">Frontend (React/Next.js)</span>
                <span className="text-purple-500 font-black">28 Candidates</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-350">Backend & API Gateways (Python/Node)</span>
                <span className="text-indigo-500 font-black">19 Candidates</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-350">AI & RAG Databases (Pinecone/LangChain)</span>
                <span className="text-pink-500 font-black">12 Candidates</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Shortlisted Quick Summary */}
        <div className="lg:col-span-4 glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-user-check w-5 h-5 text-pink-550" ></i>
            Top Shortlisted
          </h3>

          <div className="space-y-4">
            {topShortlisted.map(cand => (
              <div key={cand.id} className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div>
                  <p className="text-xs font-black text-zinc-900 dark:text-white">{cand.name}</p>
                  <p className="text-[9px] text-zinc-450 font-bold uppercase mt-0.5">{cand.leetcodeSolved} Leetcode • {cand.atsScore}% ATS Match</p>
                </div>
                <Link href="/recruiter/search" className="text-[10px] font-bold text-purple-550 hover:underline">Chat Clone</Link>
              </div>
            ))}
            {topShortlisted.length === 0 && (
              <div className="text-xs text-zinc-500 font-semibold italic">No candidates shortlisted yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
