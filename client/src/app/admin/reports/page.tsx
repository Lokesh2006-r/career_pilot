"use client";

import { useState } from "react";


interface Report {
  id: string;
  source: string;
  targetUser: string;
  reason: string;
  status: "Pending" | "Resolved";
  severity: "High" | "Medium" | "Low";
  date: string;
}

const INITIAL_REPORTS: Report[] = [
  { id: "rep-01", source: "System Monitor", targetUser: "Bruce Wayne", reason: "Multiple concurrent token authentication requests from distant coordinates.", severity: "High", status: "Pending", date: "2026-05-20" },
  { id: "rep-02", source: "Alex Johnson (Student)", targetUser: "Stark Industries (Recruiter)", reason: "Suspicious API chat queries targeting internal personal details.", severity: "Medium", status: "Pending", date: "2026-05-21" },
  { id: "rep-03", source: "Firebase Guard", targetUser: "Marcus Aurelius", reason: "Unauthorized attempt to access Admin path scopes.", severity: "High", status: "Resolved", date: "2026-05-18" }
];

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);

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
      </div>
    </div>
  );
}
