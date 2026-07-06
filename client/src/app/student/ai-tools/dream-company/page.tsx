"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

const COMPANIES = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber", "Airbnb", "Stripe", "Zoho", "TCS", "Infosys", "Accenture", "Wipro"];

export default function DreamCompanyRoadmap() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");

  useEffect(() => {
    if (user) fetchCachedData();
  }, [user]);

  const fetchCachedData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/cached/${user?.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.dreamCompanyRoadmaps?.length > 0) {
          // Show the most recent one
          setData(json.data.dreamCompanyRoadmaps[json.data.dreamCompanyRoadmaps.length - 1]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    const company = selectedCompany === "Custom" ? customCompany : selectedCompany;
    if (!user || !company) return;
    
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/dream-company/${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company })
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
            <span className="text-indigo-500">Dream Company</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-map-location-dot text-zinc-900 dark:text-white"></i> Dream Company Roadmap
          </h1>
          <p className="text-sm text-zinc-500 mt-1">AI-generated preparation strategy for your target employer.</p>
        </div>
      </header>

      {/* Generator Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <form onSubmit={generateRoadmap} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">Select Target Company</label>
            <select 
              value={selectedCompany} 
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="" disabled>Choose a company...</option>
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Custom">Other (Custom input)</option>
            </select>
          </div>
          {selectedCompany === "Custom" && (
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">Company Name</label>
              <input 
                type="text" 
                value={customCompany} 
                onChange={(e) => setCustomCompany(e.target.value)}
                placeholder="e.g. OpenAI, Palantir..."
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}
          <button 
            type="submit"
            disabled={generating || (!selectedCompany) || (selectedCompany === "Custom" && !customCompany)}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            {generating ? "Generating..." : "Generate Roadmap"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-indigo-900 dark:text-indigo-300">Target: {data.company}</h2>
              <p className="text-sm text-indigo-700 dark:text-indigo-400/80 mt-1"><i className="fa-regular fa-clock mr-1"></i> {data.roadmap.timeline}</p>
            </div>
            <div className="text-xs text-indigo-500/60 font-mono">
              Generated: {new Date(data.generatedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <i className="fa-solid fa-code text-zinc-900 dark:text-white"></i> Technical Skills Needed
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.roadmap.technicalSkills.map((skill: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded border border-zinc-200 dark:border-zinc-700">{skill}</span>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <i className="fa-solid fa-certificate text-zinc-900 dark:text-white"></i> Recommended Certifications
              </h3>
              <ul className="space-y-2">
                {data.roadmap.certifications.map((cert: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                    <i className="fa-solid fa-check text-zinc-900 dark:text-white mt-0.5"></i> {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-diagram-project text-zinc-900 dark:text-white"></i> Portfolio Projects to Build
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.roadmap.recommendedProjects.map((proj: string, i: number) => (
                <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{proj}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <i className="fa-solid fa-network-wired text-zinc-900 dark:text-white"></i> DSA & System Design
              </h3>
              <ul className="space-y-3">
                {data.roadmap.dsaRoadmap.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex gap-3">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">{i+1}</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                <i className="fa-regular fa-comments text-zinc-900 dark:text-white"></i> Interview Prep
              </h3>
              <ul className="space-y-3">
                {data.roadmap.interviewPrep.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                    <i className="fa-solid fa-caret-right text-zinc-900 dark:text-white mt-1"></i> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Plan Timeline */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <i className="fa-solid fa-shoe-prints text-zinc-900 dark:text-white"></i> Execution Timeline
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
              {data.roadmap.actionPlan.map((step: string, i: number) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white dark:border-zinc-900 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-sm">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
