"use client";

import { useState } from "react";
import { Sparkles, Terminal, Code, Cpu, Plus, CheckCircle, ArrowRight, Lightbulb, GitBranch, Play, Check } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  tags: string[];
  roleTarget: string;
  phases: {
    title: string;
    tasks: string[];
  }[];
  architecture: string[];
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Autonomous RAG Knowledge Hub",
    description: "An AI-powered document semantic lookup agent that performs contextual chunking, hierarchical indexing, and real-time response generation.",
    difficulty: "Advanced",
    estimatedTime: "2-3 Weeks",
    tags: ["Next.js", "Python", "Pinecone", "LangChain"],
    roleTarget: "AI Engine Engineer",
    phases: [
      {
        title: "Phase 1: Ingestion & Vector Pipeline",
        tasks: [
          "Set up custom PDF parsing using python-pdfminer",
          "Implement recursive character text splitting with overlapping windows",
          "Generate embeddings using OpenAI text-embedding-3-small and upload to Pinecone index"
        ]
      },
      {
        title: "Phase 2: Hybrid Query Retrieval",
        tasks: [
          "Integrate BM25 sparse keyword scores with dense vector semantic results",
          "Apply Cohere Re-ranker to sort top 10 documents down to top 3 context windows",
          "Build sliding-context prompt buffers to prevent LLM hallucination"
        ]
      },
      {
        title: "Phase 3: Agentic UI Orchestration",
        tasks: [
          "Create streaming API gateway using Next.js route handlers",
          "Develop glassmorphic chat pane showing citation node maps",
          "Benchmark latency and retrieval context accuracy metrics"
        ]
      }
    ],
    architecture: ["Ingestion Pipeline", "Vector DB Embeddings", "Re-ranking Engine", "Streaming Chat API"]
  },
  {
    id: "proj-2",
    title: "High-Throughput Analytics Dashboard",
    description: "A real-time telemetry visualizer built for web apps, processing WebSockets streaming data with ultra-low latency canvas rendering.",
    difficulty: "Intermediate",
    estimatedTime: "1-2 Weeks",
    tags: ["React", "FastAPI", "Redis", "ChartJS"],
    roleTarget: "Fullstack Developer",
    phases: [
      {
        title: "Phase 1: WebSocket Backend Feed",
        tasks: [
          "Establish high-frequency telemetry generator in FastAPI",
          "Deploy Redis pub-sub channels to partition payload streaming",
          "Handle concurrent client socket heartbeats and cleanup routines"
        ]
      },
      {
        title: "Phase 2: UI Canvas Render Optimization",
        tasks: [
          "Construct interactive layout panels using Tailwind glass styles",
          "Use Canvas2D context or ChartJS stream adapter for high refresh charts",
          "Batch UI updates to minimize React re-render cycles"
        ]
      }
    ],
    architecture: ["FastAPI WebSocket Server", "Redis Sub/Pub", "React Telemetry Consumer", "HTML5 Canvas Chart Grid"]
  },
  {
    id: "proj-3",
    title: "Decentralized Escrow Smart Contract Hub",
    description: "Multi-party automated transaction verification protocol enforcing programmatic release controls under customizable criteria.",
    difficulty: "Advanced",
    estimatedTime: "3 Weeks",
    tags: ["Solidity", "Hardhat", "Ether.js", "React"],
    roleTarget: "Blockchain Developer",
    phases: [
      {
        title: "Phase 1: Smart Contract Protocol",
        tasks: [
          "Write Solidity contracts modeling party deposit and dispute windows",
          "Implement Multi-signature release checks and re-entrancy protection guards",
          "Draft exhaustive test suite verifying extreme condition fallbacks"
        ]
      },
      {
        title: "Phase 2: Web3 Interface Bridge",
        tasks: [
          "Integrate wagmi hooks to establish MetaMask or Rainbow connection profiles",
          "Read contract states and trigger deposit operations using Viem/Ethers",
          "Include transactional gas fee estimations and pending progress overlays"
        ]
      }
    ],
    architecture: ["Solidity Core Contract", "Hardhat Test Rig", "Viem / Wagmi Connectors", "Transaction Ledger UI"]
  }
];

export default function ProjectRecs() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(INITIAL_PROJECTS[0]);
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleGenerateIdea = () => {
    setGeneratingIdea(true);
    setTimeout(() => {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        title: "Real-time AI Video Copilot",
        description: "An in-browser video screen analyzer using Gemini Multimodal Live API to provide visual task suggestions.",
        difficulty: "Advanced",
        estimatedTime: "2 Weeks",
        tags: ["WebRTC", "Next.js", "Gemini API", "Tailwind"],
        roleTarget: "AI Frontend Architect",
        phases: [
          {
            title: "Phase 1: Media Capture Hook",
            tasks: [
              "Create WebRTC capture stream for user screens or webcam feeds",
              "Compress frames at 1fps using Canvas grab workflows",
              "Maintain persistent WebSockets session to target endpoints"
            ]
          },
          {
            title: "Phase 2: Multimodal Gemini Stream",
            tasks: [
              "Send sequential visual buffers to Gemini Flash models with prompt instructions",
              "Receive structured JSON suggestions mapping current workspace state",
              "Build customizable hotkey controls to pause or resume analysis instantly"
            ]
          }
        ],
        architecture: ["Screen Capture Engine", "Frame Processing Pipeline", "Gemini Flash API Adapter", "Floating Copilot Overlay"]
      };
      setProjects([newProj, ...projects]);
      setSelectedProject(newProj);
      setGeneratingIdea(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Project Recommendations</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Get tailor-made project roadmaps to boost your resume and portfolios.</p>
        </div>
        
        <button 
          onClick={handleGenerateIdea}
          disabled={generatingIdea}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:shadow-[0_4px_15px_rgba(99,102,241,0.25)] active:scale-95 transition-all cursor-pointer border border-white/10 disabled:opacity-50"
        >
          {generatingIdea ? "Consulting AI Twin..." : "Suggest New Project Idea"}
          <Sparkles className="w-4 h-4" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Project Lists Panel */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 pl-1">Target Tailored Projects</h2>
          
          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className={`glass-panel p-5 rounded-2xl cursor-pointer transition-all duration-350 relative overflow-hidden group border ${
                  selectedProject?.id === proj.id
                    ? "border-indigo-550/40 bg-indigo-500/5 shadow-[0_4px_25px_rgba(99,102,241,0.1)]"
                    : "border-zinc-200/50 dark:border-zinc-800/40 hover:border-zinc-350 dark:hover:border-zinc-700 bg-white/20 dark:bg-zinc-950/20"
                }`}
              >
                {selectedProject?.id === proj.id && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                )}
                
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    proj.difficulty === "Advanced"
                      ? "text-rose-500 bg-rose-500/10 border-rose-550/15"
                      : "text-indigo-500 bg-indigo-500/10 border-indigo-550/15"
                  }`}>
                    {proj.difficulty}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">{proj.estimatedTime}</span>
                </div>

                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {proj.tags.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                      {t}
                    </span>
                  ))}
                  {proj.tags.length > 3 && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 text-zinc-400">+{proj.tags.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Project Interactive Roadmap & Spec */}
        <div className="lg:col-span-7">
          {selectedProject ? (
            <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-350">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Title Header */}
              <div className="space-y-2 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/25 rounded-md">
                    {selectedProject.roleTarget}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">{selectedProject.title}</h2>
                <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Architecture Nodes */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500" /> System Architecture Nodes
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
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-500" /> Complete Roadmap Phases
                </h3>

                <div className="space-y-4 relative pl-4 border-l border-zinc-200 dark:border-zinc-800">
                  {selectedProject.phases.map((phase, pIdx) => (
                    <div key={pIdx} className="relative space-y-2">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-950 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                      
                      <h4 className="text-xs font-extrabold uppercase tracking-wide text-zinc-800 dark:text-white flex items-center gap-2">
                        {phase.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {phase.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2.5 text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-zinc-200/50 dark:border-zinc-800/40 pt-5 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4.5 h-4.5 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Ready to deploy portfolio spec</span>
                </div>
                
                <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/35 text-indigo-500 hover:text-indigo-650 dark:hover:text-indigo-300 rounded-xl font-bold text-xs uppercase tracking-wide transition-all cursor-pointer">
                  Export Repo Spec
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-16 rounded-3xl text-center border-dashed border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center">
              <Lightbulb className="w-12 h-12 text-zinc-400 animate-bounce mb-4" />
              <h3 className="font-extrabold text-zinc-900 dark:text-white mb-2">No Project Selected</h3>
              <p className="text-sm text-zinc-550 dark:text-zinc-400">Select a project recommendation from the list on the left to view its structured implementation roadmap.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
