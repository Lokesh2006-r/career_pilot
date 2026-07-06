"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function PlacementReadiness() {
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
        if (json.success && json.data?.placementReadiness) {
          setData(json.data.placementReadiness);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReadiness = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/placement-readiness/${user.uid}`, {
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
      {/* Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-xl text-sm flex items-start sm:items-center gap-3">
        <i className="fa-solid fa-circle-info mt-0.5 sm:mt-0"></i>
        <p><strong>Disclaimer:</strong> This score is an AI-generated prediction based on your platform data. It is a recommendation tool and does not guarantee job placement.</p>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-[11px] uppercase tracking-wider mb-1">
            <Link href="/student/ai-tools" className="hover:text-indigo-500 transition-colors">AI Tools</Link>
            <span>/</span>
            <span className="text-emerald-500">Placement Readiness</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-bullseye text-zinc-900 dark:text-white"></i> Readiness Predictor
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Holistic evaluation to determine if you are ready for interviews.</p>
        </div>
        <button 
          onClick={generateReadiness}
          disabled={generating}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
          {generating ? "Calculating..." : "Predict Readiness"}
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <i className="fa-solid fa-bullseye text-4xl text-zinc-300 dark:text-zinc-600 mb-4"></i>
          <h3 className="text-lg font-semibold mb-2">No Prediction Available</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">Generate your first placement readiness prediction based on your resume, coding profiles, and mock interview performance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Readiness Score</h3>
              
              <div className="relative w-48 h-48 mb-4">
                <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="12" fill="none" strokeLinecap="round" />
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    className={`${data.score >= 80 ? 'stroke-emerald-500' : data.score >= 60 ? 'stroke-amber-500' : 'stroke-rose-500'} transition-all duration-1000 ease-out`} 
                    strokeWidth="12" fill="none" strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (125.6 * data.score) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                  <span className="text-5xl font-bold tracking-tighter">{data.score}</span>
                  <span className="text-xs text-zinc-500 font-medium">% Ready</span>
                </div>
              </div>

              <div className={`mt-4 px-4 py-1.5 rounded-full text-sm font-semibold ${
                data.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                data.score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
              }`}>
                {data.score >= 80 ? "Highly Prepared" : data.score >= 60 ? "Almost There" : "Needs Preparation"}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <i className="fa-solid fa-chart-radar text-zinc-900 dark:text-white"></i> Competency Radar
              </h3>
              <div className="space-y-4 mt-4">
                {data.categoryScores.map((cat: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1 font-medium text-zinc-600 dark:text-zinc-400">
                      <span>{cat.name}</span>
                      <span>{cat.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${cat.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                  <i className="fa-solid fa-arrow-trend-up text-zinc-900 dark:text-white"></i> Core Strengths
                </h3>
                <ul className="space-y-3">
                  {data.strengths.map((str: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <i className="fa-solid fa-check text-zinc-900 dark:text-white mt-1 shrink-0"></i>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                  <i className="fa-solid fa-arrow-trend-down text-zinc-900 dark:text-white"></i> Areas to Improve
                </h3>
                <ul className="space-y-3">
                  {data.weaknesses.map((wk: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <i className="fa-solid fa-xmark text-zinc-900 dark:text-white mt-1 shrink-0"></i>
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-list-check"></i> Final Preparation Steps
              </h3>
              <div className="space-y-3">
                {data.suggestions.map((sug: string, i: number) => (
                  <div key={i} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-100 dark:border-emerald-800 text-sm text-zinc-700 dark:text-zinc-300 shadow-sm flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      {i+1}
                    </div>
                    {sug}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
