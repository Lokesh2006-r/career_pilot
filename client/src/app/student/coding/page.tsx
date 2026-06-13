"use client";


import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface LeetCodeData {
  username: string; avatar: string; realName: string;
  solved: number; easy: number; medium: number; hard: number;
  rating: number; globalRank: number; topPct: number;
  streak: number; totalActiveDays: number;
  contestHistory: ContestEntry[];
  topics?: any;
}
interface CodeforcesData {
  handle: string; rating: number; maxRating: number;
  rank: string; maxRank: string; avatar: string; solved: number;
  ratingHistory: ContestEntry[];
}
interface CodeChefData {
  username: string; rating: number; highRating: number;
  stars: string; solved: number; globalRank: string;
  error?: string;
  note?: string;
}
interface ContestEntry {
  name: string; date: string; rank: number; rating: number; delta: number; timestamp?: number;
}
interface Submission {
  problem: string; platform: string; difficulty: string;
  status: string; time: string; url: string;
}
interface HeatmapCell {
  val: number;
  count: number;
  date: string;
}
interface ProfileData {
  leetcode?: LeetCodeData;
  codeforces?: CodeforcesData;
  codechef?: CodeChefData;
  heatmap?: HeatmapCell[][];
  recentSubmissions?: Submission[];
  errors?: Record<string, string>;
  overallActiveDays?: number;
  overallMaxStreak?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function DifficultyPill({ diff }: { diff: string }) {
  const map: Record<string, string> = {
    Easy:    "text-zinc-500 bg-zinc-500/10 border border-zinc-500/20",
    Medium:  "text-zinc-600 dark:text-zinc-400 bg-zinc-500/15 border border-zinc-500/25",
    Hard:    "text-zinc-900 dark:text-white bg-zinc-500/20 border border-zinc-500/30",
    Unknown: "text-zinc-500 bg-zinc-500/10 border border-zinc-500/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${map[diff] ?? map.Unknown}`}>
      {diff}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Accepted: "text-zinc-900 dark:text-white bg-zinc-500/15 border border-zinc-500/25",
    TLE:      "text-zinc-500 bg-zinc-500/10 border border-zinc-500/20",
    WA:       "text-zinc-400 dark:text-zinc-650 bg-zinc-500/5 border border-zinc-500/15",
    MLE:      "text-zinc-400 dark:text-zinc-650 bg-zinc-500/5 border border-zinc-500/15",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border ${map[status] ?? "text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"}`}>
      {status}
    </span>
  );
}

function DonutChart({ segments, total }: { segments: { label: string; count: number; color: string }[]; total: number }) {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const segs = segments.map(s => ({ ...s, pct: total > 0 ? s.count / total : 0 }));
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
          {segs.map((seg, i) => {
            const dash = seg.pct * circ;
            const gap  = circ - dash;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={seg.color} strokeWidth="16"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset * circ}
              />
            );
            offset += seg.pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">{total}</span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase">Solved</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {segs.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium w-16 truncate">{seg.label}</span>
            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingSparkline({ data, color }: { data: ContestEntry[]; color?: string }) {
  if (data.length < 2) return <div className="text-zinc-500 text-xs py-4 text-center">No contest history yet</div>;
  const ratings = data.map((d) => d.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const range = max - min || 1;
  const W = 200, H = 60;
  const pts = ratings
    .map((v, i) => `${(i / (ratings.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`)
    .join(" ");
  const area = `0,${H} ${pts} ${W},${H}`;
  const strokeColor = color || "var(--brand-color)";
  const gradId = `sg-${color?.replace('#', '') || 'default'}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
      {ratings.map((v, i) => {
        const x = (i / (ratings.length - 1)) * W;
        const y = H - ((v - min) / range) * (H - 4) - 2;
        return <circle key={i} cx={x} cy={y} r="2" fill={strokeColor} />;
      })}
    </svg>
  );
}

function HeatCell({
  cell,
  isSelected,
  onClick,
}: {
  cell: HeatmapCell;
  isSelected: boolean;
  onClick: () => void;
}) {
  if (cell.val === -2 || cell.val === -1) {
    return <div className="w-[11px] h-[11px] opacity-0 pointer-events-none" />;
  }
  const colors = [
    "var(--heatmap-bg-0)",
    "var(--heatmap-bg-1)",
    "var(--heatmap-bg-2)",
    "var(--heatmap-bg-3)",
    "var(--heatmap-bg-4)",
  ];
  
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10).toString();
    const day = parseInt(parts[2], 10).toString();
    return `${day}/${month}/${year}`;
  };

  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: colors[cell.val] }}
      className={`w-[11px] h-[11px] rounded-[2px] transition-all hover:scale-125 hover:ring-1 hover:ring-emerald-400 cursor-pointer ${
        isSelected ? "ring-2 ring-emerald-400 scale-125 z-10 shadow-lg shadow-emerald-500/40" : ""
      }`}
      title={`${cell.count} submission${cell.count !== 1 ? "s" : ""} on ${formatDate(cell.date)}`}
    />
  );
}

function StarsBadge({ stars }: { stars: string }) {
  return <span className="text-yellow-400 font-bold text-sm">{stars}</span>;
}

function PlatformCard({
  platform, icon, rating, ratingLabel, sub, color, bgColor, href, onClick,
}: {
  platform: string; icon: string; rating: number | string; ratingLabel: string;
  sub: string; color: string; bgColor: string; href?: string; onClick?: () => void;
}) {
  const isLink = !!href && href !== "#";
  const cardContent = (
    <>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center text-sm`}>{icon}</div>
        <div>
          <p className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{platform}</p>
          <p className={`text-[10px] font-semibold ${color}`}>{ratingLabel}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold text-zinc-900 dark:text-white">{rating}</p>
        <p className="text-[9px] text-zinc-500 dark:text-zinc-400">{sub}</p>
      </div>
    </>
  );

  if (isLink) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/30 hover:border-zinc-350 dark:hover:border-zinc-700/60 transition-all group"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/30 transition-all ${
        onClick ? "hover:border-zinc-350 dark:hover:border-zinc-700/60 cursor-pointer group active:scale-[0.98]" : ""
      }`}
    >
      {cardContent}
    </div>
  );
}

// ─── Skeleton loader ─────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/60 rounded-lg ${className}`} />;
}

// ─── Main Page ───────────────────────────────────────────────────────────────────
export default function CodingTracker() {
  const { user } = useAuth();
  const [data, setData]           = useState<ProfileData | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "submissions" | "topics">("overview");

  // Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [syncing, setSyncing]         = useState(false);
  const [syncStep, setSyncStep]       = useState("");
  const [leetHandle, setLeetHandle]   = useState("");
  const [cfHandle, setCfHandle]       = useState("");
  const [ccHandle, setCcHandle]       = useState("");
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("current");

  // Saved handles
  const [savedHandles, setSavedHandles] = useState<{
    leetcode: string; codeforces: string; codechef: string;
  }>({ leetcode: "", codeforces: "", codechef: "" });

  const fetchProfile = useCallback(async (lc: string, cf: string, cc: string, year: string = "current") => {
    if (!lc && !cf && !cc) return;
    setLoading(true);
    setError(null);
    setSelectedCell(null);
    try {
      const params = new URLSearchParams();
      if (lc) params.set("leetcode",    lc);
      if (cf) params.set("codeforces",  cf);
      if (cc) params.set("codechef",    cc);
      params.set("year", year);

      const res  = await fetch(`${API_BASE_URL}/api/coding/profile?${params}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Failed to fetch profile data");

      setData({
        leetcode:          json.data.leetcode,
        codeforces:        json.data.codeforces,
        codechef:          json.data.codechef,
        heatmap:           json.data.heatmap,
        recentSubmissions: json.recentSubmissions,
        errors:            json.errors,
        overallActiveDays: json.data?.overallActiveDays,
        overallMaxStreak:  json.data?.overallMaxStreak,
      });
    } catch (e: any) {
      setError(e.message || "Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saved handles on mount/user change
  useEffect(() => {
    if (!user) return;
    
    // Default to student Lokesh R's actual original handles ONLY if the email is kit27cse25@gmail.com
    const defaultHandles = user.email === "kit27cse25@gmail.com" ? {
      leetcode: "Lokesh-123_",
      codeforces: "Lokeshr_2006",
      codechef: "kit27cse25"
    } : {
      leetcode: "",
      codeforces: "",
      codechef: ""
    };

    const loadHandles = async () => {
      let handles = defaultHandles;
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.codingHandles) {
            const h = json.data.codingHandles;
            if (h.leetcode || h.codeforces || h.codechef) {
              handles = h;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load handles from DB:", err);
      }

      // If handles are still empty, fall back to localStorage
      if (!handles.leetcode && !handles.codeforces && !handles.codechef) {
        const raw = localStorage.getItem(`coding_handles_${user.uid}`);
        if (raw) {
          try {
            const h = JSON.parse(raw);
            if (h.leetcode || h.codeforces || h.codechef) {
              handles = h;
            }
          } catch {}
        }
      }

      // Auto-migrate if placeholder handle is set (Removed to prevent wiping actual lokesh_r handles)

      localStorage.setItem(`coding_handles_${user.uid}`, JSON.stringify(handles));
      setSavedHandles(handles);
      setLeetHandle(handles.leetcode || "");
      setCfHandle(handles.codeforces || "");
      setCcHandle(handles.codechef || "");

      // Auto-fetch if handles exist
      if (handles.leetcode || handles.codeforces || handles.codechef) {
        fetchProfile(handles.leetcode, handles.codeforces, handles.codechef, selectedYear);
      }
    };

    loadHandles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchProfile]);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (syncing) return;
    setSyncing(true);
    const steps = [
      "Connecting to LeetCode GraphQL...",
      "Fetching Codeforces API...",
      "Querying CodeChef data...",
      "Aggregating submissions...",
      "Building activity heatmap...",
    ];
    for (let i = 0; i < steps.length; i++) {
      setSyncStep(steps[i]);
      await new Promise((r) => setTimeout(r, 600));
    }
    const handles = { leetcode: leetHandle.trim(), codeforces: cfHandle.trim(), codechef: ccHandle.trim() };
    if (user) {
      localStorage.setItem(`coding_handles_${user.uid}`, JSON.stringify(handles));
      try {
        await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ codingHandles: handles })
        });
      } catch (err) {
        console.error("Failed to sync coding handles to backend:", err);
      }
    }
    setSavedHandles(handles);
    setSyncing(false);
    setSyncStep("");
    setModalOpen(false);
    fetchProfile(handles.leetcode, handles.codeforces, handles.codechef, selectedYear);
  };

  const lc = data?.leetcode;
  const cf = data?.codeforces;
  const cc = data?.codechef;
  const heatmap = data?.heatmap;
  const subs = data?.recentSubmissions || [];
  const totalSolved = (savedHandles.leetcode ? (lc?.solved || 0) : 0) +
                      (savedHandles.codeforces ? (cf?.solved || 0) : 0) +
                      (savedHandles.codechef ? (cc?.solved || 0) : 0);
  const contestHistory = [
    ...(savedHandles.leetcode ? (lc?.contestHistory || []) : []),
    ...(savedHandles.codeforces ? (cf?.ratingHistory  || []) : []),
  ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 7);

  const hasHandles = savedHandles.leetcode || savedHandles.codeforces || savedHandles.codechef;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Sync Modal ───────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/70 rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] relative animate-fade-in">
            <button
              onClick={() => !syncing && setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark w-4 h-4" ></i>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <i className="fa-solid fa-arrows-rotate w-5 h-5 text-indigo-500 dark:text-indigo-400" ></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Connect Coding Profiles</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Real-time data pulled from platform APIs</p>
              </div>
            </div>

            {syncing ? (
              <div className="py-10 flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
                </div>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold text-center animate-pulse">{syncStep}</p>
              </div>
            ) : (
              <form onSubmit={handleSync} className="space-y-4">
                {/* LeetCode */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <span className="text-sm">🟡</span> LeetCode Username <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    value={leetHandle} required
                    onChange={(e) => setLeetHandle(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-colors"
                  />
                </div>
                {/* Codeforces */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <span className="text-sm">🔵</span> Codeforces Handle
                  </label>
                  <input
                    value={cfHandle}
                    onChange={(e) => setCfHandle(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-colors"
                  />
                </div>
                {/* CodeChef */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <span className="text-sm">⭐</span> CodeChef Username
                  </label>
                  <input
                    value={ccHandle}
                    onChange={(e) => setCcHandle(e.target.value)}
                    placeholder="e.g. code_chef_user"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-colors"
                  />
                </div>

                <div className="pt-1 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  ℹ️ Data is fetched live from <strong className="text-zinc-800 dark:text-zinc-300">LeetCode GraphQL</strong>, <strong className="text-zinc-800 dark:text-zinc-300">Codeforces REST API</strong>, and <strong className="text-zinc-800 dark:text-zinc-300">CodeChef public API</strong>. No API keys required.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                  Fetch Real Data
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Coding Tracker</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5 truncate">
            {hasHandles
              ? `Live data · LeetCode${savedHandles.codeforces ? " · Codeforces" : ""}${savedHandles.codechef ? " · CodeChef" : ""}`
              : "Connect your profiles to see real-time stats"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasHandles && (
            <button
              onClick={() => fetchProfile(savedHandles.leetcode, savedHandles.codeforces, savedHandles.codechef, selectedYear)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold text-[11px] transition-all disabled:opacity-50"
            >
              <i className={`fa-solid fa-arrows-rotate ${`w-3 h-3 ${loading ? "animate-spin" : ""}`} `}></i>
              <span className="hidden xs:inline sm:inline">Refresh</span>
            </button>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-all active:scale-95 shadow-md shadow-indigo-500/20"
          >
            <i className="fa-solid fa-arrows-rotate w-3 h-3" ></i>
            <span>{hasHandles ? "Update" : "Connect"}</span>
          </button>
        </div>
      </header>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <i className="fa-solid fa-circle-exclamation w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" ></i>
          <div>
            <p className="text-sm font-bold text-red-400">Failed to fetch data</p>
            <p className="text-xs text-red-300/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Platform-level errors ────────────────────────────────────────────── */}
      {data?.errors && Object.keys(data.errors).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.errors).map(([platform, msg]) => (
            <div key={platform} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-bold">
              ⚠️ {platform}: {msg}
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {!hasHandles && !loading && (
        <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <i className="fa-solid fa-code w-8 h-8 text-indigo-400" ></i>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white mb-2">Connect Your Coding Profiles</h2>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Enter your LeetCode, Codeforces, and CodeChef usernames to fetch real-time stats, submission history, contest ratings, and activity heatmaps.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            Get Started
          </button>
        </div>
      )}

      {/* ── Main dashboard (after data loads) ───────────────────────────────── */}
      {(lc || cf || cc) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1 space-y-5">
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-2xl font-black text-zinc-500 mb-4 ring-4 ring-white dark:ring-zinc-950">
                  {(lc?.username || savedHandles.leetcode || "S")[0].toUpperCase()}
                </div>
                {loading ? (
                  <><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-24" /></>
                ) : (
                  <>
                    <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">{lc?.realName || lc?.username || savedHandles.leetcode}</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">@{lc?.username || savedHandles.leetcode}</p>
                  </>
                )}
                <div className="flex gap-1.5 mt-2.5 flex-wrap justify-center">
                  {savedHandles.leetcode   && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">LeetCode</span>}
                  {savedHandles.codeforces && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20">Codeforces</span>}
                  {savedHandles.codechef   && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20">CodeChef</span>}
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 dark:border-orange-500/30 mb-3">
                <i className="fa-solid fa-fire w-5 h-5 text-orange-500 flex-shrink-0" ></i>
                <div>
                  <p className="text-[10px] text-orange-600 dark:text-orange-300 font-black uppercase tracking-widest">LeetCode Streak</p>
                  {loading ? <Skeleton className="h-5 w-20 mt-1" /> : (
                    <p className="text-lg font-extrabold text-orange-900 dark:text-white">{lc?.streak ?? "—"} Days</p>
                  )}
                </div>
              </div>

              {/* Total solved */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-500/30">
                <i className="fa-solid fa-bullseye w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" ></i>
                <div>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-black uppercase tracking-widest">Total Solved</p>
                  {loading ? <Skeleton className="h-5 w-20 mt-1" /> : (
                    <p className="text-lg font-extrabold text-indigo-900 dark:text-white">{totalSolved}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Platform ratings */}
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Platform Ratings</h3>

              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
              ) : (
                <>
                  {savedHandles.leetcode && lc ? (
                    <PlatformCard
                      platform="LeetCode" icon="🟡"
                      rating={lc.rating || "Unrated"}
                      ratingLabel={lc.globalRank ? `Rank #${lc.globalRank.toLocaleString()} · Top ${lc.topPct?.toFixed(1)}%` : "Contest Rating"}
                      sub={`${lc.solved} solved`}
                      color="text-amber-600 dark:text-amber-400" bgColor="bg-amber-500/10"
                      href={`https://leetcode.com/${lc.username}`}
                    />
                  ) : (
                    <PlatformCard
                      platform="LeetCode" icon="🟡"
                      rating="—"
                      ratingLabel="Not Connected"
                      sub="Connect profile"
                      color="text-zinc-500" bgColor="bg-zinc-800/20"
                      onClick={() => setModalOpen(true)}
                    />
                  )}

                  {savedHandles.codeforces && cf ? (
                    <PlatformCard
                      platform="Codeforces" icon="🔵"
                      rating={cf.rating || "Unrated"}
                      ratingLabel={`${cf.rank} (max: ${cf.maxRating})`}
                      sub={`${cf.solved} solved`}
                      color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-500/10"
                      href={`https://codeforces.com/profile/${cf.handle}`}
                    />
                  ) : (
                    <PlatformCard
                      platform="Codeforces" icon="🔵"
                      rating="—"
                      ratingLabel="Not Connected"
                      sub="Connect profile"
                      color="text-zinc-500" bgColor="bg-zinc-800/20"
                      onClick={() => setModalOpen(true)}
                    />
                  )}

                  {savedHandles.codechef && cc && !cc.error ? (
                    <PlatformCard
                      platform="CodeChef" icon="⭐"
                      rating={cc.rating > 0 ? cc.rating : "N/A"}
                      ratingLabel={cc.rating > 0 ? `${cc.stars} · High: ${cc.highRating}` : "Rating via JS — see note"}
                      sub={`${cc.solved} solved (est.)`}
                      color="text-red-600 dark:text-red-400" bgColor="bg-red-500/10"
                      href={`https://codechef.com/users/${cc.username}`}
                    />
                  ) : cc?.error ? (
                    <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/30 text-[10px] text-zinc-500">
                      ⚠️ CodeChef: {cc.error}
                    </div>
                  ) : (
                    <PlatformCard
                      platform="CodeChef" icon="⭐"
                      rating="—"
                      ratingLabel="Not Connected"
                      sub="Connect profile"
                      color="text-zinc-500" bgColor="bg-zinc-800/20"
                      onClick={() => setModalOpen(true)}
                    />
                  )}
                  {cc?.note && !cc.error && savedHandles.codechef && (
                    <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-500/80 leading-relaxed">
                      ℹ️ {cc.note}
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>

          {/* ── Right content ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Breakdown + Rating sparkline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="glass-panel rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Platform Breakdown</h3>
                {loading ? (
                  <div className="flex items-center gap-6">
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /></div>
                  </div>
                ) : (lc || cf || cc) ? (
                  <DonutChart 
                    total={(lc?.solved || 0) + (cf?.solved || 0) + (cc?.solved || 0)}
                    segments={[
                      ...(savedHandles.leetcode && lc?.solved ? [{ label: "LeetCode", count: lc.solved, color: "#f59e0b" }] : []),
                      ...(savedHandles.codeforces && cf?.solved ? [{ label: "Codeforces", count: cf.solved, color: "#3b82f6" }] : []),
                      ...(savedHandles.codechef && cc?.solved ? [{ label: "CodeChef", count: cc.solved, color: "#ef4444" }] : []),
                    ]}
                  />
                ) : (
                  <p className="text-zinc-600 text-xs">No platform data</p>
                )}
              </div>

              <div className="glass-panel rounded-2xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Contest Rating</h3>
                  {loading ? <Skeleton className="h-6 w-16" /> : (
                    <div className="flex gap-3">
                      {savedHandles.leetcode && lc?.rating ? <span className="text-sm font-extrabold text-amber-500" title="LeetCode">{lc.rating}</span> : null}
                      {savedHandles.codeforces && cf?.rating ? <span className="text-sm font-extrabold text-blue-500" title="Codeforces">{cf.rating}</span> : null}
                      {savedHandles.codechef && cc?.rating ? <span className="text-sm font-extrabold text-red-500" title="CodeChef">{cc.rating}</span> : null}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-600 mb-3">Rating trend across contests</p>
                {loading ? <Skeleton className="h-12 w-full" /> : (
                  <div className="space-y-4">
                    {savedHandles.leetcode && (lc?.contestHistory?.length ?? 0) > 1 && (
                      <div className="relative">
                        <span className="absolute -left-2 -top-2 text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded">LC</span>
                        <RatingSparkline data={lc?.contestHistory || []} color="#f59e0b" />
                      </div>
                    )}
                    {savedHandles.codeforces && (cf?.ratingHistory?.length ?? 0) > 1 && (
                      <div className="relative">
                        <span className="absolute -left-2 -top-2 text-[8px] font-bold text-blue-500 bg-blue-500/10 px-1 py-0.5 rounded">CF</span>
                        <RatingSparkline data={cf?.ratingHistory || []} color="#3b82f6" />
                      </div>
                    )}
                    {(!savedHandles.leetcode || (lc?.contestHistory?.length ?? 0) < 2) && (!savedHandles.codeforces || (cf?.ratingHistory?.length ?? 0) < 2) && (
                      <div className="text-zinc-500 text-xs py-4 text-center">No contest history yet</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Heatmap */}
            <div className="glass-panel rounded-2xl p-5">
              {loading ? (
                <Skeleton className="h-40 w-full" />
              ) : heatmap ? (
                (() => {
                  // Group flatDays by month key
                  const monthsMap: Record<string, HeatmapCell[]> = {};
                  const allCells = heatmap.flat().filter(c => c.val !== -1);
                  
                  allCells.sort((a, b) => a.date.localeCompare(b.date));

                  allCells.forEach(cell => {
                    const monthKey = cell.date.slice(0, 7); // "YYYY-MM"
                    if (!monthsMap[monthKey]) {
                      monthsMap[monthKey] = [];
                    }
                    monthsMap[monthKey].push(cell);
                  });

                  const monthGroups = Object.keys(monthsMap).sort().map(monthKey => {
                    const monthDays = monthsMap[monthKey];
                    const columns: HeatmapCell[][] = [];
                    let currentColumn: HeatmapCell[] = [];

                    // First day of this month in local time to avoid timezone offset shifts
                    const parts = monthDays[0].date.split("-");
                    const year = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const day = parseInt(parts[2], 10);
                    const firstDayDate = new Date(year, month, day);
                    const firstDayWeekday = firstDayDate.getDay();

                    // Pad the start of the month
                    for (let i = 0; i < firstDayWeekday; i++) {
                      currentColumn.push({ date: "", val: -2, count: 0 });
                      if (currentColumn.length === 7) {
                        columns.push(currentColumn);
                        currentColumn = [];
                      }
                    }

                    monthDays.forEach(cell => {
                      currentColumn.push(cell);
                      if (currentColumn.length === 7) {
                        columns.push(currentColumn);
                        currentColumn = [];
                      }
                    });
                    if (currentColumn.length > 0) columns.push(currentColumn);

                    return { monthKey, columns };
                  });

                  const totalSubmissionsPastYear = heatmap.flat().reduce((sum, c) => sum + (c.val > 0 ? c.count : 0), 0);
                  const getMonthLabel = (m: string) => {
                    const date = new Date(m + "-01");
                    return date.toLocaleDateString("en-US", { month: "short" });
                  };

                  return (
                    <div className="space-y-4">
                      {/* Heatmap Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800/40 pb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-extrabold text-zinc-900 dark:text-white">{totalSubmissionsPastYear}</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">submissions in the past one year</span>
                          <span title="Submissions across all platforms over the last 12 months" className="cursor-help">
                            <i className="fa-solid fa-circle-info w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" ></i>
                          </span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                            Total active days: <strong className="text-zinc-900 dark:text-white font-bold">{data?.overallActiveDays ?? lc?.totalActiveDays ?? 0}</strong>
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                            Max streak: <strong className="text-zinc-900 dark:text-white font-bold">{data?.overallMaxStreak ?? lc?.streak ?? 0}</strong>
                          </span>
                          <select
                            value={selectedYear}
                            onChange={(e) => {
                              setSelectedYear(e.target.value);
                              fetchProfile(savedHandles.leetcode, savedHandles.codeforces, savedHandles.codechef, e.target.value);
                            }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700/60 rounded-xl px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-bold cursor-pointer transition-colors focus:outline-none focus:border-indigo-500"
                          >
                            <option value="current">Current</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                          </select>
                        </div>
                      </div>

                      {/* Heatmap Grid */}
                      <div className="overflow-x-auto pb-2 scrollbar-thin">
                        <div className="flex gap-4 min-w-[850px] justify-between py-1">
                          {monthGroups.map((group) => (
                            <div key={group.monthKey} className="flex flex-col items-center gap-2">
                              <div className="flex gap-[3px]">
                                {group.columns.map((col, ci) => (
                                  <div key={ci} className="flex flex-col gap-[3px]">
                                    {col.map((cell, di) => (
                                      <HeatCell
                                        key={di}
                                        cell={cell}
                                        isSelected={selectedCell?.date === cell.date}
                                        onClick={() => cell.val !== -2 && setSelectedCell(cell)}
                                      />
                                    ))}
                                  </div>
                                ))}
                              </div>
                              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">
                                {getMonthLabel(group.monthKey)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Selected cell details */}
                      {selectedCell && (
                        <div className="flex justify-center pt-2">
                          <div className="text-xs font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-2 px-4 animate-fade-in flex items-center gap-2 shadow-lg shadow-emerald-500/5">
                            <i className="fa-solid fa-chart-line w-4 h-4 text-emerald-400" ></i>
                            <span>
                              {selectedCell.count} submission{selectedCell.count !== 1 ? "s" : ""} on {(() => {
                                if (!selectedCell.date) return "";
                                const parts = selectedCell.date.split("-");
                                if (parts.length !== 3) return selectedCell.date;
                                return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <p className="text-zinc-600 text-xs">Heatmap available after LeetCode sync</p>
              )}
            </div>

            {/* Tabs */}
            <div className="glass-panel rounded-2xl overflow-hidden">
              <div className="flex border-b border-zinc-200 dark:border-zinc-800/50">
                {(["overview", "submissions", "topics"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeTab === tab
                        ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-500 bg-indigo-500/5"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/30"
                    }`}
                  >
                    {tab === "overview" ? "🏅 Overview" : tab === "submissions" ? "📋 Submissions" : "🎯 Topics"}
                  </button>
                ))}
              </div>

              {/* Overview tab */}
              {activeTab === "overview" && (
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />) : (
                      <>
                        <StatCard label="LeetCode Solved" value={savedHandles.leetcode ? lc?.solved : undefined} icon={<i className="fa-solid fa-code w-4 h-4 text-amber-500" ></i>} bg="bg-amber-500/10" />
                        <StatCard label="Codeforces Solved" value={savedHandles.codeforces ? cf?.solved : undefined} icon={<i className="fa-solid fa-bolt w-4 h-4 text-blue-500" ></i>} bg="bg-blue-500/10" />
                        <StatCard label="CodeChef Solved" value={savedHandles.codechef ? cc?.solved : undefined} icon={<i className="fa-solid fa-star w-4 h-4 text-red-500" ></i>} bg="bg-red-500/10" />
                        <StatCard label="Total Problems" value={totalSolved} icon={<i className="fa-solid fa-trophy w-4 h-4 text-indigo-500" ></i>} bg="bg-indigo-500/10" highlight />
                      </>
                    )}
                  </div>

                  {/* Contest history */}
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Recent Contests</h4>
                  {loading ? (
                    <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                  ) : contestHistory.length > 0 ? (
                    <div className="space-y-2">
                      {contestHistory.map((c, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{c.name}</p>
                            <p className="text-[10px] text-zinc-505">{c.date}{c.rank ? ` · Rank #${c.rank.toLocaleString()}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">{c.rating}</span>
                            {c.delta !== 0 && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.delta > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                                {c.delta > 0 ? "+" : ""}{c.delta}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-600 text-xs">No contest history found</p>
                  )}
                </div>
              )}

              {/* Submissions tab */}
              {activeTab === "submissions" && (
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-5 space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
                  ) : subs.length > 0 ? (
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-800/50 text-zinc-500 uppercase font-bold tracking-widest text-[9px]">
                          <th className="px-5 py-3.5">Problem</th>
                          <th className="px-4 py-3.5">Platform</th>
                          <th className="px-4 py-3.5">Difficulty</th>
                          <th className="px-4 py-3.5">Status</th>
                          <th className="px-4 py-3.5 text-right">When</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/30">
                        {subs.map((s, i) => (
                          <tr key={i} className="hover:bg-zinc-150/30 dark:hover:bg-zinc-800/20 transition-colors group">
                            <td className="px-5 py-3.5">
                              <a href={s.url} target="_blank" rel="noopener noreferrer"
                                className="font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                                {s.problem}
                                <i className="fa-solid fa-up-right-from-square w-3 h-3 opacity-0 group-hover:opacity-100" ></i>
                              </a>
                            </td>
                            <td className="px-4 py-3.5 text-[10px] text-zinc-500 font-semibold">{s.platform}</td>
                            <td className="px-4 py-3.5"><DifficultyPill diff={s.difficulty} /></td>
                            <td className="px-4 py-3.5"><StatusPill status={s.status} /></td>
                            <td className="px-4 py-3.5 text-right text-zinc-500 font-medium">{s.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-zinc-600 text-sm">No recent submissions found</div>
                  )}
                </div>
              )}

              {/* Topics tab */}
              {activeTab === "topics" && (
                <div className="p-5">
                  {loading ? (
                    <div className="space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
                  ) : lc?.topics ? (
                    <div className="space-y-6">
                      {lc.topics.advanced?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">Advanced Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {lc.topics.advanced.map((t: any, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                <span>{t.tagName}</span>
                                <span className="opacity-60 text-[10px]">{t.problemsSolved}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {lc.topics.intermediate?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">Intermediate Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {lc.topics.intermediate.map((t: any, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <span>{t.tagName}</span>
                                <span className="opacity-60 text-[10px]">{t.problemsSolved}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {lc.topics.fundamental?.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">Fundamental Topics</h4>
                          <div className="flex flex-wrap gap-2">
                            {lc.topics.fundamental.map((t: any, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span>{t.tagName}</span>
                                <span className="opacity-60 text-[10px]">{t.problemsSolved}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {lc.topics.advanced?.length === 0 && lc.topics.intermediate?.length === 0 && lc.topics.fundamental?.length === 0 && (
                        <p className="text-zinc-600 text-xs">No topic data available yet.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-zinc-600 text-xs">Connect LeetCode to see topic analysis</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, bg, highlight }: {
  label: string; value?: number; icon: React.ReactNode; bg: string; highlight?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 p-3 rounded-xl border ${highlight ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800/40"}`}>
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className={`text-xl font-extrabold ${highlight ? "text-indigo-600 dark:text-indigo-300" : "text-zinc-900 dark:text-white"}`}>
          {value !== undefined ? value.toLocaleString() : "—"}
        </p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
      </div>
    </div>
  );
}
