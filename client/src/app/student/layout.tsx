"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import CareerPilotLogo from "@/components/CareerPilotLogo";
import { API_BASE_URL } from "@/lib/api";
import { useEffect } from "react";

const NAV_ITEMS = [
  { href: "/student/dashboard",       icon: "fa-solid fa-house",               label: "Dashboard" },
  { href: "/student/resume",          icon: "fa-solid fa-file-lines",          label: "Resume Analyzer" },
  { href: "/student/resume-builder",  icon: "fa-solid fa-wand-magic-sparkles", label: "Resume Builder" },
  { href: "/student/mock-interviews", icon: "fa-solid fa-video",               label: "AI Interview" },
  { href: "/student/coding",          icon: "fa-solid fa-code",                label: "Coding" },
  { href: "/student/exam-craft",      icon: "fa-solid fa-graduation-cap",      label: "Exam Craft" },
  { href: "/student/projects",        icon: "fa-solid fa-lightbulb",           label: "Projects" },
  { href: "/student/jobs",            icon: "fa-solid fa-briefcase",           label: "Jobs" },
  { href: "/student/ai-clone",        icon: "fa-solid fa-robot",               label: "AI Clone" },
];



export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<{ name: string; avatar: string }>({ name: "", avatar: "" });

  useEffect(() => {
    if (!user) return;
    const loadProfile = () => {
      const saved = localStorage.getItem(`student_profile_${user.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.fullName || parsed.avatarUrl)
            setProfileData({ name: parsed.fullName || "", avatar: parsed.avatarUrl || "" });
        } catch (e) {}
      }
      fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setProfileData({ name: json.data.fullName || "", avatar: json.data.avatarUrl || "" });
            const cur = localStorage.getItem(`student_profile_${user.uid}`);
            let merged = json.data;
            if (cur) { try { merged = { ...JSON.parse(cur), ...json.data }; } catch (e) {} }
            localStorage.setItem(`student_profile_${user.uid}`, JSON.stringify(merged));
          }
        })
        .catch((e) => console.error("Error loading profile header:", e));
    };
    loadProfile();
    window.addEventListener("profile_updated", loadProfile);
    return () => window.removeEventListener("profile_updated", loadProfile);
  }, [user]);

  const studentName = profileData.name || user?.name || "Student";
  const avatarUrl = profileData.avatar || "";


  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground font-sans">

        {/* ── Top Navigation Bar ── */}
        <header className="shrink-0 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-zinc-200/50 dark:border-zinc-800/40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-40 gap-4">

          {/* Logo */}
          <Link href="/student/dashboard" className="flex items-center shrink-0">
            <CareerPilotLogo size={28} colored={true} showText={true} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none mx-2"
               style={{ scrollbarWidth: "none" }}>
            {NAV_ITEMS.map((item) => (
              <TopNavItem key={item.href} href={item.href} label={item.label} active={pathname === item.href} />
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Logout (desktop only) */}
            <span
              onClick={() => logout()}
              className="hidden sm:block text-sm font-medium text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors duration-200 cursor-pointer select-none mr-1"
            >
              Logout
            </span>

            {/* Notification Bell */}
            <button className="hidden sm:flex p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all duration-300 relative group cursor-pointer">
              <i className="fa-solid fa-bell w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
            </button>

            <ThemeToggle />

            {/* Profile Avatar */}
            <Link
              href="/student/profile"
              onClick={(e) => {
                if (pathname === "/student/profile") {
                  e.preventDefault();
                  if (window.history.length > 2) router.back();
                  else router.push("/student/dashboard");
                }
              }}
              className="flex items-center gap-2.5 pl-3 ml-1 border-l border-zinc-200/50 dark:border-zinc-800/40 hover:opacity-90 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-white/10 group-hover:scale-105 transition-transform duration-300">
                {avatarUrl
                  ? <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
                  : studentName[0]?.toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{studentName}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Student</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-28 md:pb-8 relative z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

        {/* ── Mobile Bottom Nav — Floating Rounded Glass Bar ── */}
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <div
            className="flex items-stretch overflow-x-auto bg-white/85 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-700/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-1 py-1 gap-0.5"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {NAV_ITEMS.map((item) => (
              <BottomTab
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
              />
            ))}
          </div>
        </nav>

        {/* ── Always-visible AI Twin Chatbot Bubble ── */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openAITwin'))}
          title="Consult AI Twin"
          className="fixed bottom-[5.5rem] md:bottom-8 right-5 z-[60] w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/40 transition-colors flex items-center justify-center cursor-pointer"
        >
          <i className="fa-solid fa-microchip text-xl animate-pulse" />
        </button>

      </div>
    </RoleGuard>
  );
}

// ── Desktop Top Nav Item ──
function TopNavItem({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 relative ${
        active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-white"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-full shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
      )}
    </Link>
  );
}

// ── Mobile Bottom Tab ──
function BottomTab({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 shrink-0 min-w-[60px] px-2 py-1.5 rounded-xl transition-all duration-200 ${
        active
          ? "bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-400"
          : "text-zinc-400 dark:text-zinc-500 active:bg-zinc-100/80 dark:active:bg-zinc-800/50"
      }`}
    >
      <i className={`${icon} text-[18px] transition-transform duration-200 ${active ? "scale-110" : ""}`} />
      <span className={`text-[9px] font-bold tracking-wide whitespace-nowrap ${
        active ? "text-indigo-600 dark:text-indigo-400" : ""
      }`}>{label}</span>
    </Link>
  );
}
