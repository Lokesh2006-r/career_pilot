"use client";


import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    fullName: "Alex Johnson",
    headline: "Computer Science Student | React & Node.js",
    location: "Bangalore, India",
    email: "alex.johnson@example.com",
    phone: "+91 98765 43210",
    university: "National Institute of Technology",
    degree: "B.Tech CS",
    gradYear: "2026",
    github: "github.com/alexj",
    linkedin: "linkedin.com/in/alexj",
    portfolio: "alexj.dev",
    avatarUrl: ""
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const merged = {
              ...profile,
              ...json.data,
              fullName: json.data.fullName || user.name || profile.fullName,
              email: json.data.email || user.email || profile.email
            };
            setProfile(merged);
            localStorage.setItem(`student_profile_${user.uid}`, JSON.stringify(merged));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error loading profile from DB:", err);
      }

      // Local storage fallback
      const saved = localStorage.getItem(`student_profile_${user.uid}`);
      if (saved) {
        try {
          setProfile(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Initialize dynamic Google data
        setProfile(prev => ({
          ...prev,
          fullName: user.name || "Alex Johnson",
          email: user.email || "alex.johnson@example.com"
        }));
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (user) {
      localStorage.setItem(`student_profile_${user.uid}`, JSON.stringify(profile));
      try {
        await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(profile)
        });
      } catch (err) {
        console.error("Failed to sync profile to server:", err);
      }
    }
    setIsEditing(false);
    setShowToast(true);
    window.dispatchEvent(new Event('profile_updated'));
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Premium Glass Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-white/80 dark:bg-zinc-950/80 border border-emerald-500/30 text-emerald-500 px-5 py-3.5 rounded-2xl backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <i className="fa-regular fa-circle-check w-5 h-5 animate-pulse" ></i>
          <span className="font-extrabold text-xs uppercase tracking-wider">Profile synced successfully!</span>
        </div>
      )}

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Manage and sync your student profile identity variables.</p>
        </div>
        
        {isEditing ? (
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)] active:scale-95 transition-all cursor-pointer border border-white/10"
          >
            <i className="fa-solid fa-floppy-disk w-4 h-4" ></i>
            Save Identity
          </button>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:border-indigo-500/30 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm cursor-pointer"
          >
            <i className="fa-solid fa-pencil w-4 h-4 text-indigo-500" ></i>
            Edit Credentials
          </button>
        )}
      </header>

      {/* Main Profile Layout Card */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        {/* Banner with Animated Gradient mesh */}
        <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-650 to-cyan-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0c_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          
          {/* Edit button in the top-right corner of the banner */}
          <div className="absolute top-4 right-4 z-10">
            {isEditing ? (
              <button 
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-650 hover:to-teal-650 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-floppy-disk w-3.5 h-3.5" ></i>
                Save Identity
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-black/60 hover:bg-black/80 text-white border border-white/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <i className="fa-solid fa-pencil w-3.5 h-3.5 text-indigo-400" ></i>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="px-8 pb-8">
          {/* Avatar Area */}
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="relative group/avatar">
              <div className="w-32 h-32 bg-white dark:bg-zinc-950 rounded-3xl p-1.5 border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Profile" className="w-full h-full rounded-2xl object-cover shadow-inner" />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-650 flex items-center justify-center text-4xl font-black text-white uppercase shadow-inner border border-white/10">
                    {profile.fullName ? profile.fullName.charAt(0) : "A"}
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-1 right-1 p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg border border-white/20 active:scale-95 transition-all cursor-pointer">
                  <i className="fa-solid fa-camera w-4 h-4" ></i>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfile({ ...profile, avatarUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Basic Info & Contact */}
            <div className="space-y-8">
              {/* Basic Info panel */}
              <div className="space-y-5">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <i className="fa-solid fa-user w-4.5 h-4.5 text-indigo-500" ></i>
                  Identity Details
                </h2>
                <div className="space-y-4">
                  <InputField 
                    label="Full Name" 
                    value={profile.fullName} 
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    disabled={!isEditing} 
                  />
                  <InputField 
                    label="Profile Headline" 
                    value={profile.headline} 
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    disabled={!isEditing} 
                  />
                  <InputField 
                    label="Location coordinates" 
                    value={profile.location} 
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    icon={<i className="fa-solid fa-location-dot w-4 h-4" ></i>} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>

              {/* Contact panel */}
              <div className="space-y-5 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-6">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <i className="fa-solid fa-envelope w-4.5 h-4.5 text-indigo-500" ></i>
                  Communication Interfaces
                </h2>
                <div className="space-y-4">
                  <InputField 
                    label="Email Address" 
                    value={profile.email} 
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    type="email" 
                    disabled={!isEditing} 
                  />
                  <InputField 
                    label="Phone Vector Number" 
                    value={profile.phone} 
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    type="tel" 
                    icon={<i className="fa-solid fa-phone w-4 h-4" ></i>} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Education & Social Links */}
            <div className="space-y-8">
              {/* Education panel */}
              <div className="space-y-5">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <i className="fa-solid fa-graduation-cap w-4.5 h-4.5 text-indigo-500" ></i>
                  Academic History
                </h2>
                <div className="space-y-4">
                  <InputField 
                    label="University Entity" 
                    value={profile.university} 
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    disabled={!isEditing} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField 
                      label="Degree Model" 
                      value={profile.degree} 
                      onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                      disabled={!isEditing} 
                    />
                    <InputField 
                      label="Graduation Period" 
                      value={profile.gradYear} 
                      onChange={(e) => setProfile({ ...profile, gradYear: e.target.value })}
                      disabled={!isEditing} 
                    />
                  </div>
                </div>
              </div>

              {/* Social Links panel */}
              <div className="space-y-5 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-6">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <i className="fa-solid fa-link w-4.5 h-4.5 text-indigo-500" ></i>
                  Profile Links indices
                </h2>
                <div className="space-y-4">
                  <InputField 
                    label="GitHub profile link" 
                    value={profile.github} 
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    icon={<i className="fa-brands fa-github w-4 h-4" ></i>} 
                    disabled={!isEditing} 
                  />
                  <InputField 
                    label="LinkedIn connection" 
                    value={profile.linkedin} 
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    icon={<i className="fa-brands fa-linkedin w-4 h-4" ></i>} 
                    disabled={!isEditing} 
                  />
                  <InputField 
                    label="Personal Domain / Portfolio" 
                    value={profile.portfolio} 
                    onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                    icon={<i className="fa-solid fa-briefcase w-4 h-4" ></i>} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", disabled, icon }: { label: string; value: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-500">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className={`w-full py-3.5 rounded-xl border text-xs font-semibold ${
            disabled 
              ? "bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed" 
              : "bg-white dark:bg-zinc-900/60 border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          } ${icon ? "pl-11" : "px-4"} transition-all duration-300 shadow-sm outline-none`}
        />
      </div>
    </div>
  );
}
