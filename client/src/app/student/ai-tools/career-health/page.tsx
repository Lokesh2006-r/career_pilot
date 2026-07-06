"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function CareerHealthScore() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) fetchCachedData();
  }, [user]);

  const fetchCachedData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/cached/${user?.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.careerHealthScore) {
          setData(json.data.careerHealthScore);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateScore = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/career-health/${user.uid}`, {
        method: "POST"
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-zinc-900 dark:text-zinc-100 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-[11px] uppercase tracking-wider mb-1">
            <Link href="/student/ai-tools" className="hover:text-indigo-500 transition-colors">AI Tools</Link>
            <span>/</span>
            <span className="text-rose-500">Career Health Score</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-heart-pulse text-zinc-900 dark:text-white"></i> Career Health Score
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Holistic AI analysis of your placement readiness.</p>
        </div>
        <button 
          onClick={generateScore}
          disabled={generating}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rotate"></i>}
          {generating ? "Analyzing Profile..." : data ? "Re-evaluate Score" : "Generate Score"}
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
          <p className="text-sm text-zinc-500 font-medium animate-pulse">Loading data...</p>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <i className="fa-solid fa-heart-pulse text-4xl text-zinc-300 dark:text-zinc-600 mb-4"></i>
          <h3 className="text-lg font-semibold mb-2">No Score Generated Yet</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">Click the button above to let the AI Twin analyze your resume, coding progress, and mock interviews to generate your personalized health score.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Overall Health</h3>
              
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="8" fill="none" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className={`${data.score >= 80 ? 'stroke-emerald-500' : data.score >= 60 ? 'stroke-amber-500' : 'stroke-rose-500'} transition-all duration-1000 ease-out`} 
                    strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * data.score) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold tracking-tighter">{data.score}</span>
                  <span className="text-xs text-zinc-500 font-medium">/ 100</span>
                </div>
              </div>
              
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {data.score >= 80 ? "Excellent standing! You are well-prepared for top-tier placements." :
                 data.score >= 60 ? "Good progress. Focus on the suggestions to become interview-ready." :
                 "Needs attention. Follow the AI roadmap to build your profile."}
              </p>
              <p className="text-[10px] text-zinc-400 mt-4 font-mono">Last updated: {new Date(data.generatedAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-semibold mb-6 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <i className="fa-solid fa-chart-bar text-zinc-400"></i> Category Breakdown
              </h3>
              <div className="space-y-5">
                {data.categories?.map((cat: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                      <span>{cat.name}</span>
                      <span className="text-zinc-500">{cat.score} / {cat.maxScore}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-rose-800 dark:text-rose-300 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb"></i> Personalized Action Plan
              </h3>
              <ul className="space-y-3">
                {data.suggestions?.map((sug: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-rose-700 dark:text-rose-400/90 leading-relaxed">
                    <i className="fa-solid fa-arrow-right text-zinc-900 dark:text-white dark:text-zinc-900 dark:text-white mt-1 shrink-0"></i>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
