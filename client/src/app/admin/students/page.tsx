"use client";




interface StudentAccount {
  id: string;
  name: string;
  email: string;
  atsScore: number;
  status: "Active" | "Suspended";
  joinedDate: string;
}



import { useState, useEffect } from "react";

export default function AdminStudents() {
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/api/admin/students`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setStudents(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };
    fetchStudents();
  }, []);

  const handleToggleStatus = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === "Active" ? "Suspended" : "Active";
        alert(`Student account ${s.name} is now ${newStatus}`);
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete student account ${name}?`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Accounts Directory</h1>
        <p className="text-zinc-555 dark:text-zinc-400 mt-1">Audit student profiles, suspend accounts violating terms, or inspect system properties.</p>
      </header>

      {/* Search Filter */}
      <div className="relative w-full max-w-md">
        <i className="fa-solid fa-magnifying-glass w-5 h-5 text-zinc-450 absolute left-4 top-1/2 transform -translate-y-1/2" ></i>
        <input
          type="text"
          placeholder="Filter students by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/40 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-550 transition-all backdrop-blur-md"
        />
      </div>

      {/* Students list */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-zinc-200/50 dark:border-zinc-800/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-zinc-650 dark:text-zinc-350">
            <thead>
              <tr className="border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-450 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-5">Student Identity</th>
                <th className="p-5">Joined Date</th>
                <th className="p-5">ATS Index</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/30 dark:divide-zinc-800/20">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-extrabold text-xs">
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-extrabold text-zinc-900 dark:text-white">{s.name}</p>
                        <p className="text-[10px] text-zinc-450 mt-0.5">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-zinc-500">{s.joinedDate}</td>
                  <td className="p-5 font-bold text-zinc-900 dark:text-white">{s.atsScore}%</td>
                  <td className="p-5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      s.status === "Active"
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                        : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(s.id)}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer ${
                        s.status === "Active"
                          ? "bg-amber-500/10 hover:bg-amber-500/15 border-amber-550/20 text-amber-500"
                          : "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-550/20 text-emerald-500"
                      }`}
                    >
                      {s.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleRemove(s.id, s.name)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-550/30 text-rose-500 rounded-lg transition-all cursor-pointer"
                      title="Delete student record"
                    >
                      <i className="fa-solid fa-trash-can w-4 h-4" ></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-zinc-400 font-medium leading-relaxed">
                    No matching student profiles found.
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
