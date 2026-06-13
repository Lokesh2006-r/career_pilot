"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<"student" | "recruiter" | "admin">;
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (role && !allowedRoles.includes(role)) {
        // Redirect to their default dashboard if they have the wrong role
        if (role === "student") {
          router.replace("/student/dashboard");
        } else if (role === "recruiter") {
          router.replace("/recruiter/dashboard");
        } else if (role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/login");
        }
      }
    }
  }, [user, role, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground select-none relative overflow-hidden">
        {/* Glow ambient blobs */}
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] -z-10 animate-pulse duration-4000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] -z-10 animate-pulse duration-6000"></div>
        
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center space-y-4 max-w-sm text-center border-zinc-250 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl shadow-xl">
          <i className="fa-solid fa-spinner fa-spin w-10 h-10 text-indigo-500 animate-spin" ></i>
          <h3 className="text-md font-bold tracking-tight">Access Verification</h3>
          <p className="text-xs text-zinc-550 dark:text-zinc-400">Syncing identity keys and role permissions...</p>
        </div>
      </div>
    );
  }

  // Double security check: only render children if authenticated and role is allowed
  if (user && role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // Render a brief blank state while redirection completes
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <i className="fa-solid fa-spinner fa-spin w-6 h-6 text-zinc-400 animate-spin" ></i>
    </div>
  );
}
