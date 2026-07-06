"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Data Scientist",
  "Cloud Engineer",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "Product Manager"
];

export default function SkillGapAnalyzer() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchCachedData();
  }, [user]);

  const fetchCachedData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/cached/${user?.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.skillGapAnalysis) {
          setData(json.data.skillGapAnalysis);
          setRole(json.data.skillGapAnalysis.targetRole);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeGap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/skill-gap/${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: role })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to analyze skill gap.");
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
            <span className="text-amber-500">Skill Gap Analyzer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-zinc-900 dark:text-white"></i> Skill Gap Analyzer
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Compare your current skillset with industry demands for your target role.</p>
        </div>
      </header>

      {/* Input Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={analyzeGap} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">Target Job Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="" disabled>Select a role...</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button 
            type="submit"
            disabled={analyzing || !role}
            className="w-full md:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magnifying-glass-chart"></i>}
            {analyzing ? "Analyzing..." : "Analyze Gap"}
          </button>
        </form>
        {error && <p className="text-sm text-rose-500 mt-3"><i className="fa-solid fa-circle-exclamation mr-1"></i> {error}</p>}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Achieved Skills */}
            <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i> Skills Match (Achieved)
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.achievedSkills.length > 0 ? data.achievedSkills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-md border border-emerald-100 dark:border-emerald-800/50">
                    {skill}
                  </span>
                )) : (
                  <p className="text-sm text-zinc-500">No matching skills found on your resume.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-circle-xmark"></i> Skill Gap (Missing)
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.missingSkills.length > 0 ? data.missingSkills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-medium rounded-md border border-rose-100 dark:border-rose-800/50">
                    {skill}
                  </span>
                )) : (
                  <p className="text-sm text-zinc-500">You have all the core skills required! Great job.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <i className="fa-solid fa-route text-zinc-900 dark:text-white"></i> Learning Roadmap
              </h3>
              <div className="space-y-4">
                {data.learningRoadmap.map((item: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs">{i+1}</span>
                        {item.skill}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1 ml-7"><i className="fa-solid fa-book-open mr-1"></i> {item.resource}</p>
                    </div>
                    <div className="ml-7 sm:ml-0 px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap shadow-sm">
                      <i className="fa-regular fa-clock mr-1 text-zinc-900 dark:text-white"></i> {item.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-arrow-up-right-dots"></i> Priority Order
                </h3>
                <ol className="space-y-2 list-decimal list-inside text-sm text-amber-900 dark:text-amber-100/80 font-medium">
                  {data.priorityOrder.map((skill: string, i: number) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ol>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                  <i className="fa-solid fa-certificate text-zinc-400"></i> Certifications to Consider
                </h3>
                <ul className="space-y-3">
                  {data.certifications.map((cert: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <i className="fa-solid fa-award text-zinc-900 dark:text-white mt-0.5 shrink-0"></i>
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      ) : null}
    </div>
  );
}
