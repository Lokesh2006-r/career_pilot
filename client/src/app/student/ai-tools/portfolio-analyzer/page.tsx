"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function PortfolioAnalyzer() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchCachedData();
  }, [user]);

  const fetchCachedData = async () => {
    try {
      const profileRes = await fetch(`${API_BASE_URL}/api/student/profile/${user?.uid}`);
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        if (profileJson.success && profileJson.data?.portfolio) {
          setUrl(profileJson.data.portfolio);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/ai-tools/cached/${user?.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.portfolioAnalysis) {
          setData(json.data.portfolioAnalysis);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !url.trim()) return;
    
    let submitUrl = url.trim();
    if (!submitUrl.startsWith('http')) submitUrl = `https://${submitUrl}`;
    
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/portfolio-analyze/${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: submitUrl })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to analyze portfolio.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-zinc-900 dark:text-zinc-100 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-[11px] uppercase tracking-wider mb-1">
            <Link href="/student/ai-tools" className="hover:text-indigo-500 transition-colors">AI Tools</Link>
            <span>/</span>
            <span className="text-cyan-500">Portfolio Analyzer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-laptop-code text-zinc-900 dark:text-white"></i> Portfolio Analyzer
          </h1>
          <p className="text-sm text-zinc-500 mt-1">AI review of your personal website's UX, SEO, and structure.</p>
        </div>
      </header>

      {/* Input Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={analyzePortfolio} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">Portfolio URL</label>
            <input 
              type="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourname.com"
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={analyzing || !url.trim()}
            className="w-full md:w-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-globe"></i>}
            {analyzing ? "Scanning..." : "Scan Portfolio"}
          </button>
        </form>
        {error && <p className="text-sm text-rose-500 mt-3"><i className="fa-solid fa-circle-exclamation mr-1"></i> {error}</p>}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Score & Checklist */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-1">Portfolio Score</h3>
                <p className="text-xs text-zinc-400 truncate max-w-[200px]">{data.url}</p>
              </div>
              <div className={`text-4xl font-bold ${data.score >= 80 ? 'text-emerald-500' : data.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                {data.score}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Essential Elements Checklist</h3>
              <div className="space-y-3">
                {data.checklist.map((item: any, i: number) => {
                  let icon = "fa-solid fa-minus text-zinc-400";
                  let bg = "bg-zinc-50 dark:bg-zinc-800";
                  if (item.status === 'pass') { icon = "fa-solid fa-check text-emerald-500"; bg = "bg-emerald-50 dark:bg-emerald-950/20"; }
                  if (item.status === 'fail') { icon = "fa-solid fa-xmark text-rose-500"; bg = "bg-rose-50 dark:bg-rose-950/20"; }
                  if (item.status === 'warning') { icon = "fa-solid fa-exclamation text-amber-500"; bg = "bg-amber-50 dark:bg-amber-950/20"; }
                  
                  return (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border border-transparent ${bg} transition-colors`}>
                      <div className="w-5 flex justify-center shrink-0"><i className={icon}></i></div>
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{item.item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Metrics & Suggestions */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2">Category Ratings</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: "UI / UX Design", val: data.metrics.uiux },
                  { label: "Responsiveness", val: data.metrics.responsiveness },
                  { label: "Accessibility", val: data.metrics.accessibility },
                  { label: "Project Quality", val: data.metrics.projectQuality },
                  { label: "Performance", val: data.metrics.performance },
                  { label: "SEO Basics", val: data.metrics.seo }
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium text-zinc-600 dark:text-zinc-400">
                      <span>{m.label}</span>
                      <span>{m.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${m.val >= 80 ? 'bg-emerald-500' : m.val >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${m.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {data.metrics.missingSections?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-500 uppercase">Missing Sections Detected:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.metrics.missingSections.map((sec: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 text-xs font-medium rounded border border-rose-100 dark:border-rose-900">{sec}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 text-cyan-800 dark:text-cyan-300 flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles"></i> AI Improvement Suggestions
              </h3>
              <ul className="space-y-3">
                {data.suggestions.map((sug: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-cyan-900 dark:text-cyan-100/80 leading-relaxed">
                    <i className="fa-solid fa-arrow-right text-zinc-900 dark:text-white mt-1 shrink-0 text-xs"></i>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>
      ) : null}
    </div>
  );
}
