"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function WeeklyReport() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/weekly-reports/${user?.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          const sorted = [...json.data].sort((a, b) => new Date(b.weekEnd).getTime() - new Date(a.weekEnd).getTime());
          setReports(sorted);
          setSelectedReport(sorted[0]); // Select latest by default
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/weekly-report/${user.uid}`, {
        method: "POST"
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setReports(prev => [json.data, ...prev]);
          setSelectedReport(json.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-zinc-900 dark:text-zinc-100 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-[11px] uppercase tracking-wider mb-1">
            <Link href="/student/ai-tools" className="hover:text-indigo-500 transition-colors">AI Tools</Link>
            <span>/</span>
            <span className="text-purple-500">Weekly Report</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-calendar-check text-zinc-900 dark:text-white"></i> Weekly Career Report
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Auto-generated summary of your progress and tasks.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateReport}
            disabled={generating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
            {generating ? "Generating..." : "Generate This Week's Report"}
          </button>
          {selectedReport && (
            <button 
              onClick={printReport}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-print"></i> Print / PDF
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <i className="fa-solid fa-calendar-xmark text-4xl text-zinc-300 dark:text-zinc-600 mb-4"></i>
          <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">Click the button above to generate your first AI weekly progress report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* History Sidebar - Hidden on print */}
          <div className="md:col-span-3 flex flex-col gap-4 print:hidden">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Report History</h3>
            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {reports.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedReport(r)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    selectedReport === r 
                      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 shadow-sm' 
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <p className={`text-sm font-bold ${selectedReport === r ? 'text-purple-700 dark:text-purple-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    Week of {new Date(r.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">To {new Date(r.weekEnd).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Report Content - This is what prints */}
          {selectedReport && (
            <div className="md:col-span-9 print:col-span-12">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm print:shadow-none print:border-none print:p-0">
                
                {/* Print Header */}
                <div className="hidden print:block mb-8 border-b-2 border-zinc-200 pb-4">
                  <h1 className="text-2xl font-bold">CareerPilot Weekly AI Report</h1>
                  <p className="text-zinc-500">Student: {user?.displayName || 'User'} | Week: {selectedReport.weekStart} to {selectedReport.weekEnd}</p>
                </div>

                <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800 print:hidden">
                  <h2 className="text-xl font-bold">Weekly Report</h2>
                  <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {selectedReport.weekStart} — {selectedReport.weekEnd}
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <i className="fa-solid fa-bolt"></i> Executive Summary
                  </h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-purple-50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    {selectedReport.summary}
                  </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><i className="fa-solid fa-file-lines text-zinc-400"></i> Resume Updates</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedReport.resumeImprovements}</p>
                  </div>
                  
                  <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><i className="fa-solid fa-code text-zinc-400"></i> Coding Progress</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedReport.codingActivity}</p>
                  </div>
                  
                  <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><i className="fa-solid fa-microphone text-zinc-400"></i> Interview Performance</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedReport.interviewPerformance}</p>
                  </div>
                  
                  <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><i className="fa-solid fa-laptop-code text-zinc-400"></i> Project Updates</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedReport.projectProgress}</p>
                  </div>
                </div>

                {/* Recommended Tasks */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                    <i className="fa-solid fa-list-check"></i> Recommended Focus For Next Week
                  </h3>
                  <ul className="space-y-3">
                    {selectedReport.recommendedTasks.map((task: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <div className="w-5 h-5 rounded flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 mt-0.5 shrink-0"></div>
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
