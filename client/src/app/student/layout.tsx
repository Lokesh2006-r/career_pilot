"use client";

import { BrainCircuit, Home, User, FileText, Video, Code, Briefcase, Settings, Bell, Sparkles, TrendingUp, Cpu, Lightbulb, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import CareerPilotLogo, { CareerPilotIcon } from "@/components/CareerPilotLogo";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const studentName = user?.name || "Student";

  return (
    <RoleGuard allowedRoles={["student"]}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
        
        {/* Sleek Floating Glass Sidebar */}
        <aside className="w-20 hover:w-64 group/sidebar border-r border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl flex flex-col transition-all duration-300 ease-out z-30 shrink-0">
          
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
            <NavItem href="/student/dashboard" icon={<Home className="w-5 h-5" />} label="Dashboard" active={pathname === "/student/dashboard"} />
            <NavItem href="/student/resume" icon={<FileText className="w-5 h-5" />} label="Resume Analyzer" active={pathname === "/student/resume"} />
            <NavItem href="/student/resume-builder" icon={<Sparkles className="w-5 h-5" />} label="Resume Builder" active={pathname === "/student/resume-builder"} />
            <NavItem href="/student/mock-interviews" icon={<Video className="w-5 h-5" />} label="AI Mock Interview" active={pathname === "/student/mock-interviews"} />
            <NavItem href="/student/coding" icon={<Code className="w-5 h-5" />} label="Coding Tracker" active={pathname === "/student/coding"} />
            <NavItem href="/student/projects" icon={<Lightbulb className="w-5 h-5" />} label="Project Recs" active={pathname === "/student/projects"} />
            <NavItem href="/student/jobs" icon={<Briefcase className="w-5 h-5" />} label="Internship Recs" active={pathname === "/student/jobs"} />
            <NavItem href="/student/ai-clone" icon={<Cpu className="w-5 h-5" />} label="AI Student Clone" active={pathname === "/student/ai-clone"} />
            <NavItem href="/student/analytics" icon={<TrendingUp className="w-5 h-5" />} label="Analytics" active={pathname === "/student/analytics"} />
          </nav>

          <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/40 space-y-1">
            <NavItem href="/student/settings" icon={<Settings className="w-5 h-5" />} label="Settings" active={pathname === "/student/settings"} />
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-300 text-rose-500 hover:bg-rose-500/10 border border-transparent cursor-pointer group/logout"
            >
              <div className="shrink-0 group-hover/logout:scale-110 transition-transform">
                <LogOut className="w-5 h-5" />
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
          <header className="h-20 flex items-center justify-between px-8 border-b border-zinc-200/50 dark:border-zinc-800/40 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md shrink-0 z-20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <h1 className="text-sm font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                Student Portal / <span className="text-zinc-900 dark:text-white capitalize">{pathname.split("/").pop()?.replace(/-/g, " ") || "Overview"}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm relative group cursor-pointer">
                <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse"></span>
              </button>

              <ThemeToggle />

              <Link 
                href="/student/profile" 
                className="flex items-center gap-3 pl-2 border-l border-zinc-200/50 dark:border-zinc-800/40 hover:opacity-90 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-650 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-white/10 group-hover:scale-105 transition-transform duration-300">
                  {studentName[0]?.toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">{studentName}</p>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450 font-bold uppercase tracking-wider text-[9px]">Student</p>
                </div>
              </Link>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>
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
