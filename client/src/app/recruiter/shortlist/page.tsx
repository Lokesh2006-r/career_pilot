"use client";

import { useState, useEffect } from "react";
import { UserCheck, Star, Trash2, Mail, ExternalLink, Calendar, Code, Target } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ... (keeping Candidate interface and MOCK_CANDIDATES array unchanged)
interface Candidate {
  id: string;
  name: string;
  roleTarget: string;
  atsScore: number;
  leetcodeSolved: number;
  skills: string[];
  avatar: string;
  email: string;
  education: string;
}

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "stud-1",
    name: "Alex Johnson",
    roleTarget: "Full Stack Engineer",
    atsScore: 88,
    leetcodeSolved: 144,
    skills: ["React", "Next.js", "Node.js", "TypeScript", "Python"],
    avatar: "AJ",
    email: "alex.johnson@university.edu",
    education: "B.S. Computer Science, Stanford University"
  },
  {
    id: "stud-2",
    name: "Sarah Chen",
    roleTarget: "AI Research Engineer",
    atsScore: 94,
    leetcodeSolved: 210,
    skills: ["Python", "PyTorch", "LangChain", "Pinecone", "RAG Systems"],
    avatar: "SC",
    email: "schen@mit.edu",
    education: "M.S. Artificial Intelligence, MIT"
  }
];

export default function RecruiterShortlist() {
  const { user } = useAuth();
  const [shortlisted, setShortlisted] = useState<Candidate[]>([]);

  useEffect(() => {
    if (!user) return;
    const key = `shortlisted_candidates_${user.uid}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const ids: string[] = JSON.parse(saved);
        const list = MOCK_CANDIDATES.filter(c => ids.includes(c.id));
        setShortlisted(list);
      } catch (e) {
        setShortlisted(MOCK_CANDIDATES);
      }
    } else {
      setShortlisted(MOCK_CANDIDATES);
      localStorage.setItem(key, JSON.stringify(MOCK_CANDIDATES.map(c => c.id)));
    }
  }, [user]);

  const handleRemove = (id: string) => {
    if (!user) return;
    const updated = shortlisted.filter(c => c.id !== id);
    setShortlisted(updated);
    const key = `shortlisted_candidates_${user.uid}`;
    localStorage.setItem(key, JSON.stringify(updated.map(c => c.id)));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Shortlisted Candidates</h1>
        <p className="text-zinc-550 dark:text-zinc-400 mt-1">Review your pipelines, invite shortlisted candidates to live calls, or copy profiles.</p>
      </header>

      {shortlisted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortlisted.map((cand) => (
            <div 
              key={cand.id} 
              className="glass-panel p-6 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/20 dark:bg-zinc-950/20 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>

              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-650 flex items-center justify-center font-bold text-white text-base shadow-[0_4px_15px_rgba(168,85,247,0.2)] border border-white/10">
                      {cand.avatar}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white leading-tight">{cand.name}</h3>
                      <p className="text-xs text-zinc-450 font-bold uppercase tracking-wider mt-0.5">{cand.roleTarget}</p>
                    </div>
                  </div>

                  <span className="text-xs text-emerald-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <Star className="w-4 h-4 fill-emerald-500" /> Top Selection
                  </span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-zinc-550 dark:text-zinc-400 border-t border-b border-zinc-200/40 dark:border-zinc-800/30 py-3 my-4">
                  <div className="flex justify-between">
                    <span>Academics:</span>
                    <span className="text-zinc-850 dark:text-zinc-205">{cand.education}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <span className="text-zinc-850 dark:text-zinc-205">{cand.email}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {cand.skills.map((s, idx) => (
                    <span key={idx} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40">
                <button
                  onClick={() => handleRemove(cand.id)}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-500 rounded-xl transition-all cursor-pointer"
                  title="Remove from shortlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <a
                  href={`mailto:${cand.email}?subject=Interview Invitation - AI Twin`}
                  className="flex-1 py-2.5 bg-gradient-to-tr from-purple-500 to-indigo-650 hover:from-purple-650 hover:to-indigo-750 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_4px_12px_rgba(168,85,247,0.2)] transition-all cursor-pointer border border-white/10"
                >
                  <Mail className="w-4 h-4" />
                  Invite to Interview
                </a>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl text-center border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center">
          <UserCheck className="w-12 h-12 text-zinc-400 mb-4" />
          <h3 className="font-extrabold text-zinc-900 dark:text-white mb-2">No Candidates Shortlisted</h3>
          <p className="text-sm text-zinc-550 dark:text-zinc-450">Browse candidates from the Talent Search portal and hit 'Shortlist' to track them here.</p>
        </div>
      )}
    </div>
  );
}
