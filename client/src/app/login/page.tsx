"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainCircuit, AlertTriangle, ArrowRight, Mail, Lock, ShieldAlert } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { CareerPilotIcon } from "@/components/CareerPilotLogo";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Students must use Google, form login is restricted to Admin/Recruiter emails.
    if (cleanEmail !== "admin@gmail.com" && cleanEmail !== "recruiter@gmail.com") {
      setError("Students must sign in using the 'Sign in with Google' option below.");
      return;
    }

    if (!isFirebaseConfigured) {
      setLoading(true);
      setError("");
      setTimeout(() => {
        const namePart = cleanEmail.split("@")[0] || "User";
        const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const determinedRole = cleanEmail === "admin@gmail.com" ? "admin" : "recruiter";
        
        localStorage.setItem("sandbox_user_email", cleanEmail);
        localStorage.setItem(`student_profile_${cleanEmail}`, JSON.stringify({ fullName: capitalizedName }));
        localStorage.setItem("user_role", determinedRole);
        window.dispatchEvent(new Event("profile_updated"));
        
        router.push("/dashboard");
        setLoading(false);
      }, 800);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' }, { prompt: 'select_account' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Removed Firebase email/password login (not applicable with NextAuth)
  // You can implement custom credentials provider if needed.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background text-foreground select-none">
      
      {/* Background Mesh Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[10000ms]"></div>

      {/* Floating Theme Toggle in corner */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        


        {/* Core Glass Card */}
        <div className="glass-panel rounded-[2rem] shadow-xl p-8 border-zinc-250 dark:border-zinc-800/40 relative overflow-hidden bg-white/40 dark:bg-zinc-950/40">
          <div className="flex flex-col items-center mb-8 text-center space-y-2">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/20 dark:border-zinc-800/40 shadow-sm mb-3">
              <CareerPilotIcon size={44} colored={true} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Identity Access</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Sign in to your CareerPilot dashboard</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 mb-6">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  suppressHydrationWarning
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950/50 border border-zinc-250 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 outline-none focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Password</label>
                <Link href="#" className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-500 hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  suppressHydrationWarning
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950/50 border border-zinc-250 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 outline-none focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" suppressHydrationWarning className="rounded-md border-zinc-300 dark:border-zinc-800 text-indigo-650 focus:ring-indigo-550 h-4 w-4" />
                <span className="text-zinc-550 dark:text-zinc-400 font-semibold">Remember profile session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer border border-white/5 shadow-md mt-2"
            >
              {loading ? "Authorizing Identity..." : "Authorize Identity"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4 text-zinc-400">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-850"></div>
            <span className="text-[10px] font-black uppercase tracking-wider">Alternative Sync</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-850"></div>
          </div>

          {/* Google login button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-zinc-950/40 text-zinc-900 dark:text-white border border-zinc-250 dark:border-zinc-850 hover:border-indigo-500/20 rounded-xl font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-xs text-zinc-500 font-semibold">
            Don&apos;t have an identity account?{" "}
            <Link href="/signup" className="text-indigo-500 hover:underline">
              Create Agent
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
