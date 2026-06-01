"use client";

import { Briefcase, Building, MapPin, DollarSign, BrainCircuit, Star, StarOff, Search, Filter, CheckCircle2, Loader2, Sparkles, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function InternshipMatcher() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [minMatchScore, setMinMatchScore] = useState(0);
  
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // ... (keeping initialJobs unchanged)
  const initialJobs = [
    {
      id: "google-swe",
      company: "Google",
      role: "Software Engineering Intern",
      location: "Bangalore, India",
      stipend: "$1.5k - $2.0k / mo",
      matchScore: 98,
      tags: ["React", "TypeScript", "Node.js"],
      logo: "from-blue-500 via-indigo-600 to-indigo-700",
      description: "Join the Google Cloud team to construct scalable high-end frontend microservices, components, and fluid visual systems.",
      isHot: true
    },
    {
      id: "microsoft-frontend",
      company: "Microsoft",
      role: "Frontend Developer Intern",
      location: "Hyderabad, India",
      stipend: "$1.2k - $1.8k / mo",
      matchScore: 92,
      tags: ["React", "Redux", "Tailwind CSS"],
      logo: "from-emerald-500 to-teal-600",
      description: "Work with the Office 365 core layout team to craft accessible, highly responsive, and beautiful dashboard layouts.",
      isHot: false
    },
    {
      id: "amazon-sde",
      company: "Amazon",
      role: "SDE Intern",
      location: "Remote",
      stipend: "$1.4k - $1.9k / mo",
      matchScore: 85,
      tags: ["Java", "AWS", "System Design"],
      logo: "from-orange-500 to-amber-600",
      description: "Design and implement robust microservice APIs, message streams, and database configurations for Prime Video infrastructure.",
      isHot: false
    },
    {
      id: "stripe-fullstack",
      company: "Stripe",
      role: "Fullstack Intern",
      location: "Remote",
      stipend: "$2.0k - $3.0k / mo",
      matchScore: 78,
      tags: ["React", "Ruby on Rails", "PostgreSQL"],
      logo: "from-indigo-500 to-purple-600",
      description: "Scale payment gateways, subscription pipelines, and financial ledger databases for global internet merchants.",
      isHot: true
    }
  ];

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`applied_internships_${user.uid}`);
    if (saved) {
      try {
        setAppliedJobs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  const handleApply = (id: string) => {
    setApplyingJobId(id);
    setTimeout(() => {
      const updated = { ...appliedJobs, [id]: true };
      setAppliedJobs(updated);
      if (user) {
        localStorage.setItem(`applied_internships_${user.uid}`, JSON.stringify(updated));
      }
      setApplyingJobId(null);
    }, 1200);
  };

  const filteredJobs = initialJobs.filter(job => {
    const matchesSearch = 
      job.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = 
      selectedLocation === "All Locations" || 
      (selectedLocation === "Remote" && job.location.toLowerCase() === "remote") ||
      (selectedLocation === "Bangalore" && job.location.toLowerCase().includes("bangalore")) ||
      (selectedLocation === "Hyderabad" && job.location.toLowerCase().includes("hyderabad"));

    const matchesScore = job.matchScore >= minMatchScore;

    return matchesSearch && matchesLocation && matchesScore;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Smart Matches</h1>
        <p className="text-zinc-555 dark:text-zinc-400 mt-1 font-medium">
          Precision internship alignment vectors compiled by analyzing your technical credentials.
        </p>
      </header>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Query role index, companies, or stacks..." 
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-semibold placeholder-zinc-450 shadow-sm"
          />
        </div>

        {/* Location Dropdown */}
        <div className="w-full md:w-auto relative shrink-0">
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full md:w-auto pl-4 pr-10 py-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none shadow-sm"
          >
            <option>All Locations</option>
            <option>Remote</option>
            <option>Bangalore</option>
            <option>Hyderabad</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</span>
        </div>

        {/* Match Index Dropdown */}
        <div className="w-full md:w-auto relative shrink-0">
          <select 
            value={minMatchScore} 
            onChange={(e) => setMinMatchScore(Number(e.target.value))}
            className="w-full md:w-auto pl-4 pr-10 py-3.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none shadow-sm"
          >
            <option value={0}>Any Match Score</option>
            <option value={80}>80%+ Match</option>
            <option value={90}>90%+ Match</option>
            <option value={95}>95%+ Match</option>
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Jobs Feed */}
        <div className="lg:col-span-3 space-y-5">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="glass-panel rounded-3xl p-6 relative overflow-hidden group/card hover:border-indigo-500/25 shadow-sm"
              >
                {job.isHot && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-extrabold uppercase rounded-lg tracking-wider">
                    <Star className="w-3 h-3 fill-orange-500" />
                    Hot Candidate Role
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex-shrink-0 bg-gradient-to-tr ${job.logo} text-white flex items-center justify-center font-black text-lg shadow-sm`}>
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold group-hover/card:text-indigo-500 dark:group-hover/card:text-indigo-400 transition-colors leading-tight">{job.role}</h2>
                    <div className="flex items-center gap-2 text-zinc-550 text-xs mt-1.5 font-semibold">
                      <span className="text-zinc-950 dark:text-white">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-450" /> {job.location}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-555 dark:text-zinc-400 leading-relaxed mb-6 font-semibold">{job.description}</p>

                <div className="flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-800/40 pt-4 mt-auto">
                  <div className="flex flex-wrap gap-1.5">
                    {job.tags.map((tag: string, i: number) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 bg-zinc-150 dark:bg-zinc-800/60 border border-zinc-200/20 dark:border-zinc-800/20 text-[10px] font-extrabold uppercase rounded-lg text-zinc-500 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-emerald-500 dark:text-emerald-400 tracking-wide">{job.matchScore}% Matching Index</span>
                      <span className="text-[10px] text-zinc-450 font-bold flex items-center gap-0.5 mt-0.5"><DollarSign className="w-3 h-3" />{job.stipend}</span>
                    </div>

                    {appliedJobs[job.id] ? (
                      <button 
                        disabled
                        className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold border border-emerald-500/20 disabled:opacity-90 shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Applied
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleApply(job.id)}
                        disabled={applyingJobId === job.id}
                        className="px-4.5 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 border border-transparent dark:border-white/10"
                      >
                        {applyingJobId === job.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {applyingJobId === job.id ? "Applying..." : "Apply Now"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel rounded-3xl p-16 text-center text-zinc-550 border border-zinc-200/50 dark:border-zinc-800/40">
              No matching jobs found matching indices. Adjust query search filters.
            </div>
          )}
        </div>

        {/* Why these matches Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
            
            <h3 className="font-extrabold flex items-center gap-2 mb-4 text-zinc-955 dark:text-white text-sm">
              <BrainCircuit className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
              AI Alignment Rationale
            </h3>
            
            <p className="text-xs text-zinc-550 dark:text-zinc-350 leading-relaxed mb-5 font-semibold">
              Your AI Twin parsed your recent <strong>React</strong> repositories and top rating in <strong>Two Pointers</strong> to surface these specific frontend and fullstack roles.
            </p>
            
            <div className="space-y-3.5 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-4">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">High Priority Missing Stacks</h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-zinc-200/40 dark:bg-zinc-800/50 border border-zinc-300/10 dark:border-zinc-800/20 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400">GraphQL</span>
                <span className="px-2.5 py-1 bg-zinc-200/40 dark:bg-zinc-800/50 border border-zinc-300/10 dark:border-zinc-800/20 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Docker</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
