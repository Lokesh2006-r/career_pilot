"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/RoleGuard";
import CareerPilotLogo, { CareerPilotIcon } from "@/components/CareerPilotLogo";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const recruiterName = user?.name || "Recruiter";

  return (
    <RoleGuard allowedRoles={["recruiter"]}>
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
            <MobileNavItem href="/recruiter/dashboard" icon={<i className="fa-solid fa-house w-5 h-5" ></i>} label="Dashboard" active={pathname === "/recruiter/dashboard"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/recruiter/search" icon={<i className="fa-solid fa-magnifying-glass w-5 h-5" ></i>} label="Candidate Search" active={pathname === "/recruiter/search"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/recruiter/shortlist" icon={<i className="fa-solid fa-user-check w-5 h-5" ></i>} label="Shortlisted" active={pathname === "/recruiter/shortlist"} onClick={() => setIsSidebarOpen(false)} />
            <MobileNavItem href="/recruiter/analytics" icon={<i className="fa-solid fa-arrow-trend-up w-5 h-5" ></i>} label="Analytics" active={pathname === "/recruiter/analytics"} onClick={() => setIsSidebarOpen(false)} />
          </nav>

          <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/40 space-y-1">
            <MobileNavItem href="/recruiter/settings" icon={<i className="fa-solid fa-gear w-5 h-5" ></i>} label="Settings" active={pathname === "/recruiter/settings"} onClick={() => setIsSidebarOpen(false)} />
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
            <NavItem href="/recruiter/dashboard" icon={<i className="fa-solid fa-house w-5 h-5" ></i>} label="Dashboard" active={pathname === "/recruiter/dashboard"} />
            <NavItem href="/recruiter/search" icon={<i className="fa-solid fa-magnifying-glass w-5 h-5" ></i>} label="Candidate Search" active={pathname === "/recruiter/search"} />
            <NavItem href="/recruiter/shortlist" icon={<i className="fa-solid fa-user-check w-5 h-5" ></i>} label="Shortlisted" active={pathname === "/recruiter/shortlist"} />
            <NavItem href="/recruiter/analytics" icon={<i className="fa-solid fa-arrow-trend-up w-5 h-5" ></i>} label="Analytics" active={pathname === "/recruiter/analytics"} />
          </nav>

          <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/40 space-y-1">
            <NavItem href="/recruiter/settings" icon={<i className="fa-solid fa-gear w-5 h-5" ></i>} label="Settings" active={pathname === "/recruiter/settings"} />
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
                <i className="fa-solid fa-bars w-5 h-5 text-zinc-650 dark:text-zinc-400" ></i>
              </button>
              <i className="fa-solid fa-wand-magic-sparkles w-4 h-4 text-zinc-900 dark:text-white animate-pulse shrink-0" ></i>
              <h1 className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase truncate">
                Recruiter Portal / <span className="text-zinc-900 dark:text-white capitalize">{pathname.split("/").pop()?.replace(/-/g, " ") || "Overview"}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden sm:block p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm relative group cursor-pointer">
                <i className="fa-solid fa-bell w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" ></i>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-zinc-900 dark:bg-white rounded-full ring-2 ring-white dark:ring-zinc-900 animate-pulse"></span>
              </button>

              <ThemeToggle />

              <div className="flex items-center gap-3 pl-2 border-l border-zinc-200/50 dark:border-zinc-800/40">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-650 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-white/10">
                  {recruiterName[0]?.toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{recruiterName}</p>
                  <p className="text-xs text-zinc-550 dark:text-zinc-450 font-bold uppercase tracking-wider text-[9px]">Recruiter</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-lg border-t border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-around px-2 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <BottomTabItem href="/recruiter/dashboard" icon={<i className="fa-solid fa-house w-5 h-5" ></i>} label="Overview" active={pathname === "/recruiter/dashboard"} />
            <BottomTabItem href="/recruiter/search" icon={<i className="fa-solid fa-magnifying-glass w-5 h-5" ></i>} label="Search" active={pathname === "/recruiter/search"} />
            <BottomTabItem href="/recruiter/shortlist" icon={<i className="fa-solid fa-user-check w-5 h-5" ></i>} label="Shortlist" active={pathname === "/recruiter/shortlist"} />
            <BottomTabItem href="/recruiter/analytics" icon={<i className="fa-solid fa-arrow-trend-up w-5 h-5" ></i>} label="Analytics" active={pathname === "/recruiter/analytics"} />
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
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-none"
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
        <span className="absolute left-0 w-1 h-5 bg-zinc-900 dark:bg-white rounded-r-full shadow-none"></span>
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
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-none"
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
        <span className="absolute left-0 w-1 h-5 bg-zinc-900 dark:bg-white rounded-r-full shadow-none"></span>
      )}
    </Link>
  );
}

function BottomTabItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300 ${
        active
          ? "text-zinc-900 dark:text-white scale-105"
          : "text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200"
      }`}
    >
      <div className="shrink-0 transition-transform duration-300">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider">
        {label}
      </span>
    </Link>
  );
}

