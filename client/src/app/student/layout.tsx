"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import CareerPilotLogo, { CareerPilotIcon } from "@/components/CareerPilotLogo";
import { API_BASE_URL } from "@/lib/api";
import { useEffect } from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<{name: string, avatar: string}>({ name: "", avatar: "" });

  useEffect(() => {
    if (!user) return;
    const loadProfile = () => {
      const saved = localStorage.getItem(`student_profile_${user.uid}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.fullName || parsed.avatarUrl) {
            setProfileData({ name: parsed.fullName || "", avatar: parsed.avatarUrl || "" });
          }
        } catch (e) {}
      }
      
      // Always fetch to ensure we have the latest
      fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setProfileData({ name: json.data.fullName || "", avatar: json.data.avatarUrl || "" });
            // Merge with local storage
            const currentSaved = localStorage.getItem(`student_profile_${user.uid}`);
            let merged = json.data;
            if (currentSaved) {
              try { merged = { ...JSON.parse(currentSaved), ...json.data }; } catch (e) {}
            }
            localStorage.setItem(`student_profile_${user.uid}`, JSON.stringify(merged));
          }
        })
        .catch(e => console.error("Error loading profile header:", e));
    };
    
    loadProfile();
    const handleProfileUpdate = () => loadProfile();
    window.addEventListener('profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('profile_updated', handleProfileUpdate);
  }, [user]);
  
  const studentName = profileData.name || user?.name || "Student";
  const avatarUrl = profileData.avatar || "";

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/40 z-50 md:hidden flex flex-col transition-transform duration-300 ease-out shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="h-20 flex items-center justify-between px-5 border-b border-zinc-200/50 dark:border-zinc-800/40 shrink-0">
            <CareerPilotLogo size={32} colored={true} showText={true} />
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg border border-zinc-250 dark:border-zinc-850 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <i className="fa-solid fa-xmark w-4 h-4" ></i>
            </button>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
            <MobileNavItem href="/student/dashboard" icon={<i className="fa-solid fa-house w-5 h-5" ></i>} label="Dashboard" active={pathname === "/student/dashboard"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/student/resume" icon={<i className="fa-solid fa-file-lines w-5 h-5" ></i>} label="Resume Analyzer" active={pathname === "/student/resume"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/student/resume-builder" icon={<i className="fa-solid fa-wand-magic-sparkles w-5 h-5" ></i>} label="Resume Builder" active={pathname === "/student/resume-builder"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/student/mock-interviews" icon={<i className="fa-solid fa-video w-5 h-5" ></i>} label="AI Mock Interview" active={pathname === "/student/mock-interviews"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/student/coding" icon={<i className="fa-solid fa-code w-5 h-5" ></i>} label="Coding Tracker" active={pathname === "/student/coding"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/student/projects" icon={<i className="fa-solid fa-lightbulb w-5 h-5" ></i>} label="Project Recs" active={pathname === "/student/projects"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/student/jobs" icon={<i className="fa-solid fa-briefcase w-5 h-5" ></i>} label="Internship/Job Offers Feed" active={pathname === "/student/jobs"} onClick={() => setIsSidebarOpen(false)} />
          </nav>

          <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/40 space-y-1">
            <MobileNavItem href="/student/settings" icon={<i className="fa-solid fa-gear w-5 h-5" ></i>} label="Settings" active={pathname === "/student/settings"} onClick={() => setIsSidebarOpen(false)} />
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 text-rose-500 hover:bg-rose-500/10 border border-transparent cursor-pointer group/logout"
            >
              <div className="shrink-0 group-hover/logout:scale-110 transition-transform">
                <i className="fa-solid fa-right-from-bracket w-5 h-5" ></i>
              </div>
              <span className="font-semibold text-sm tracking-wide">
                Sign Out
              </span>
            </button>
          </div>
        </aside>

        {/* Sleek Floating Glass Sidebar (Desktop) */}
        <aside className="hidden md:flex w-20 hover:w-64 group/sidebar border-r border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl flex flex-col transition-all duration-300 ease-out z-30 shrink-0">
          
          <div className="h-20 flex items-center px-4.5 border-b border-zinc-200/50 dark:border-zinc-800/40 overflow-hidden shrink-0">
            {/* Collapsed Sidebar Icon */}
            <div className="group-hover/sidebar:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/20 shadow-sm shrink-0">
              <CareerPilotIcon size={26} colored={true} />
            </div>
            {/* Expanded Sidebar Logo */}
            <div className="hidden group-hover/sidebar:block animate-fade-in">
              <CareerPilotLogo size={32} colored={true} showText={true} />
            </div>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
            <NavItem href="/student/dashboard" icon={<i className="fa-solid fa-house w-5 h-5" ></i>} label="Dashboard" active={pathname === "/student/dashboard"} />
            <NavItem href="/student/resume" icon={<i className="fa-solid fa-file-lines w-5 h-5" ></i>} label="Resume Analyzer" active={pathname === "/student/resume"} />
            <NavItem href="/student/resume-builder" icon={<i className="fa-solid fa-wand-magic-sparkles w-5 h-5" ></i>} label="Resume Builder" active={pathname === "/student/resume-builder"} />
            <NavItem href="/student/mock-interviews" icon={<i className="fa-solid fa-video w-5 h-5" ></i>} label="AI Mock Interview" active={pathname === "/student/mock-interviews"} />
            <NavItem href="/student/coding" icon={<i className="fa-solid fa-code w-5 h-5" ></i>} label="Coding Tracker" active={pathname === "/student/coding"} />
            <NavItem href="/student/projects" icon={<i className="fa-solid fa-lightbulb w-5 h-5" ></i>} label="Project Recs" active={pathname === "/student/projects"} />
            <NavItem href="/student/jobs" icon={<i className="fa-solid fa-briefcase w-5 h-5" ></i>} label="Internship/Job Offers Feed" active={pathname === "/student/jobs"} />
          </nav>

          <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/40 space-y-1">
            <NavItem href="/student/settings" icon={<i className="fa-solid fa-gear w-5 h-5" ></i>} label="Settings" active={pathname === "/student/settings"} />
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 text-rose-500 hover:bg-rose-500/10 border border-transparent cursor-pointer group/logout"
            >
              <div className="shrink-0 group-hover/logout:scale-110 transition-transform">
                <i className="fa-solid fa-right-from-bracket w-5 h-5" ></i>
              </div>
              <span className="font-semibold text-sm tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Sign Out
              </span>
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top Header Bar */}
          <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-zinc-200/50 dark:border-zinc-800/40 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md shrink-0 z-20">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-all duration-300 mr-2 shrink-0 cursor-pointer"
              >
                <i className="fa-solid fa-bars w-5 h-5 text-zinc-600 dark:text-zinc-400" ></i>
              </button>
              <i className="fa-solid fa-wand-magic-sparkles w-4 h-4 text-indigo-500 animate-pulse shrink-0" ></i>
              <h1 className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase truncate">
                Student Portal / <span className="text-zinc-900 dark:text-white capitalize">{pathname.split("/").pop()?.replace(/-/g, " ") || "Overview"}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden sm:block p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm relative group cursor-pointer">
                <i className="fa-solid fa-bell w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" ></i>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse"></span>
              </button>

              <ThemeToggle />

              <Link 
                href="/student/profile" 
                onClick={(e) => {
                  if (pathname === "/student/profile") {
                    e.preventDefault();
                    if (window.history.length > 2) {
                      router.back();
                    } else {
                      router.push("/student/dashboard");
                    }
                  }
                }}
                className="flex items-center gap-3 pl-2 border-l border-zinc-200/50 dark:border-zinc-800/40 hover:opacity-90 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-650 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-white/10 group-hover:scale-105 transition-transform duration-300">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
                  ) : (
                    studentName[0]?.toUpperCase()
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{studentName}</p>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450 font-bold uppercase tracking-wider text-[9px]">Student</p>
                </div>
              </Link>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-28 md:pb-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation Bar - Scrollable with all items */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200/50 dark:border-zinc-800/40 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center overflow-x-auto scrollbar-none px-1 py-1 gap-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <BottomTabItem href="/student/dashboard" icon={<i className="fa-solid fa-house w-[18px] h-[18px]" ></i>} label="Overview" active={pathname === "/student/dashboard"} />
              <BottomTabItem href="/student/resume" icon={<i className="fa-solid fa-file-lines w-[18px] h-[18px]" ></i>} label="Resume" active={pathname === "/student/resume"} />
              <BottomTabItem href="/student/resume-builder" icon={<i className="fa-solid fa-wand-magic-sparkles w-[18px] h-[18px]" ></i>} label="Builder" active={pathname === "/student/resume-builder"} />
              <BottomTabItem href="/student/mock-interviews" icon={<i className="fa-solid fa-video w-[18px] h-[18px]" ></i>} label="Interview" active={pathname === "/student/mock-interviews"} />
              <BottomTabItem href="/student/coding" icon={<i className="fa-solid fa-code w-[18px] h-[18px]" ></i>} label="Coding" active={pathname === "/student/coding"} />
              <BottomTabItem href="/student/projects" icon={<i className="fa-solid fa-lightbulb w-[18px] h-[18px]" ></i>} label="Projects" active={pathname === "/student/projects"} />
              <BottomTabItem href="/student/jobs" icon={<i className="fa-solid fa-briefcase w-[18px] h-[18px]" ></i>} label="Jobs" active={pathname === "/student/jobs"} />
              <BottomTabItem href="/student/settings" icon={<i className="fa-solid fa-gear w-[18px] h-[18px]" ></i>} label="Settings" active={pathname === "/student/settings"} />
            </div>
          </nav>
        </div>
      </div>
    </RoleGuard>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 group/item relative ${
        active
          ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(99,102,241,0.1)]"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-white border border-transparent"
      }`}
    >
      <div className="shrink-0 group-hover/item:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className="font-semibold text-sm tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {label}
      </span>
      {active && (
        <span className="absolute left-0 w-1 h-5 bg-indigo-500 dark:bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
      )}
    </Link>
  );
}

function MobileNavItem({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 group/item relative ${
        active
          ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_15px_rgba(99,102,241,0.1)]"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 hover:text-zinc-900 dark:hover:text-white border border-transparent"
      }`}
    >
      <div className="shrink-0 group-hover/item:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className="font-semibold text-sm tracking-wide">
        {label}
      </span>
      {active && (
        <span className="absolute left-0 w-1 h-5 bg-indigo-500 dark:bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
      )}
    </Link>
  );
}

function BottomTabItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 shrink-0 w-16 py-2 px-1 rounded-xl transition-all duration-200 ${
        active
          ? "text-indigo-500 dark:text-indigo-400 bg-indigo-500/10"
          : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      }`}
    >
      <div className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-wider leading-tight text-center truncate w-full text-center ${active ? "text-indigo-500 dark:text-indigo-400" : ""}`}>
        {label}
      </span>
      {active && <span className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5" />}
    </Link>
  );
}
