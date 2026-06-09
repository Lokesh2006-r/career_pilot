"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";

interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  role: "student" | "recruiter" | "admin" | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateRoleInSandbox: (newRole: "student" | "recruiter" | "admin") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  logout: async () => {},
  updateRoleInSandbox: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<"student" | "recruiter" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync sandbox state
  const syncSandboxAuth = () => {
    if (sessionStatus === "loading") {
      setLoading(true);
      return;
    }
    // 1. If NextAuth session is active, prioritize Google session
    if (session) {
      const nextAuthUser = session.user as any;
      const uid = nextAuthUser.id || nextAuthUser.email || "nextauth-uid";
      const email = nextAuthUser.email || null;
      const name = nextAuthUser.name || "Google Student";
      const determinedRole = email?.includes("admin") ? "admin" : 
                             email?.includes("recruiter") ? "recruiter" : "student";
      
      if (typeof window !== "undefined") {
        if (email) localStorage.setItem("sandbox_user_email", email);
        localStorage.setItem("user_role", determinedRole);
      }
      
      setUser({
        uid: uid,
        email: email,
        name: name,
      });
      setRole(determinedRole);
      setLoading(false);
      return;
    }

    // 2. Otherwise, check localStorage sandbox keys
    const roleSaved = localStorage.getItem("user_role") as any;
    const emailSaved = localStorage.getItem("sandbox_user_email") || `${roleSaved || "guest"}@careerpilot.com`;
    const profileSaved = localStorage.getItem(`student_profile_${emailSaved}`);
    
    if (roleSaved) {
      try {
        let name = "Sandbox User";
        if (profileSaved) {
          const parsed = JSON.parse(profileSaved);
          name = parsed.fullName || name;
        }
        setUser({
          uid: emailSaved,
          email: emailSaved,
          name: name,
        });
        setRole(roleSaved);
      } catch (e) {
        setUser({
          uid: emailSaved,
          email: emailSaved,
          name: "Sandbox User",
        });
        setRole(roleSaved);
      }
    } else {
      setUser(null);
      setRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 1. Sandbox Mode
    if (!isFirebaseConfigured) {
      // Monitor localStorage changes or sync on load
      syncSandboxAuth();
      const handleStorageChange = () => syncSandboxAuth();
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("profile_updated", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("profile_updated", handleStorageChange);
      };
    }

    // 2. Real Firebase Mode
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Logged in with Firebase
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        });
        
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || "student");
          } else {
            // Default doc creation if missing
            const defaultRole = firebaseUser.email?.includes("admin") ? "admin" : 
                                firebaseUser.email?.includes("recruiter") ? "recruiter" : "student";
            await setDoc(doc(db, "users", firebaseUser.uid), {
              email: firebaseUser.email,
              role: defaultRole,
              createdAt: new Date(),
            });
            setRole(defaultRole);
          }
        } catch (err) {
          console.error("Error fetching user role from firestore:", err);
          setRole("student"); // Fallback
        }
        setLoading(false);
      } else if (session) {
        // Logged in with NextAuth (Google)
        const nextAuthUser = session.user as any;
        const uid = nextAuthUser.id || nextAuthUser.email || "nextauth-uid";
        setUser({
          uid: uid,
          email: nextAuthUser.email || null,
          name: nextAuthUser.name || null,
        });

        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || "student");
          } else {
            const defaultRole = nextAuthUser.email?.includes("admin") ? "admin" : 
                                nextAuthUser.email?.includes("recruiter") ? "recruiter" : "student";
            await setDoc(doc(db, "users", uid), {
              email: nextAuthUser.email,
              role: defaultRole,
              createdAt: new Date(),
            }, { merge: true });
            setRole(defaultRole);
          }
        } catch (err) {
          console.error("Error syncing NextAuth user role:", err);
          setRole("student");
        }
        setLoading(false);
      } else if (sessionStatus !== "loading") {
        // Not logged in either
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [session, sessionStatus]);

  const logout = async () => {
    if (!isFirebaseConfigured) {
      localStorage.removeItem("user_role");
      localStorage.removeItem("sandbox_user_email");
      setUser(null);
      setRole(null);
      window.dispatchEvent(new Event("profile_updated"));
      try {
        await nextAuthSignOut({ callbackUrl: "/login" });
      } catch (err) {
        console.error("NextAuth logout failed:", err);
        window.location.href = "/login";
      }
      return;
    }

    try {
      await firebaseSignOut(auth);
      setUser(null);
      setRole(null);
      await nextAuthSignOut({ callbackUrl: "/login" });
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/login";
    }
  };

  const updateRoleInSandbox = (newRole: "student" | "recruiter" | "admin") => {
    if (!isFirebaseConfigured) {
      localStorage.setItem("user_role", newRole);
      setRole(newRole);
      syncSandboxAuth();
      window.dispatchEvent(new Event("profile_updated"));
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, updateRoleInSandbox }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
