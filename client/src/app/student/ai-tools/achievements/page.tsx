"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function AchievementPassport() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<any[]>([]);
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
        if (json.success && json.data?.achievements) {
          setBadges(json.data.achievements);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAchievements = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-tools/achievements/${user.uid}`, {
        method: "POST"
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setBadges(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const printPassport = () => {
    window.print();
  };

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="flex flex-col gap-8 animate-fade-in text-zinc-900 dark:text-zinc-100 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-[11px] uppercase tracking-wider mb-1">
            <Link href="/student/ai-tools" className="hover:text-indigo-500 transition-colors">AI Tools</Link>
            <span>/</span>
            <span className="text-yellow-500">Achievement Passport</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-award text-zinc-900 dark:text-white"></i> Digital Achievement Passport
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Collect badges as you progress in your placement journey.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateAchievements}
            disabled={generating}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rotate"></i>}
            {generating ? "Syncing..." : "Sync Achievements"}
          </button>
          {badges.length > 0 && (
            <button 
              onClick={printPassport}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-print"></i> Share
            </button>
          )}
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print:block mb-8 border-b-2 border-zinc-200 pb-4">
        <h1 className="text-3xl font-bold">Digital Achievement Passport</h1>
        <p className="text-zinc-500 text-lg mt-1">{user?.name || 'Student'} • CareerPilot Verified</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-zinc-400"></i>
        </div>
      ) : badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <i className="fa-solid fa-award text-4xl text-zinc-300 dark:text-zinc-600 mb-4"></i>
          <h3 className="text-lg font-semibold mb-2">No Badges Synced</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">Click "Sync Achievements" to analyze your profile and award your earned badges.</p>
        </div>
      ) : (
        <>
          <div className="bg-zinc-900 text-white rounded-2xl p-6 shadow-md flex items-center justify-between print:bg-zinc-100 print:text-zinc-900 print:shadow-none print:border print:border-zinc-300">
            <div>
              <h2 className="text-xl font-bold mb-1">Total Progress</h2>
              <p className="text-zinc-400 print:text-zinc-600 text-sm">{earnedCount} of {badges.length} Badges Unlocked</p>
            </div>
            <div className="w-48">
              <div className="h-3 w-full bg-zinc-800 print:bg-zinc-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${(earnedCount / badges.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {badges.map((badge: any, i: number) => (
              <div 
                key={i} 
                className={`relative flex flex-col items-center text-center p-6 rounded-2xl border transition-all ${
                  badge.earned 
                    ? 'bg-white dark:bg-zinc-900 border-yellow-200 dark:border-yellow-900/50 shadow-sm print:border-yellow-500 print:bg-yellow-50' 
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-70 grayscale print:hidden'
                }`}
              >
                {badge.earned && (
                  <div className="absolute top-2 right-2 text-yellow-500 print:text-yellow-600">
                    <i className="fa-solid fa-circle-check text-sm"></i>
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-4 ${
                  badge.earned ? 'bg-yellow-100 border-yellow-200 text-yellow-600 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-400 print:border-yellow-500' : 'bg-zinc-200 border-zinc-300 text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700'
                }`}>
                  <i className={`${badge.icon} text-2xl`}></i>
                </div>
                
                <h3 className={`text-sm font-bold mb-2 ${badge.earned ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>{badge.title}</h3>
                <p className="text-xs text-zinc-500 flex-1">{badge.description}</p>
                
                {!badge.earned && (
                  <div className="mt-4 w-full">
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>{badge.progress}</span>
                      <span>{badge.target}</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-400" style={{ width: `${(badge.progress / badge.target) * 100}%` }}></div>
                    </div>
                  </div>
                )}

                {badge.earned && badge.earnedAt && (
                  <div className="mt-4 text-[10px] font-mono text-yellow-600/70 dark:text-yellow-500/50">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
