"use client";

import { useState } from "react";


interface RecruiterAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  activeOpenings: number;
  status: "Active" | "Suspended";
  joinedDate: string;
  avatar?: string;
}

const INITIAL_RECRUITERS: RecruiterAccount[] = [
  { id: "rec-01", name: "Sarah Connor", email: "sconnor@cyberdyne.com", company: "Cyberdyne Systems", activeOpenings: 3, status: "Active", joinedDate: "2026-05-01" },
  { id: "rec-02", name: "Peter Parker", email: "pparker@dailybugle.com", company: "Daily Bugle", activeOpenings: 1, status: "Active", joinedDate: "2026-05-03" },
  { id: "rec-03", name: "Bruce Wayne", email: "bwayne@waynecorp.com", company: "Wayne Enterprises", activeOpenings: 8, status: "Suspended", joinedDate: "2026-05-05" },
  { id: "rec-04", name: "Tony Stark", email: "tstark@starkindustries.com", company: "Stark Industries", activeOpenings: 5, status: "Active", joinedDate: "2026-05-10" }
];

export default function AdminRecruiters() {
  const [recruiters, setRecruiters] = useState<RecruiterAccount[]>(INITIAL_RECRUITERS);
  const [search, setSearch] = useState("");

  const handleToggleStatus = (id: string) => {
    setRecruiters(prev => prev.map(r => {
      if (r.id === id) {
        const newStatus = r.status === "Active" ? "Suspended" : "Active";
        alert(`Recruiter account for ${r.name} is now ${newStatus}`);
        return { ...r, status: newStatus };
      }
      return r;
    }));
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete recruiter account ${name}?`)) {
      setRecruiters(prev => prev.filter(r => r.id !== id));
    }
  };

  const filtered = recruiters.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Recruiters Directory</h1>
        <p className="text-zinc-555 dark:text-zinc-400 mt-1">Audit recruiter organizational profiles, control access permission sets, or suspend violators.</p>
      </header>

      {/* Search Filter */}
      <div className="relative w-full max-w-md">
        <i className="fa-solid fa-magnifying-glass w-5 h-5 text-zinc-450 absolute left-4 top-1/2 transform -translate-y-1/2" ></i>
        <input
          type="text"
          placeholder="Filter recruiters by name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/40 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-550 transition-all backdrop-blur-md"
        />
      </div>

      {/* Recruiters table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-zinc-200/50 dark:border-zinc-800/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-650 dark:text-zinc-355">
            <thead>
              <tr className="border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-455 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-5">Hiring Representative</th>
                <th className="p-5">Affiliated Firm</th>
                <th className="p-5">Active Postings</th>
                <th className="p-5">Account Status</th>
                <th className="p-5 text-right">Actions Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/30 dark:divide-zinc-800/20">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-550 font-extrabold text-xs">
                        {r.avatar || r.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-extrabold text-zinc-900 dark:text-white">{r.name}</p>
                        <p className="text-[10px] text-zinc-450 mt-0.5">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-zinc-850 dark:text-zinc-205">{r.company}</td>
                  <td className="p-5 font-bold text-zinc-900 dark:text-white">{r.activeOpenings} roles</td>
                  <td className="p-5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      r.status === "Active"
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(r.id)}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer ${
                        r.status === "Active"
                          ? "bg-amber-500/10 hover:bg-amber-500/15 border-amber-550/20 text-amber-500"
                          : "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-550/20 text-emerald-500"
                      }`}
                    >
                      {r.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleRemove(r.id, r.name)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-550/30 text-rose-500 rounded-lg transition-all cursor-pointer"
                      title="Delete recruiter account"
                    >
                      <i className="fa-solid fa-trash-can w-4 h-4" ></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-zinc-400 font-medium leading-relaxed">
                    No matching recruiter accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
