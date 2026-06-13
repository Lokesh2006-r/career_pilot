"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";


interface Task {
  text: string;
  completed: boolean;
}

interface Phase {
  title: string;
  tasks: Task[];
}

interface Project {
  _id: string;
  id?: string; // fallback
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  tags: string[];
  roleTarget: string;
  phases: Phase[];
  architecture: string[];
  whyFits: string;
  isSaved: boolean;
  problemStatement?: string;
  detailedTechStack?: { name: string; justification: string }[];
  learningDeliverables?: string[];
}

export default function ProjectRecs() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);
  
  // Custom Generation Settings State
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [targetRole, setTargetRole] = useState("Fullstack Developer");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [customSkills, setCustomSkills] = useState("");
  const [focusOnGaps, setFocusOnGaps] = useState(true);
  
  // User profile resume data
  const [resumeData, setResumeData] = useState<any>(null);
  
  // Tab control inside project list
  const [activeTab, setActiveTab] = useState<"all" | "saved" | "active">("all");
  
  // Modal states
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [specModalTab, setSpecModalTab] = useState<"readme" | "structure">("readme");
  const [copiedSpec, setCopiedSpec] = useState(false);

  // Fetch recommendations and resume data
  const fetchRecommendations = async (showLoading = true) => {
    if (!user) return;
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/recommendations/${user.uid}`);
      if (res.ok) {
        const json = await res.json();
        const list = json.projects || [];
        setProjects(list);
        
        // Retain selected project if it still exists, otherwise select the first one
        if (selectedProject) {
          const stillExists = list.find((p: Project) => p._id === selectedProject._id);
          if (stillExists) {
            setSelectedProject(stillExists);
          } else {
            setSelectedProject(list[0] || null);
          }
        } else {
          setSelectedProject(list[0] || null);
        }
      }
    } catch (err) {
      console.error("Error loading project recommendations:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecommendations();
      
      // Fetch latest resume gaps
      fetch(`${API_BASE_URL}/api/resume/latest/${user.uid}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) setResumeData(json.data);
        })
        .catch(err => console.error("Error loading resume context:", err));
    }
  }, [user]);

  // Handle generating a new custom project via Gemini
  const handleGenerateIdea = async () => {
    if (!user) return;
    setGeneratingIdea(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/recommendations/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          targetRole,
          difficulty,
          customSkills,
          focusOnGaps
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.project) {
          // Refresh list and select the newly generated project
          setProjects(prev => [json.project, ...prev]);
          setSelectedProject(json.project);
          setSettingsExpanded(false); // Collapse settings on success
        }
      }
    } catch (err) {
      console.error("Failed to generate AI project recommendation:", err);
    } finally {
      setGeneratingIdea(false);
    }
  };

  // Toggle task completion
  const handleToggleTask = async (projId: string, phaseIndex: number, taskIndex: number) => {
    if (!user) return;
    setTogglingTask(`${projId}-${phaseIndex}-${taskIndex}`);

    // Optimistic Update
    const updatedProjects = projects.map(proj => {
      if (proj._id === projId) {
        const phases = [...proj.phases];
        phases[phaseIndex].tasks[taskIndex].completed = !phases[phaseIndex].tasks[taskIndex].completed;
        return { ...proj, phases };
      }
      return proj;
    });
    setProjects(updatedProjects);
    const targetProj = updatedProjects.find(p => p._id === projId);
    if (targetProj) setSelectedProject(targetProj);

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/recommendations/${projId}/task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phaseIndex, taskIndex })
      });
      if (!res.ok) {
        // Revert on error
        fetchRecommendations(false);
      }
    } catch (err) {
      console.error("Failed to toggle task state:", err);
      fetchRecommendations(false);
    } finally {
      setTogglingTask(null);
    }
  };

  // Save / Bookmark Project
  const handleToggleSaveProject = async (projId: string) => {
    if (!user) return;
    
    // Optimistic Update
    setProjects(prev => prev.map(p => p._id === projId ? { ...p, isSaved: !p.isSaved } : p));
    if (selectedProject?._id === projId) {
      setSelectedProject(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/recommendations/${projId}/save`, {
        method: "PUT"
      });
      if (!res.ok) fetchRecommendations(false);
    } catch (err) {
      console.error("Failed to save project bookmark:", err);
      fetchRecommendations(false);
    }
  };

  // Delete project recommendation
  const handleDeleteProject = async (projId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this project recommendation?")) return;

    // Optimistic update
    setProjects(prev => prev.filter(p => p._id !== projId));
    if (selectedProject?._id === projId) {
      setSelectedProject(null);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/recommendations/${projId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchRecommendations(false);
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
      fetchRecommendations(false);
    }
  };

  // Calculate project completion progress
  const getProjectProgress = (proj: Project) => {
    let total = 0;
    let completed = 0;
    proj.phases.forEach(ph => {
      ph.tasks.forEach(t => {
        total++;
        if (t.completed) completed++;
      });
    });
    return total === 0 ? { percent: 0, completed, total } : { percent: Math.round((completed / total) * 100), completed, total };
  };

  // Filter projects based on activeTab
  const filteredProjects = projects.filter(proj => {
    if (activeTab === "saved") return proj.isSaved;
    if (activeTab === "active") {
      const { completed } = getProjectProgress(proj);
      return completed > 0;
    }
    return true;
  });

  // Generate Repository Specification README.md text
  const generateReadmeText = (proj: Project) => {
    return `# 🚀 ${proj.title}
    
## 📌 Project Overview
${proj.description}

- **Target Placement Role**: ${proj.roleTarget}
- **Complexity Level**: ${proj.difficulty}
- **Estimated Completion**: ${proj.estimatedTime}
- **Recommended Stack**: ${proj.tags.join(", ")}

---

## 🏗️ System Architecture
\`\`\`
${proj.architecture.map((node, i) => `[${i + 1}] ${node}`).join(" ──► ")}
\`\`\`

---

## 🗺️ Complete Roadmap Phases & Specifications

${proj.phases.map((ph, pIdx) => `### 📍 Phase ${pIdx + 1}: ${ph.title}
${ph.tasks.map((task, tIdx) => `- [ ] Step ${tIdx + 1}: ${task.text}`).join("\n")}
`).join("\n")}

---

## 🛠️ Setup & Deployment Starter Kit
1. **Initialize Workspace**:
   \`\`\`bash
   mkdir ${proj.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}
   cd ${proj.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}
   npm init -y
   \`\`\`
2. **Environment Configuration**: Create a \`.env\` file in your server folder:
   \`\`\`
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/my_app
   API_SECRET_KEY=your_secret_credentials
   \`\`\`
3. **Run Dev Environment**:
   \`\`\`bash
   npm run dev
   \`\`\`
`;
  };

  // Generate Repository Specification directory file tree text
  const generateDirectoryLayoutText = (proj: Project) => {
    const isFrontendOrReact = proj.tags.some(t => ["react", "next.js", "nextjs", "vue", "tailwind", "webrtc"].includes(t.toLowerCase()));
    const isBackend = proj.tags.some(t => ["python", "fastapi", "node.js", "express", "go", "solidity", "redis"].includes(t.toLowerCase()));

    let tree = `my-portfolio-project/
├── .env.example
├── .gitignore
├── README.md
├── package.json
`;

    if (isFrontendOrReact && isBackend) {
      tree += `├── client/                  # Frontend User Interface
│   ├── public/
│   ├── src/
│   │   ├── app/                 # Page routes & layout
│   │   ├── components/          # Reusable UI widgets
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── tailwind.config.ts
├── server/                  # Backend REST API / WebSocket Server
│   ├── src/
│   │   ├── controllers/         # Request handling logic
│   │   ├── models/              # Schema declarations
│   │   ├── routes/              # Endpoint mapping
│   │   ├── services/
│   │   └── index.ts             # Application entrypoint
│   ├── package.json
│   └── tsconfig.json
`;
    } else if (isFrontendOrReact) {
      tree += `├── public/
├── src/
│   ├── components/              # Shared layout widgets
│   ├── contexts/                # Authentication / Global state
│   ├── pages/                   # Client views
│   ├── styles/
│   └── utils/                   # Helper functions
├── tsconfig.json
└── tailwind.config.js
`;
    } else {
      tree += `├── src/
│   ├── controllers/             # Business controllers
│   ├── middleware/              # Auth & Error middlewares
│   ├── models/                  # Database schemas
│   ├── routes/                  # API endpoints
│   ├── utils/
│   └── index.ts                 # Server initializer
├── tsconfig.json
└── package.json
`;
    }
    return tree;
  };

  const handleCopySpec = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  // Mobile full-screen detail drawer
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const handleSelectProject = (proj: Project) => {
    setSelectedProject(proj);
    setMobileDetailOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in text-zinc-900 dark:text-zinc-100">
      
      {/* ── MOBILE FULL-SCREEN DETAIL DRAWER ───────────────────────────── */}
      {mobileDetailOpen && selectedProject && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-20 z-[999] bg-white dark:bg-zinc-950 flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setMobileDetailOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors shrink-0 cursor-pointer font-bold text-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div className="min-w-0 pl-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 leading-none">Project Detail</p>
                <h2 className="text-xs font-extrabold text-zinc-900 dark:text-white truncate">{selectedProject.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleToggleSaveProject(selectedProject._id)}
                className={`p-2 rounded-xl border cursor-pointer transition-all ${
                  selectedProject.isSaved
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <i className={`fa-solid fa-star ${`w-4 h-4 ${selectedProject.isSaved ? "fill-amber-500" : ""}`} `}></i>
              </button>
              <button
                onClick={() => setShowSpecModal(true)}
                className="flex items-center gap-1 px-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all cursor-pointer"
              >
                <i className="fa-solid fa-terminal w-3.5 h-3.5" ></i>
                Export
              </button>
            </div>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto pb-28">
            <div className="p-4 space-y-5">
              
              {/* Badges & Description */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                    selectedProject.difficulty === "Advanced"
                      ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                      : selectedProject.difficulty === "Intermediate"
                      ? "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
                      : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                  }`}>
                    {selectedProject.difficulty}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-zinc-200/60 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                    {selectedProject.estimatedTime}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 text-indigo-500">
                    {selectedProject.roleTarget}
                  </span>
                </div>

                {/* Progress bar */}
                {(() => {
                  const { percent, completed, total } = getProjectProgress(selectedProject);
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-extrabold text-zinc-400 uppercase">
                        <span>Progress</span>
                        <span className="text-indigo-500">{percent}% — {completed}/{total} tasks</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })()}

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Why Fits */}
              {selectedProject.whyFits && (
                <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex gap-3">
                  <i className="fa-solid fa-lightbulb w-4 h-4 shrink-0 text-indigo-500 animate-pulse mt-0.5" ></i>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-500">Why this fits your profile</span>
                    <p className="mt-1 text-xs leading-relaxed text-indigo-700 dark:text-indigo-300 font-medium">{selectedProject.whyFits}</p>
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              {selectedProject.problemStatement && (
                <div className="space-y-1.5">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Problem Statement</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">{selectedProject.problemStatement}</p>
                </div>
              )}

              {/* Tech Tags */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tags.map((t, i) => (
                    <span key={i} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Tech Stack */}
              {selectedProject.detailedTechStack && selectedProject.detailedTechStack.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Technology Justification</h3>
                  <div className="space-y-2">
                    {selectedProject.detailedTechStack.map((tech, i) => (
                      <div key={i} className="p-3 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl">
                        <span className="text-xs font-black text-indigo-500">{tech.name}</span>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{tech.justification}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Architecture */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-microchip w-3.5 h-3.5 text-indigo-500" ></i> System Architecture
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.architecture.map((node, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <div className="w-4 h-4 rounded bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-[9px] font-black text-indigo-500">{i + 1}</div>
                      <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">{node}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Deliverables */}
              {selectedProject.learningDeliverables && selectedProject.learningDeliverables.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Learning Deliverables</h3>
                  <ul className="space-y-1.5">
                    {selectedProject.learningDeliverables.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        <i className="fa-solid fa-check w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" ></i>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── WEEKLY ROADMAP ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-code-branch w-3.5 h-3.5 text-indigo-500" ></i> Weekly Roadmap
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-500">
                    {getProjectProgress(selectedProject).percent}% done
                  </span>
                </div>

                <div className="space-y-4 pl-3 border-l-2 border-indigo-500/30">
                  {selectedProject.phases.map((phase, pIdx) => (
                    <div key={pIdx} className="relative space-y-2">
                      {/* Timeline dot */}
                      <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-950 shadow-[0_0_8px_rgba(99,102,241,0.7)]" />

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/25 rounded-md">
                          Week {pIdx + 1}
                        </span>
                        <h4 className="text-xs font-extrabold uppercase tracking-wide text-zinc-800 dark:text-white">
                          {phase.title.replace(/^(Phase|Week)\s*\d+:\s*/i, "")}
                        </h4>
                      </div>

                      <ul className="space-y-1.5">
                        {phase.tasks.map((task, tIdx) => {
                          const isTaskLoading = togglingTask === `${selectedProject._id}-${pIdx}-${tIdx}`;
                          return (
                            <li
                              key={tIdx}
                              onClick={() => handleToggleTask(selectedProject._id, pIdx, tIdx)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all cursor-pointer ${task.completed ? "opacity-70" : ""}`}
                            >
                              {isTaskLoading ? (
                                <i className="fa-solid fa-spinner fa-spin w-4 h-4 text-indigo-500 animate-spin shrink-0 mt-0.5" ></i>
                              ) : task.completed ? (
                                <i className="fa-solid fa-check w-4 h-4 text-indigo-500 shrink-0 mt-0.5" ></i>
                              ) : (
                                <i className="fa-regular fa-square w-4 h-4 text-zinc-400 shrink-0 mt-0.5" ></i>
                              )}
                              <span className={`text-xs leading-relaxed font-semibold ${task.completed ? "line-through text-zinc-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                                {task.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 glass-panel rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10">
          <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-xs uppercase tracking-wider mb-1.5 animate-pulse">
            <i className="fa-solid fa-wand-magic-sparkles w-4.5 h-4.5" ></i>
            Empowered by AI Twin
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Project Recommendations</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1 max-w-xl text-sm leading-relaxed">
            Get personalized, industry-grade project specs designed to target key skills and fill resume gaps.
          </p>
        </div>
        
        <button 
          onClick={() => setSettingsExpanded(!settingsExpanded)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95 z-10"
        >
          <i className="fa-solid fa-gear w-4.5 h-4.5" ></i>
          AI Generator Settings
          {settingsExpanded ? <i className="fa-solid fa-chevron-up w-4 h-4" ></i> : <i className="fa-solid fa-chevron-down w-4 h-4" ></i>}
        </button>
      </header>

      {/* Collapsible Settings Form */}
      {settingsExpanded && (
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/25 bg-indigo-500/5 space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
            <i className="fa-solid fa-gear w-4 h-4" ></i>
            Customize Project Specifications
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-zinc-500 dark:text-zinc-400">Target Career Role</label>
              <select 
                value={targetRole} 
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent font-semibold"
              >
                <option value="Fullstack Developer">Fullstack Developer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="AI Engine Engineer">AI / ML Engineer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="Blockchain Developer">Blockchain Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-zinc-500 dark:text-zinc-400">Project Complexity</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent font-semibold"
              >
                <option value="Beginner">Beginner (1 Week)</option>
                <option value="Intermediate">Intermediate (1-2 Weeks)</option>
                <option value="Advanced">Advanced (3 Weeks)</option>
              </select>
            </div>

            {/* Custom Tech Stack Focus */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-zinc-500 dark:text-zinc-400">Tech Stack Focus (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Next.js, Redis, Go" 
                value={customSkills}
                onChange={(e) => setCustomSkills(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-550 focus:border-transparent font-semibold"
              />
            </div>

            {/* Target Resume Gaps Toggle */}
            <div className="flex flex-col justify-center space-y-2">
              <span className="text-xs font-extrabold uppercase text-zinc-500 dark:text-zinc-400">Personalized Alignment</span>
              <label className="flex items-center gap-2.5 cursor-pointer mt-1">
                <input 
                  type="checkbox" 
                  checked={focusOnGaps} 
                  onChange={(e) => setFocusOnGaps(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Focus on Resume Gaps</span>
              </label>
            </div>

          </div>

          {/* Resume Gaps Alert Summary */}
          {focusOnGaps && resumeData && resumeData.missingKeywords?.length > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-550/20 rounded-2xl flex items-start gap-3">
              <i className="fa-solid fa-circle-exclamation w-5 h-5 text-amber-500 shrink-0 mt-0.5" ></i>
              <div>
                <span className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Detected Resume Gap Keywords:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {resumeData.missingKeywords.slice(0, 8).map((kw: string, i: number) => (
                    <span key={i} className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      {kw}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                  AI Twin will prioritize injecting these concepts (like caching databases, deployment routines, and orchestration specs) to boost your ATS viability.
                </p>
              </div>
            </div>
          )}

          {/* Trigger Generate Button */}
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleGenerateIdea}
              disabled={generatingIdea}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-95"
            >
              {generatingIdea ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin w-4 h-4 animate-spin" ></i>
                  Generating personalized specification...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles w-4 h-4" ></i>
                  Request AI Project Specification
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <i className="fa-solid fa-spinner fa-spin w-10 h-10 text-indigo-500 animate-spin" ></i>
          <p className="text-sm text-zinc-400 font-bold uppercase tracking-wider animate-pulse">Consulting AI Twin for recommendations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Project Lists Panel */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-2">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab("all")} 
                  className={`text-xs font-black uppercase tracking-wider pb-1 cursor-pointer transition-colors border-b-2 ${
                    activeTab === "all" ? "text-indigo-500 border-indigo-500" : "text-zinc-400 border-transparent hover:text-zinc-650"
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setActiveTab("saved")} 
                  className={`text-xs font-black uppercase tracking-wider pb-1 cursor-pointer transition-colors border-b-2 ${
                    activeTab === "saved" ? "text-indigo-500 border-indigo-500" : "text-zinc-400 border-transparent hover:text-zinc-650"
                  }`}
                >
                  Saved
                </button>
                <button 
                  onClick={() => setActiveTab("active")} 
                  className={`text-xs font-black uppercase tracking-wider pb-1 cursor-pointer transition-colors border-b-2 ${
                    activeTab === "active" ? "text-indigo-500 border-indigo-500" : "text-zinc-400 border-transparent hover:text-zinc-650"
                  }`}
                >
                  In Progress
                </button>
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{filteredProjects.length} Projects</span>
            </div>
            
            {/* Project List */}
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {filteredProjects.length === 0 ? (
                <div className="text-center p-8 glass-panel border-dashed border-zinc-350 dark:border-zinc-800 rounded-2xl">
                  <p className="text-xs font-bold text-zinc-400 uppercase">No recommendations found</p>
                  <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-1 leading-relaxed">
                    Try adjusting your filter parameters or request a new AI project specification above.
                  </p>
                </div>
              ) : (
                filteredProjects.map((proj) => {
                  const { percent, completed, total } = getProjectProgress(proj);
                  const isSelected = selectedProject?._id === proj._id;

                  return (
                    <div
                      key={proj._id}
                      onClick={() => handleSelectProject(proj)}
                      className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group border ${
                        isSelected
                          ? "border-indigo-550/40 bg-indigo-500/5 shadow-[0_4px_25px_rgba(99,102,241,0.1)]"
                          : "border-zinc-200/50 dark:border-zinc-800/40 hover:border-zinc-350 dark:hover:border-zinc-700 bg-white/20 dark:bg-zinc-950/20"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                      )}
                      
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          proj.difficulty === "Advanced"
                            ? "text-rose-500 bg-rose-500/10 border-rose-550/15"
                            : proj.difficulty === "Intermediate"
                            ? "text-indigo-500 bg-indigo-500/10 border-indigo-550/15"
                            : "text-emerald-500 bg-emerald-500/10 border-emerald-550/15"
                        }`}>
                          {proj.difficulty}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase shrink-0">{proj.estimatedTime}</span>
                      </div>

                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                          {proj.title}
                        </h3>
                        
                        {/* Bookmark & Delete action buttons on card */}
                        <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSaveProject(proj._id);
                            }}
                            className="p-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-amber-500 transition-all cursor-pointer"
                          >
                            <i className={`fa-solid fa-star ${`w-3.5 h-3.5 ${proj.isSaved ? "text-amber-500 fill-amber-500" : ""}`} `}></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(proj._id);
                            }}
                            className="p-1 hover:bg-rose-500/10 rounded-lg text-zinc-400 hover:text-rose-500 transition-all cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can w-3.5 h-3.5" ></i>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>

                      {/* Display Progress bar */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex justify-between text-[9px] font-extrabold text-zinc-400 uppercase">
                          <span>Progress</span>
                          <span>{percent}% ({completed}/{total} Tasks)</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {proj.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400">
                            {t}
                          </span>
                        ))}
                        {proj.tags.length > 3 && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 text-zinc-400">+{proj.tags.length - 3}</span>
                        )}
                      </div>

                      {/* Mobile tap hint */}
                      <div className="lg:hidden flex items-center justify-end gap-1 mt-2.5 text-[9px] font-black uppercase tracking-wider text-indigo-500/70">
                        Tap for full details
                        <i className="fa-solid fa-arrow-right w-3 h-3" ></i>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Selected Project Interactive Roadmap */}
          <div className="lg:col-span-7">
            {selectedProject ? (
              <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Title Header */}
                <div className="space-y-3 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/25 rounded-md">
                        {selectedProject.roleTarget}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200/60 dark:border-zinc-800 rounded-md">
                        {selectedProject.estimatedTime}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleToggleSaveProject(selectedProject._id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedProject.isSaved 
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-350"
                      }`}
                    >
                      <i className={`fa-solid fa-star ${`w-3.5 h-3.5 ${selectedProject.isSaved ? "fill-amber-500 text-amber-500" : ""}`} `}></i>
                      {selectedProject.isSaved ? "Saved Spec" : "Save Spec"}
                    </button>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">{selectedProject.title}</h2>
                  <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">{selectedProject.description}</p>
                </div>

                {/* Personalization Relevance ("Why fits your profile") */}
                {selectedProject.whyFits && (
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex gap-3 text-xs text-indigo-700 dark:text-indigo-300">
                    <i className="fa-solid fa-lightbulb w-5 h-5 shrink-0 text-indigo-500 animate-pulse" ></i>
                    <div>
                      <span className="font-extrabold uppercase tracking-wide">Why this fits your profile:</span>
                      <p className="mt-1 leading-relaxed font-semibold">{selectedProject.whyFits}</p>
                    </div>
                  </div>
                )}

                {/* Problem Statement */}
                {selectedProject.problemStatement && (
                  <div className="space-y-2 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Problem Statement
                    </h3>
                    <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed font-medium">
                      {selectedProject.problemStatement}
                    </p>
                  </div>
                )}

                {/* Core Learning Deliverables */}
                {selectedProject.learningDeliverables && selectedProject.learningDeliverables.length > 0 && (
                  <div className="space-y-2.5 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Core Learning Deliverables
                    </h3>
                    <ul className="space-y-2 text-xs text-zinc-550 dark:text-zinc-400 font-semibold pl-1">
                      {selectedProject.learningDeliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <i className="fa-solid fa-check w-4 h-4 text-emerald-500 shrink-0 mt-0.5" ></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed Tech Stack Justifications */}
                {selectedProject.detailedTechStack && selectedProject.detailedTechStack.length > 0 && (
                  <div className="space-y-3 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Technology Stack Justification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProject.detailedTechStack.map((tech, idx) => (
                        <div key={idx} className="p-4 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl flex flex-col gap-1.5">
                          <span className="text-xs font-black text-indigo-500">{tech.name}</span>
                          <span className="text-[11px] text-zinc-550 dark:text-zinc-450 leading-relaxed font-medium">
                            {tech.justification}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Architecture Nodes */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <i className="fa-solid fa-microchip w-4 h-4 text-indigo-500" ></i> System Architecture Nodes
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedProject.architecture.map((node, i) => (
                      <div key={i} className="flex items-center gap-2 px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 rounded-xl">
                        <div className="w-4 h-4 rounded bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-[9px] font-black text-indigo-500">
                          {i + 1}
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">{node}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Phase Roadmap */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <i className="fa-solid fa-code-branch w-4 h-4 text-indigo-500" ></i> Complete Roadmap Phases
                    </h3>
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">
                      {getProjectProgress(selectedProject).percent}% Checked Off
                    </span>
                  </div>

                  <div className="space-y-6 relative pl-4 border-l border-zinc-200 dark:border-zinc-800">
                    {selectedProject.phases.map((phase, pIdx) => (
                      <div key={pIdx} className="relative space-y-3">
                        
                        {/* Timeline dot */}
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-950 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                        
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/25 rounded-md shrink-0">
                            Week {pIdx + 1}
                          </span>
                          <h4 className="text-xs font-extrabold uppercase tracking-wide text-zinc-800 dark:text-white">
                            {phase.title.replace(/^(Phase|Week)\s*\d+:\s*/i, "")}
                          </h4>
                        </div>
                        
                        <ul className="space-y-2">
                          {phase.tasks.map((task, tIdx) => {
                            const isTaskLoading = togglingTask === `${selectedProject._id}-${pIdx}-${tIdx}`;
                            
                            return (
                              <li 
                                key={tIdx} 
                                onClick={() => handleToggleTask(selectedProject._id, pIdx, tIdx)}
                                className={`flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all cursor-pointer ${
                                  task.completed ? "opacity-75" : ""
                                }`}
                              >
                                {isTaskLoading ? (
                                  <i className="fa-solid fa-spinner fa-spin w-4.5 h-4.5 text-indigo-500 animate-spin shrink-0" ></i>
                                ) : task.completed ? (
                                  <i className="fa-solid fa-check w-4.5 h-4.5 text-indigo-500 shrink-0" ></i>
                                ) : (
                                  <i className="fa-regular fa-square w-4.5 h-4.5 text-zinc-400 shrink-0" ></i>
                                )}
                                <span className={`text-xs leading-relaxed font-semibold transition-all ${
                                  task.completed 
                                    ? "line-through text-zinc-400 dark:text-zinc-500" 
                                    : "text-zinc-700 dark:text-zinc-350"
                                }`}>
                                  {task.text}
                                </span>
                              </li>
                            );
                          })}
                        </ul>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-zinc-200/50 dark:border-zinc-800/40 pt-5 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-terminal w-4.5 h-4.5 text-emerald-500" ></i>
                    <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">Ready to deploy portfolio spec</span>
                  </div>
                  
                  <button 
                    onClick={() => setShowSpecModal(true)}
                    className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/35 text-indigo-500 dark:text-indigo-400 hover:text-indigo-650 dark:hover:text-indigo-300 rounded-xl font-bold text-xs uppercase tracking-wide transition-all cursor-pointer"
                  >
                    Export Repo Spec
                    <i className="fa-solid fa-arrow-right w-4 h-4" ></i>
                  </button>
                </div>

              </div>
            ) : (
              <div className="glass-panel p-20 rounded-3xl text-center border-dashed border-zinc-300 dark:border-zinc-850 flex flex-col items-center justify-center">
                <i className="fa-solid fa-lightbulb w-12 h-12 text-zinc-400 animate-bounce mb-4" ></i>
                <h3 className="font-extrabold text-zinc-900 dark:text-white mb-2">No Project Selected</h3>
                <p className="text-sm text-zinc-550 dark:text-zinc-400 max-w-sm leading-relaxed">
                  Select a project recommendation from the list on the left or customize specifications to generate a brand new one.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* EXPORT SPEC MODAL */}
      {showSpecModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-250">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <i className="fa-solid fa-terminal w-5 h-5 text-indigo-500" ></i>
                  Export Repository Specification
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{selectedProject.title}</p>
              </div>
              <button 
                onClick={() => setShowSpecModal(false)}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300 cursor-pointer"
              >
                <i className="fa-solid fa-xmark w-5 h-5" ></i>
              </button>
            </div>

            {/* Modal Tabs & Actions */}
            <div className="px-6 py-3 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => setSpecModalTab("readme")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    specModalTab === "readme" 
                      ? "bg-indigo-650 text-white shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  README.md File
                </button>
                <button 
                  onClick={() => setSpecModalTab("structure")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    specModalTab === "structure" 
                      ? "bg-indigo-650 text-white shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Directory Structure
                </button>
              </div>

              <button 
                onClick={() => handleCopySpec(
                  specModalTab === "readme" 
                    ? generateReadmeText(selectedProject) 
                    : generateDirectoryLayoutText(selectedProject)
                )}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-zinc-250 dark:border-zinc-850"
              >
                {copiedSpec ? (
                  <>
                    <i className="fa-solid fa-check w-3.5 h-3.5 text-emerald-500" ></i>
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-copy w-3.5 h-3.5" ></i>
                    Copy Content
                  </>
                )}
              </button>
            </div>

            {/* Modal Body / Code Panel */}
            <div className="flex-1 p-6 overflow-y-auto bg-zinc-950 font-mono text-xs text-zinc-300 select-text">
              {specModalTab === "readme" ? (
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {generateReadmeText(selectedProject)}
                </pre>
              ) : (
                <pre className="whitespace-pre-wrap leading-relaxed text-indigo-400">
                  {generateDirectoryLayoutText(selectedProject)}
                </pre>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
