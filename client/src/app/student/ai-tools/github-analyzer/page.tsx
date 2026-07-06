"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function GitHubAnalyzer() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchCachedData();
  }, [user]);

  const fetchCachedData = async () => {
    try {
      const profileRes = await fetch(`${API_BASE_URL}/api/student/profile/${user?.uid}`);
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        if (profileJson.success && profileJson.data?.github) {
          // Extract username from URL if necessary
          let un = profileJson.data.github;
          if (un.includes('github.com/')) {
            un = un.split('github.com/')[1].replace('/', '');
          }
          setUsername(un);
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/ai-tools/cached/${user?.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.githubAnalysis) {
          setData(json.data.githubAnalysis);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username.trim()) return;
    
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/github-analyze/${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to analyze profile.");
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
            <span className="text-zinc-700 dark:text-zinc-300">GitHub Analyzer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-brands fa-github text-zinc-900 dark:text-white"></i> GitHub Analyzer
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Deep AI analysis of your repository quality and code habits.</p>
        </div>
      </header>

      {/* Input Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={analyzeProfile} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">GitHub Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">github.com/</span>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-24 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={analyzing || !username.trim()}
            className="w-full md:w-auto px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
            {analyzing ? "Analyzing..." : "Analyze Profile"}
          </button>
        </form>
        {error && <p className="text-sm text-rose-500 mt-3"><i className="fa-solid fa-circle-exclamation mr-1"></i> {error}</p>}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Score & Metrics */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm text-center">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Profile Score</h3>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-zinc-100 dark:border-zinc-800 relative mb-2">
                <span className="text-4xl font-bold">{data.score}</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Analyzed for {data.username}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Key Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: "Repository Quality", val: data.metrics.repositoryQuality },
                  { label: "README Quality", val: data.metrics.readmeQuality },
                  { label: "Commit Consistency", val: data.metrics.commitConsistency },
                  { label: "Project Diversity", val: data.metrics.projectDiversity },
                  { label: "Open Source", val: data.metrics.openSourceContributions }
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1 font-medium text-zinc-600 dark:text-zinc-400">
                      <span>{m.label}</span>
                      <span>{m.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-800 dark:bg-zinc-300" style={{ width: `${m.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Top Languages</h3>
              <div className="space-y-3 flex flex-wrap gap-2">
                {data.languages.map((l: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700">
                    <span className="text-xs font-semibold">{l.name}</span>
                    <span className="text-[10px] text-zinc-500">{l.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Report & Suggestions */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-robot text-zinc-400"></i> AI Analysis Report
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
                <p className="whitespace-pre-line leading-relaxed">{data.report}</p>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-zinc-400"></i> Actionable Suggestions
              </h3>
              <ul className="space-y-3">
                {data.suggestions.map((sug: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <i className="fa-solid fa-chevron-right text-zinc-400 mt-1 shrink-0 text-xs"></i>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{sug}</span>
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
