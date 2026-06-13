"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

import ThemeToggle from "@/components/ThemeToggle";
import { CareerPilotIcon } from "@/components/CareerPilotLogo";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [languages, setLanguages] = useState("");
  const [skills, setSkills] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (!isFirebaseConfigured) {
      setLoading(true);
      setError("");
      setTimeout(() => {
        const cleanEmail = email.trim().toLowerCase();
        const finalName = name.trim() || (cleanEmail.split("@")[0].charAt(0).toUpperCase() + cleanEmail.split("@")[0].slice(1));
        
        localStorage.setItem("sandbox_user_email", cleanEmail);
        localStorage.setItem(`student_profile_${cleanEmail}`, JSON.stringify({ 
          fullName: finalName,
          languages: languages,
          skills: skills
        }));
        localStorage.setItem("user_role", role);
        window.dispatchEvent(new Event("profile_updated"));
        router.push("/dashboard");
        setLoading(false);
      }, 800);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        name: name,
        languages: languages,
        skills: skills,
        role: role,
        createdAt: new Date(),
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!isFirebaseConfigured) {
      setLoading(true);
      setError("");
      setTimeout(() => {
        const mockEmail = `${role}@careerpilot.com`;
        localStorage.setItem("sandbox_user_email", mockEmail);
        localStorage.setItem(`student_profile_${mockEmail}`, JSON.stringify({ fullName: "Google Student" }));
        localStorage.setItem("user_role", role);
        window.dispatchEvent(new Event("profile_updated"));
        router.push("/dashboard");
        setLoading(false);
      }, 800);
      return;
    }
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        role: role,
        createdAt: new Date(),
      }, { merge: true });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim());
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    const mockEmail = `${role}@careerpilot.com`;
    localStorage.setItem("sandbox_user_email", mockEmail);
    localStorage.setItem(`student_profile_${mockEmail}`, JSON.stringify({ fullName: "Sandbox Guest" }));
    localStorage.setItem("user_role", role);
    window.dispatchEvent(new Event("profile_updated"));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-background text-foreground select-none">
      
      {/* Background Mesh Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[10000ms]"></div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Firebase Config bypassed warning */}
        {!isFirebaseConfigured && (
          <div className="glass-panel border-amber-500/20 dark:border-amber-500/10 bg-amber-500/5 backdrop-blur-xl rounded-2xl p-4 flex gap-3.5 shadow-sm">
            <i className="fa-solid fa-triangle-exclamation w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" ></i>
            <div className="text-xs font-medium">
              <p className="font-extrabold text-amber-500 uppercase tracking-wider mb-1">Sandbox Active</p>
              <p className="text-zinc-550 dark:text-zinc-400 mb-2 leading-relaxed">
                Authentication services are not configured. You can skip directly to the dashboard to test the premium features.
              </p>
              <button 
                onClick={handleDevBypass} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-550 text-white rounded-lg font-bold uppercase tracking-wider text-[9px] hover:bg-amber-600 transition-all cursor-pointer shadow-sm"
              >
                Skip Auth to Dashboard
                <i className="fa-solid fa-arrow-right w-3 h-3" ></i>
              </button>
            </div>
          </div>
        )}

        {/* Core Glass Card */}
        <div className="glass-panel rounded-[2rem] shadow-xl p-8 border-zinc-250 dark:border-zinc-800/40 relative overflow-hidden bg-white/40 dark:bg-zinc-950/40">
          <div className="flex flex-col items-center mb-8 text-center space-y-2">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/20 dark:border-zinc-800/40 shadow-sm mb-3">
              <CareerPilotIcon size={44} colored={true} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Create Identity</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Join CareerPilot ecosystem today</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 mb-6">
              <i className="fa-solid fa-shield-halved w-4 h-4 shrink-0" ></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Full Name</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" ></i>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950/50 border border-zinc-250 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 outline-none focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Email Address</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" ></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950/50 border border-zinc-250 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 outline-none focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Password</label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" ></i>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950/50 border border-zinc-250 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 outline-none focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Confirm Password</label>
                <div className="relative">
                  <i className="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" ></i>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950/50 border border-zinc-250 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 outline-none focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Programming Languages</label>
              <div className="relative">
                <i className="fa-solid fa-language absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" ></i>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. Python, JavaScript, C++"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950/50 border border-zinc-250 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 outline-none focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">Core Skills</label>
              <div className="relative">
                <i className="fa-solid fa-code absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" ></i>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, Next.js"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950/50 border border-zinc-250 dark:border-zinc-850 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 outline-none focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer border border-white/5 shadow-md mt-4"
            >
              {loading ? "Creating Identity..." : "Create Identity"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4 text-zinc-400">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-850"></div>
            <span className="text-[10px] font-black uppercase tracking-wider">Alternative Sync</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-850"></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-zinc-950/40 text-zinc-900 dark:text-white border border-zinc-250 dark:border-zinc-850 hover:border-indigo-500/20 rounded-xl font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <p className="mt-8 text-center text-xs text-zinc-500 font-semibold">
            Already have an identity account?{" "}
            <Link href="/login" className="text-indigo-500 hover:underline">
              Access Identity
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
