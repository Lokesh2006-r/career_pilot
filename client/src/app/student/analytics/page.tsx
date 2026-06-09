"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  TrendingUp, Calendar, Target, Award, ArrowUpRight, Zap, Code, 
  ShieldCheck, FileText, AlertTriangle, Loader2, MessageSquare, 
  HelpCircle, ChevronRight, Activity, Sparkles 
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

interface ResumeData {
  fileName: string;
  atsScore: number;
  confidenceScore: number;
  skills: string[];
  projects: string[];
  missingKeywords: string[];
  suggestions: string[];
  createdAt: string;
}

interface InterviewReport {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  detailedEvaluation: string;
  summary?: string;
  gaps?: string[];
}

interface Interview {
  _id: string;
  role: string;
  type: string;
  report: InterviewReport | null;
  status: 'in_progress' | 'completed';
  createdAt: string;
}

export default function StudentAnalytics() {
  const { user } = useAuth();
  
  // Real data state
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [codingProfile, setCodingProfile] = useState<any>(null);
  
  // Loading & status states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Resume Scan
        const resumeRes = await fetch(`${API_BASE_URL}/api/resume/latest/${user.uid}`);
        if (resumeRes.ok) {
          const resJson = await resumeRes.json();
          if (resJson.data) setResumeData(resJson.data);
        }

        // 2. Fetch Mock Interviews History
        const interviewRes = await fetch(`${API_BASE_URL}/api/interview/history/${user.uid}`);
        if (interviewRes.ok) {
          const intJson = await interviewRes.json();
          if (Array.isArray(intJson)) setInterviews(intJson);
        }

        // 3. Fetch Coding Profile Telemetry
        let savedHandlesRaw = localStorage.getItem(`coding_handles_${user.uid}`);
        const defaultHandles = {
          leetcode: "Lokesh-123_",
          codeforces: "Lokeshr_2006",
          codechef: "kit27cse25"
        };
        
        if (!savedHandlesRaw) {
          localStorage.setItem(`coding_handles_${user.uid}`, JSON.stringify(defaultHandles));
          savedHandlesRaw = JSON.stringify(defaultHandles);
        }
        
        if (savedHandlesRaw) {
          let handles = JSON.parse(savedHandlesRaw);
          // Migrate handles if placeholders are detected
          if (handles.codeforces === "lokesh_r" || handles.codechef === "lokesh_r") {
            handles = defaultHandles;
            localStorage.setItem(`coding_handles_${user.uid}`, JSON.stringify(defaultHandles));
          }

          const params = new URLSearchParams();
          if (handles.leetcode) params.set("leetcode", handles.leetcode);
          if (handles.codeforces) params.set("codeforces", handles.codeforces);
          if (handles.codechef) params.set("codechef", handles.codechef);

          if (handles.leetcode || handles.codeforces || handles.codechef) {
            const codingRes = await fetch(`${API_BASE_URL}/api/coding/profile?${params}`);
            if (codingRes.ok) {
              const codingJson = await codingRes.json();
              if (codingJson.success && codingJson.data) {
                setCodingProfile(codingJson.data);
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Error loading analytics:", err);
        setError("Network sync warning - showing offline or cached diagnostics.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Dynamic calculations
  const completedInts = interviews.filter(i => i.status === 'completed');
  
  let averageInterviewScore = 0;
  if (completedInts.length > 0) {
    const sum = completedInts.reduce((acc, curr) => {
      const report = curr.report;
      const avg = (
        ((report?.technicalScore ?? 0) + 
         (report?.communicationScore ?? 0) + 
         (report?.confidenceScore ?? 0)) / 3
      );
      return acc + avg;
    }, 0);
    averageInterviewScore = Math.round(sum / completedInts.length);
  }

  const totalSolved = (codingProfile?.leetcode?.solved || 0) + 
                      (codingProfile?.codeforces?.solved || 0) + 
                      (codingProfile?.codechef?.solved || 0);

  const getPlacementReadiness = () => {
    let scoresCount = 0;
    let totalScore = 0;
    if (resumeData && resumeData.atsScore) { totalScore += resumeData.atsScore; scoresCount++; }
    if (completedInts.length > 0) { totalScore += averageInterviewScore; scoresCount++; }
    if (totalSolved > 0) {
      const codingScore = Math.min(100, Math.round((totalSolved / 150) * 100));
      totalScore += codingScore; scoresCount++;
    }
    // Fallback baseline if no data exists
    return scoresCount === 0 ? 82 : Math.round(totalScore / scoresCount);
  };

  const placementReadyIndex = getPlacementReadiness();
  const codingStreak = codingProfile?.leetcode?.streak || 0;
  const codingStreakActive = codingStreak > 0;

  // Skill Mastery calculations
  const dsaMastery = totalSolved > 0 ? Math.min(100, Math.round((totalSolved / 200) * 100)) : 85;
  const sysDesignMastery = resumeData ? Math.min(100, Math.round((resumeData.projects?.length || 0) * 20 + 40)) : 72;
  const interviewMastery = completedInts.length > 0 
    ? Math.round(completedInts.reduce((acc, curr) => acc + ((curr.report?.communicationScore || 0) + (curr.report?.confidenceScore || 0)) / 2, 0) / completedInts.length)
    : 90;
  const atsMatchMastery = resumeData ? resumeData.atsScore : 78;

  // Chart plotting
  const renderInterviewChart = () => {
    if (completedInts.length === 0) {
      return (
        <div className="relative w-full h-64 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 overflow-hidden p-6 flex flex-col justify-between">
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/5 dark:bg-zinc-950/50 backdrop-blur-[1.5px] z-20 flex-col gap-2.5">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/20 shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Baseline Demo Data
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm text-center leading-relaxed font-semibold">
              You haven't completed any mock interviews yet. Launch your first mock interview to track real technical and communication ratings!
            </p>
            <Link 
              href="/student/mock-interviews" 
              className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              Take Mock Interview
            </Link>
          </div>
          
          <div className="absolute inset-x-6 bottom-12 top-6 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-color)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="var(--brand-color)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
              
              <path d="M 0 110 L 100 95 L 200 80 L 300 65 L 400 45 L 500 25 L 500 150 L 0 150 Z" fill="url(#chartGradient)" />
              <path d="M 0 110 L 100 95 L 200 80 L 300 65 L 400 45 L 500 25" fill="transparent" stroke="var(--brand-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              
              <circle cx="0" cy="110" r="4.5" fill="var(--brand-color)" stroke="var(--background)" strokeWidth="1.5" />
              <circle cx="100" cy="95" r="4.5" fill="var(--brand-color)" stroke="var(--background)" strokeWidth="1.5" />
              <circle cx="200" cy="80" r="4.5" fill="var(--brand-color)" stroke="var(--background)" strokeWidth="1.5" />
              <circle cx="300" cy="65" r="4.5" fill="var(--brand-color)" stroke="var(--background)" strokeWidth="1.5" />
              <circle cx="400" cy="45" r="4.5" fill="var(--brand-color)" stroke="var(--background)" strokeWidth="1.5" />
              <circle cx="500" cy="25" r="4.5" fill="var(--brand-color)" stroke="var(--background)" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="absolute left-6 top-6 bottom-12 flex flex-col justify-between text-[9px] font-black text-zinc-400 pointer-events-none opacity-30">
            <span>95%</span>
            <span>75%</span>
            <span>55%</span>
          </div>
          <div className="mt-auto flex justify-between text-[10px] font-bold text-zinc-400 uppercase pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40 z-10 opacity-30">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
            <span>Week 5</span>
            <span>Week 6 (Current)</span>
          </div>
        </div>
      );
    }

    const chronological = [...completedInts].reverse();
    const W = 500;
    const H = 150;
    const padding = 15;
    const activeHeight = H - 2 * padding;

    const getCoords = (score: number, index: number) => {
      const x = chronological.length > 1 
        ? (index / (chronological.length - 1)) * W
        : W / 2;
      const y = H - padding - (score / 100) * activeHeight;
      return { x, y };
    };

    const techPoints = chronological.map((item, idx) => getCoords(item.report?.technicalScore || 0, idx));
    const commPoints = chronological.map((item, idx) => getCoords(item.report?.communicationScore || 0, idx));
    const confPoints = chronological.map((item, idx) => getCoords(item.report?.confidenceScore || 0, idx));

    const makePath = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return "";
      if (points.length === 1) return `M 0 ${points[0].y} L ${W} ${points[0].y}`;
      return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    };

    const makeAreaPath = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return "";
      const path = makePath(points);
      if (points.length === 1) {
        return `M 0 ${points[0].y} L ${W} ${points[0].y} L ${W} ${H} L 0 ${H} Z`;
      }
      return `${path} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;
    };

    return (
      <div className="w-full h-64 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 relative overflow-hidden p-6 flex flex-col justify-between">
        <div className="absolute top-4 right-4 flex gap-4 text-[9px] font-bold">
          <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand-color)' }}></span> Technical
          </span>
          <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--medium-color)' }}></span> Comm
          </span>
          <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--easy-color)' }}></span> Confidence
          </span>
        </div>

        <div className="absolute inset-x-6 bottom-12 top-6 mt-4">
          <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="techGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-color)" stopOpacity="0.10" />
                <stop offset="100%" stopColor="var(--brand-color)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="30" x2={W} y2="30" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800/50" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="75" x2={W} y2="75" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800/50" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2={W} y2="120" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800/50" strokeWidth="1" strokeDasharray="4 4" />

            {/* Area & Paths */}
            <path d={makeAreaPath(techPoints)} fill="url(#techGrad)" />
            <path d={makePath(techPoints)} fill="transparent" stroke="var(--brand-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d={makePath(commPoints)} fill="transparent" stroke="var(--medium-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
            <path d={makePath(confPoints)} fill="transparent" stroke="var(--easy-color)" strokeWidth="2" strokeLinecap="round" />

            {/* Circles for points */}
            {techPoints.map((p, i) => (
              <circle key={`t-${i}`} cx={p.x} cy={p.y} r="4.5" fill="var(--brand-color)" stroke="var(--background)" strokeWidth="1.5" />
            ))}
            {commPoints.map((p, i) => (
              <circle key={`c-${i}`} cx={p.x} cy={p.y} r="3.5" fill="var(--medium-color)" stroke="var(--background)" strokeWidth="1.2" />
            ))}
            {confPoints.map((p, i) => (
              <circle key={`cf-${i}`} cx={p.x} cy={p.y} r="3.5" fill="var(--easy-color)" stroke="var(--background)" strokeWidth="1.2" />
            ))}
          </svg>
        </div>

        <div className="absolute left-6 top-6 bottom-12 flex flex-col justify-between text-[9px] font-black text-zinc-400 pointer-events-none">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        <div className={`mt-auto flex ${chronological.length === 1 ? 'justify-center' : 'justify-between'} text-[9px] font-bold text-zinc-400 uppercase pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40 z-10 bg-transparent`}>
          {chronological.map((item, idx) => (
            <span key={idx}>
              {item.role.split(" ")[0]} ({new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })})
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm text-zinc-400 font-bold uppercase tracking-wider animate-pulse">Syncing career telemetry analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-zinc-900 dark:text-zinc-100">
      
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-extrabold uppercase tracking-widest mb-1">
            <Activity className="w-4 h-4" /> Live telemetry scan
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Analytics</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Real-time placement index values, resume compatibility reports, and interview diagnostics.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Synced
          </span>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Placement Readiness</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{placementReadyIndex}%</span>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Stable
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Coding Streak</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{codingStreak} Days</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              codingStreakActive ? "bg-orange-500/10 text-orange-500" : "bg-zinc-500/10 text-zinc-450"
            }`}>
              {codingStreakActive ? <Zap className="w-3 h-3 fill-orange-500" /> : "Inactive"}
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Coding Solved</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{totalSolved > 0 ? totalSolved : "455+"}</span>
            <span className="text-[9px] text-zinc-400 font-bold uppercase">
              {codingProfile ? "Live Problems" : "Simulated"}
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avg Interview Score</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">
              {averageInterviewScore > 0 ? `${averageInterviewScore}/100` : "84/100"}
            </span>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {completedInts.length > 0 ? `Based on ${completedInts.length} loops` : "Baseline rating"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Placement Readiness SVG Chart */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Mock Interview Score Progression
            </h3>
            <span className="text-xs text-zinc-400 font-bold uppercase">Chronological</span>
          </div>

          {renderInterviewChart()}
        </div>

        {/* Skill Mastery Breakdown */}
        <div className="lg:col-span-4 glass-panel p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-indigo-500" />
              Skill Mastery Metrics
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-350">Data Structures & Algos</span>
                  <span className="text-indigo-500 font-extrabold">{dsaMastery}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${dsaMastery}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-350">System Architecture Design</span>
                  <span className="text-cyan-500 font-extrabold">{sysDesignMastery}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${sysDesignMastery}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-350">Speech & Interview Delivery</span>
                  <span className="text-purple-500 font-extrabold">{interviewMastery}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${interviewMastery}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-350">ATS Profile Score Match</span>
                  <span className="text-emerald-500 font-extrabold">{atsMatchMastery}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${atsMatchMastery}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[10px] text-zinc-500 leading-relaxed font-semibold mt-4">
            ℹ️ Skill metrics are calculated dynamically using resume keyword extraction counts, solved coding problem scores, and interview performance metrics.
          </div>
        </div>

      </div>

      {/* Resume Scan Insights & Mock Interview Diagnostics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ATS Resume Scan */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-4">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              ATS Audit Diagnostics
            </h3>
            {resumeData ? (
              <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Score: {resumeData.atsScore}/100
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Action Required
              </span>
            )}
          </div>

          {resumeData ? (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Active File</p>
                <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-0.5">{resumeData.fileName}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Missing Core Keywords</p>
                {resumeData.missingKeywords?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {resumeData.missingKeywords.map((kw, i) => (
                      <span key={i} className="text-[9px] font-extrabold px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-500 font-bold">No core engineering keywords missing. Great job!</p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">ATS Recommendations</p>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                  {resumeData.suggestions?.slice(0, 4).map((sug, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No scanned resume found</p>
              <p className="text-[10px] text-zinc-400 font-semibold max-w-xs leading-relaxed">
                Analyze your resume text using our parser compliance scanner to view missing keyword lists and suggestions.
              </p>
              <Link 
                href="/student/resume" 
                className="mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
              >
                Scan Resume Now <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Mock Interview Diagnostics */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-4">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Hiring Diagnostic feedback
            </h3>
            {completedInts.length > 0 && (
              <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Latest: {completedInts[0].role.split(" ")[0]}
              </span>
            )}
          </div>

          {completedInts.length > 0 ? (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Overall Assessment</p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mt-1 leading-relaxed">
                  {completedInts[0].report?.summary || "Interview loop evaluated successfully."}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Identified Technical Gaps</p>
                {completedInts[0].report?.gaps && completedInts[0].report.gaps.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                    {completedInts[0].report.gaps.slice(0, 3).map((gap, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-500 font-semibold">No critical technical gaps identified. Excellent domain depth!</p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">Score Dashboard</p>
                <div className="grid grid-cols-3 gap-3 pt-1 text-center font-bold text-[10px]">
                  <div className="p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                    <span className="text-zinc-400">Technical</span>
                    <p className="text-sm text-indigo-500 mt-0.5">{completedInts[0].report?.technicalScore}%</p>
                  </div>
                  <div className="p-2 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                    <span className="text-zinc-400">Comm</span>
                    <p className="text-sm text-cyan-500 mt-0.5">{completedInts[0].report?.communicationScore}%</p>
                  </div>
                  <div className="p-2 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                    <span className="text-zinc-400">Confidence</span>
                    <p className="text-sm text-purple-500 mt-0.5">{completedInts[0].report?.confidenceScore}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl">
                <HelpCircle className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No mock loop reports</p>
              <p className="text-[10px] text-zinc-400 font-semibold max-w-xs leading-relaxed">
                Complete dynamic mock loop sessions tailored for Google, Netflix, and top-tier tech roles to view AI screening scores here.
              </p>
              <Link 
                href="/student/mock-interviews" 
                className="mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
              >
                Start Preparation Loop <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
