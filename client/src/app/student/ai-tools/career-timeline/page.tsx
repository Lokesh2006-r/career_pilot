"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function CareerTimeline() {
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
        if (json.success && json.data?.careerTimeline) {
          setData(json.data.careerTimeline);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeline = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/career-timeline/${user.uid}`, {
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

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'skill': return { icon: 'fa-star', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' };
      case 'certification': return { icon: 'fa-certificate', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' };
      case 'coding': return { icon: 'fa-code', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' };
      case 'project': return { icon: 'fa-rocket', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' };
      case 'internship': return { icon: 'fa-briefcase', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' };
      case 'resume': return { icon: 'fa-file-lines', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' };
      case 'interview': return { icon: 'fa-microphone', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400' };
      case 'placement': return { icon: 'fa-trophy', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' };
      default: return { icon: 'fa-circle', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' };
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-zinc-900 dark:text-zinc-100 max-w-4xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-[11px] uppercase tracking-wider mb-1">
            <Link href="/student/ai-tools" className="hover:text-indigo-500 transition-colors">AI Tools</Link>
            <span>/</span>
            <span className="text-orange-500">Career Timeline</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-timeline text-zinc-900 dark:text-white"></i> Career Timeline
          </h1>
          <p className="text-sm text-zinc-500 mt-1">A visual history of your milestones, projects, and achievements.</p>
        </div>
        <button 
          onClick={generateTimeline}
          disabled={generating}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rotate-right"></i>}
          {generating ? "Mapping Timeline..." : data ? "Refresh Timeline" : "Generate Timeline"}
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <i className="fa-solid fa-timeline text-4xl text-zinc-300 dark:text-zinc-600 mb-4"></i>
          <h3 className="text-lg font-semibold mb-2">No Timeline Generated</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">Click generate to let AI construct a historical timeline based on your profile data.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 md:ml-6 mt-6 pb-6">
          {data.events.map((event: any, i: number) => {
            const style = getEventIcon(event.type);
            return (
              <div key={i} className="mb-10 ml-8 relative group">
                <span className={`absolute -left-12 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 ${style.color}`}>
                  <i className={`fa-solid ${style.icon} text-xs`}></i>
                </span>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-bold text-orange-500 tracking-wider uppercase mb-1 block">
                    {event.date}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">{event.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
