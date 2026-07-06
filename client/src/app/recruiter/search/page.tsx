"use client";

import { useState, useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import ReactMarkdown from 'react-markdown';

// ... (keeping Candidate and Message interfaces, MOCK_CANDIDATES array unchanged)
interface Candidate {
  id: string;
  name: string;
  roleTarget: string;
  atsScore: number;
  leetcodeSolved: number;
  leetcodeStreak: number;
  skills: string[];
  personalityPrompt: string;
  avatar: string;
  email: string;
  education: string;
  projectsCount: number;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}



export default function CandidateSearch() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("All");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load shortlisted candidates on mount/user changes
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`shortlisted_candidates_${user.uid}`);
    if (saved) {
      try {
        setShortlisted(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  // Load live candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recruiter/candidates`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCandidates(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
      }
    };
    fetchCandidates();
  }, []);

  // Track searches in local storage
  useEffect(() => {
    if (!user || !searchQuery.trim()) return;
    const timer = setTimeout(() => {
      const key = `recruiter_analytics_searches_${user.uid}`;
      const current = parseInt(localStorage.getItem(key) || "0", 10);
      localStorage.setItem(key, (current + 1).toString());
    }, 1000); // 1s debounce to avoid counting every keystroke
    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  // Auto-scroll chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isDrawerOpen]);

  // Reset chat when candidate changes
  useEffect(() => {
    if (selectedCandidate) {
      setChatMessages([
        {
          role: 'model',
          content: `Hello! I am ${selectedCandidate.name}'s AI Twin. I have been loaded with their real resume profile, skills registry, and coding progress telemetry. Ask me anything about their engineering background!`
        }
      ]);
    }
  }, [selectedCandidate]);

  const handleOpenDrawer = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
  };

  const handleToggleShortlist = (id: string) => {
    if (!user) return;
    const key = `shortlisted_candidates_${user.uid}`;
    if (shortlisted.includes(id)) {
      const updated = shortlisted.filter(x => x !== id);
      setShortlisted(updated);
      localStorage.setItem(key, JSON.stringify(updated));
    } else {
      const updated = [...shortlisted, id];
      setShortlisted(updated);
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending || !selectedCandidate) return;

    const userMessage: Message = { role: 'user', content: inputVal };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setInputVal("");
    setIsSending(true);

    if (user) {
      const chatKey = `recruiter_analytics_chats_${user.uid}`;
      const currentChats = parseInt(localStorage.getItem(chatKey) || "0", 10);
      localStorage.setItem(chatKey, (currentChats + 1).toString());
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/recruiter/clone-chat/${selectedCandidate.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: updatedMessages
        }),
      });
      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else if (data.error) {
        setChatMessages(prev => [...prev, { role: 'model', content: `[System]: ${data.error}` }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', content: "I encountered an issue syncing. Let me retry." }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', content: "Failed to connect to candidate's Twin node. Ensure local server is active." }]);
    } finally {
      setIsSending(false);
    }
  };

  // Collect all unique skills
  const allSkills = Array.from(new Set(candidates.flatMap(c => c.skills)));

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.roleTarget.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = selectedSkill === "All" || c.skills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Top filter section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Talent Search & Screening</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Directly screen matching index distributions or interview their artificial twin clone.</p>
        </div>
      </header>

      {/* Filter and Search Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <i className="fa-solid fa-magnifying-glass w-5 h-5 text-zinc-450 absolute left-4 top-1/2 transform -translate-y-1/2" ></i>
          <input
            type="text"
            placeholder="Search candidates by name, target role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/40 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-550 transition-all backdrop-blur-md"
          />
        </div>

        <div className="md:col-span-4 relative">
          <i className="fa-solid fa-filter w-5 h-5 text-zinc-455 absolute left-4 top-1/2 transform -translate-y-1/2" ></i>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/40 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/60 text-zinc-900 dark:text-white rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-550 transition-all backdrop-blur-md cursor-pointer"
          >
            <option value="All">All Technical Skills</option>
            {allSkills.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((cand) => (
          <div
            key={cand.id}
            className="glass-panel p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group border border-zinc-200/50 dark:border-zinc-800/40 bg-white/20 dark:bg-zinc-950/20 hover:border-purple-500/30 hover:shadow-[0_4px_30px_rgba(168,85,247,0.08)] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-650 flex items-center justify-center font-bold text-white text-base shadow-[0_4px_15px_rgba(168,85,247,0.2)] border border-white/10">
                  {cand.avatar}
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">ATS score</span>
                  <span className={`text-sm font-black ${
                    cand.atsScore >= 90 ? 'text-emerald-500' : 'text-purple-500'
                  }`}>{cand.atsScore}/100</span>
                </div>
              </div>

              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white leading-tight">
                {cand.name}
              </h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-450 font-bold uppercase mt-1 tracking-wider">
                {cand.roleTarget}
              </p>

              <div className="flex items-center gap-4 mt-4 mb-5 text-xs text-zinc-550 dark:text-zinc-400 font-semibold border-b border-t border-zinc-200/30 dark:border-zinc-800/20 py-2.5">
                <div className="flex items-center gap-1">
                  <i className="fa-solid fa-code w-4 h-4 text-zinc-400" ></i>
                  <span>{cand.leetcodeSolved} Solved</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="fa-solid fa-bullseye w-4 h-4 text-zinc-400" ></i>
                  <span>{cand.leetcodeStreak}d Streak</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {cand.skills.map((s, idx) => (
                  <span key={idx} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/40">
              <button
                onClick={() => handleToggleShortlist(cand.id)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  shortlisted.includes(cand.id)
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-white dark:bg-zinc-900 border-zinc-250 dark:border-zinc-800 text-zinc-650 hover:border-purple-550/20 hover:text-purple-500 dark:text-zinc-350'
                }`}
              >
                <i className="fa-solid fa-user-check w-4 h-4" ></i>
                {shortlisted.includes(cand.id) ? 'Shortlisted' : 'Shortlist'}
              </button>

              <button
                onClick={() => handleOpenDrawer(cand)}
                className="flex-1 py-2.5 bg-gradient-to-tr from-purple-500 to-indigo-650 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_rgba(168,85,247,0.2)] transition-all cursor-pointer border border-white/10"
              >
                <i className="fa-solid fa-microchip w-4 h-4" ></i>
                Interview Twin
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Side Drawer for Candidate Details & AI Twin Chat */}
      {isDrawerOpen && selectedCandidate && (
        <>
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white/80 dark:bg-zinc-950/80 border-l border-zinc-200/50 dark:border-zinc-800/40 backdrop-blur-2xl z-50 flex flex-row shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden">
            
            {/* Left Side: Candidate details */}
            <div className="flex-1 flex flex-col border-r border-zinc-200/50 dark:border-zinc-800/40 p-6 overflow-y-auto space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-550 font-black text-lg">
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{selectedCandidate.name}</h2>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{selectedCandidate.roleTarget}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/30 rounded-xl text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-250 transition-all md:hidden"
                >
                  <i className="fa-solid fa-xmark w-5 h-5" ></i>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">ATS Score</span>
                  <p className="font-extrabold text-zinc-850 dark:text-zinc-205 flex items-center gap-1.5">
                    <i className="fa-solid fa-file-lines w-4 h-4 text-zinc-900 dark:text-white" ></i>
                    {selectedCandidate.atsScore}/100 Match
                  </p>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-850 rounded-2xl space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Leetcode solved</span>
                  <p className="font-extrabold text-zinc-850 dark:text-zinc-205 flex items-center gap-1.5">
                    <i className="fa-solid fa-code w-4 h-4 text-zinc-900 dark:text-white" ></i>
                    {selectedCandidate.leetcodeSolved} Solved
                  </p>
                </div>
              </div>

              {/* Education & email info */}
              <div className="space-y-4 text-xs font-semibold text-zinc-550 dark:text-zinc-400">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Academics</span>
                  <p className="text-zinc-850 dark:text-zinc-205">{selectedCandidate.education}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Email Address</span>
                  <p className="text-zinc-850 dark:text-zinc-205">{selectedCandidate.email}</p>
                </div>
              </div>

              {/* Skills checklist */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Competencies</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/5 border border-purple-500/10 text-purple-550 dark:text-purple-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggle Shortlist */}
              <button
                onClick={() => handleToggleShortlist(selectedCandidate.id)}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                  shortlisted.includes(selectedCandidate.id)
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-zinc-150 dark:bg-zinc-900 border-zinc-250 dark:border-zinc-800 text-zinc-650 hover:border-purple-550/20 hover:text-purple-500 dark:text-zinc-350'
                }`}
              >
                <i className="fa-solid fa-user-check w-4.5 h-4.5" ></i>
                {shortlisted.includes(selectedCandidate.id) ? 'Shortlisted' : 'Shortlist Candidate'}
              </button>
            </div>

            {/* Right Side: Chat Module */}
            <div className="flex-1 w-80 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col h-full border-l border-zinc-200/50 dark:border-zinc-800/40">
              {/* Chat Header */}
              <div className="p-5 border-b border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-550 border border-purple-500/20 animate-pulse">
                    <i className="fa-solid fa-microchip w-5 h-5" ></i>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1">
                      Twin Replica
                      <i className="fa-solid fa-wand-magic-sparkles w-3.5 h-3.5 text-zinc-900 dark:text-white" ></i>
                    </h3>
                    <p className="text-[10px] text-zinc-400">Autonomous Interview Screening</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/30 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-250 transition-all hidden md:block"
                >
                  <i className="fa-solid fa-xmark w-5 h-5" ></i>
                </button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-tr from-purple-500 to-indigo-650 text-white rounded-tr-none border border-purple-600/10' 
                        : 'bg-white/80 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-800/40'
                    }`}>
                      <div className="[&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1 [&>h3]:font-bold [&>h3]:mb-2 [&>strong]:font-bold [&>em]:italic break-words">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-white/80 dark:bg-zinc-900/60 rounded-2xl rounded-tl-none px-3.5 py-2.5 border border-zinc-200/50 dark:border-zinc-800/40 flex gap-1.5 items-center">
                      <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input section */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-950/20 flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={`Ask ${selectedCandidate.name.split(" ")[0]}'s Twin a question...`}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-550 transition-all placeholder-zinc-450"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isSending}
                  className="p-2.5 bg-purple-550 text-white rounded-xl hover:bg-purple-650 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                >
                  <i className="fa-solid fa-paper-plane w-4.5 h-4.5" ></i>
                </button>
              </form>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
