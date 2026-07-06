"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function ProjectAnalyzer() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchCachedData();
  }, [user]);

  const fetchCachedData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/cached/${user?.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.projectAnalyses) {
          setHistory(json.data.projectAnalyses.reverse());
          if (json.data.projectAnalyses.length > 0) {
            setData(json.data.projectAnalyses[0]); // Show latest
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !repoUrl.trim()) return;
    
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/project-analyze/${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim() })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
        setHistory(prev => [json.data, ...prev]);
        setRepoUrl(""); // Clear input on success
      } else {
        setError(json.error || "Failed to analyze repository.");
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
            <span className="text-blue-500">Project Quality Analyzer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-code-branch text-zinc-900 dark:text-white"></i> Project Analyzer
          </h1>
          <p className="text-sm text-zinc-500 mt-1">AI review of your repository structure, code organization, and documentation.</p>
        </div>
      </header>

      {/* Input Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={analyzeProject} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">GitHub Repository URL</label>
            <div className="relative">
              <i className="fa-brands fa-github absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
              <input 
                type="url" 
                value={repoUrl} 
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={analyzing || !repoUrl.trim()}
            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-vial"></i>}
            {analyzing ? "Analyzing..." : "Analyze Project"}
          </button>
        </form>
        {error && <p className="text-sm text-rose-500 mt-3"><i className="fa-solid fa-circle-exclamation mr-1"></i> {error}</p>}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* History Sidebar */}
          {history.length > 1 && (
            <div className="md:col-span-3 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-1">Analyzed Projects</h3>
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setData(h)}
                  className={`text-left p-3 rounded-xl border text-sm transition-colors ${
                    data.repoName === h.repoName 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                      : 'bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800'
                  }`}
                >
                  <p className={`font-semibold truncate ${data.repoName === h.repoName ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                    {h.repoName}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Score: {h.score}/100</p>
                </button>
              ))}
            </div>
          )}

          {/* Main Content */}
          <div className={history.length > 1 ? "md:col-span-9 space-y-6" : "md:col-span-12 space-y-6"}>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <i className="fa-brands fa-github text-zinc-400"></i> {data.repoName}
                </h2>
                <a href={data.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                  View Repository <i className="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                </a>
              </div>
              <div className={`text-4xl font-bold ${data.score >= 80 ? 'text-emerald-500' : data.score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                {data.score}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Folder Structure", val: data.metrics.folderStructure, icon: "fa-folder-tree" },
                { label: "Code Organization", val: data.metrics.codeOrganization, icon: "fa-layer-group" },
                { label: "Documentation", val: data.metrics.documentation, icon: "fa-book" },
                { label: "Innovation", val: data.metrics.innovation, icon: "fa-lightbulb" },
                { label: "Scalability", val: data.metrics.scalability, icon: "fa-up-right-and-down-left-from-center" },
                { label: "Deployment Ready", val: data.metrics.deploymentReadiness, icon: "fa-rocket" }
              ].map((m, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase flex items-center gap-2">
                      <i className={`fa-solid ${m.icon} w-4`}></i> {m.label}
                    </span>
                    <span className="text-sm font-bold">{m.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${m.val >= 80 ? 'bg-emerald-500' : m.val >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${m.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <i className="fa-solid fa-align-left text-zinc-900 dark:text-white"></i> AI Code Review
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
                <p className="whitespace-pre-line leading-relaxed">{data.feedback}</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-wrench"></i> Areas for Refactoring
              </h3>
              <ul className="space-y-3">
                {data.suggestions.map((sug: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-blue-900 dark:text-blue-100/80 leading-relaxed">
                    <i className="fa-solid fa-check text-zinc-900 dark:text-white mt-1 shrink-0"></i>
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
