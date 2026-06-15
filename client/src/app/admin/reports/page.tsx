"use client";




interface Report {
  id: string;
  source: string;
  targetUser: string;
  reason: string;
  status: "Pending" | "Resolved";
  severity: "High" | "Medium" | "Low";
  date: string;
}



import { useState, useEffect } from "react";

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/api/admin/reports`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setReports(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch reports", err);
      }
    };
    fetchReports();
  }, []);

  const handleResolve = (id: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        alert(`Report ${r.id} marked as Resolved.`);
        return { ...r, status: "Resolved" };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Security & Reports Desk</h1>
        <p className="text-zinc-555 dark:text-zinc-400 mt-1">Review flagged profile queries, coordinate tokens anomaly monitors, and audit platform compliance.</p>
      </header>

      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className={`glass-panel p-6 rounded-3xl border relative overflow-hidden transition-all duration-350 ${
              rep.status === "Resolved"
                ? "border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/10 dark:bg-zinc-950/10 opacity-75"
                : rep.severity === "High"
                  ? "border-rose-550/30 bg-rose-500/5 hover:border-rose-550/40"
                  : "border-amber-550/30 bg-amber-500/5 hover:border-amber-550/40"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    rep.severity === "High"
                      ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                      : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                  }`}>
                    {rep.severity} Severity
                  </span>
                  <span className="text-[10px] text-zinc-450 font-bold uppercase">{rep.date}</span>
                </div>
                
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">
                  Flagged Target: <span className="underline">{rep.targetUser}</span>
                </h3>
                
                <p className="text-xs text-zinc-555 dark:text-zinc-400 leading-relaxed font-semibold">
                  Reason: {rep.reason}
                </p>
                
                <p className="text-[10px] text-zinc-450 font-bold">
                  Reporter Node: {rep.source}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {rep.status === "Pending" ? (
                  <button
                    onClick={() => handleResolve(rep.id)}
                    className="px-4 py-2 bg-gradient-to-tr from-rose-500 to-red-600 hover:from-rose-650 hover:to-red-705 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-[0_4px_12px_rgba(244,63,94,0.2)] transition-all cursor-pointer border border-white/10"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-xs text-emerald-500 font-extrabold flex items-center gap-1">
                    <i className="fa-regular fa-circle-check w-4.5 h-4.5" ></i> Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="glass-panel p-10 rounded-3xl text-center border border-zinc-200/50 dark:border-zinc-800/40">
            <i className="fa-solid fa-shield-halved text-4xl text-zinc-300 dark:text-zinc-700 mb-4"></i>
            <p className="text-zinc-500 font-bold">No security reports or flags found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
