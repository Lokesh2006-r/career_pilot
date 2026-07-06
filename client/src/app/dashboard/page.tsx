"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


export default function DashboardGateway() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (role === "student") {
        router.replace("/student/dashboard");
      } else if (role === "recruiter") {
        router.replace("/recruiter/dashboard");
      } else if (role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, role, loading, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground select-none relative overflow-hidden">
      {/* Mesh Glow Background */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[10000ms]"></div>

      <div className="glass-panel p-8 rounded-3xl flex flex-col items-center space-y-4 max-w-sm text-center border-zinc-250 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl shadow-xl">
        <i className="fa-solid fa-spinner fa-spin w-10 h-10 text-zinc-900 dark:text-white animate-spin" ></i>
        <h3 className="text-md font-bold tracking-tight">Routing Session</h3>
        <p className="text-xs text-zinc-550 dark:text-zinc-400">Determining role profile and loading appropriate workspace...</p>
      </div>
    </div>
  );
}
