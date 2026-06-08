"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Video, Target, Clock, MessageSquare, Play, Mic, MicOff, Send, Loader2, 
  Award, RotateCcw, Sparkles, CheckCircle2, Volume2, VolumeX, Eye, 
  ShieldAlert, ArrowLeft, Download, RefreshCw, UserCheck, ShieldCheck, 
  ChevronRight, Calendar, Layers, Activity, AlertCircle, AwardIcon, Cpu, Code
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PastSession {
  role: string;
  type: string;
  date: string;
  score: number;
}

interface InterviewHistoryItem {
  question: string;
  answer: string;
  feedback?: string;
}

interface EvaluationReport {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  detailedEvaluation: string;
  summary?: string;
  gaps?: string[];
}

interface DBInterviewSession {
  _id: string;
  role: string;
  type: string;
  history: InterviewHistoryItem[];
  report: EvaluationReport | null;
  status: 'in_progress' | 'completed';
  createdAt: string;
}

const CODE_TEMPLATES: Record<string, string> = {
  javascript: `// Write your JavaScript solution here\nfunction solution() {\n  console.log("Running sandbox verification...");\n  const latency = [12, 45, 68, 92];\n  const average = latency.reduce((a, b) => a + b, 0) / latency.length;\n  console.log("Average response latency:", average, "ms");\n  return average;\n}\nsolution();`,
  python: `# Write your Python solution here\ndef solution():\n    print("Running Python solution...")\n    latency = [12, 45, 68, 92]\n    average = sum(latency) / len(latency)\n    print(f"Average response latency: {average} ms")\n    return average\n\nsolution()`,
  cpp: `// Write your C++ solution here\n#include <iostream>\n#include <vector>\n#include <numeric>\nusing namespace std;\n\nint main() {\n    cout << "Running C++ solutions compiler..." << endl;\n    vector<int> latency = {12, 45, 68, 92};\n    double sum = accumulate(latency.begin(), latency.end(), 0);\n    cout << "Average response latency: " << (sum / latency.size()) << " ms" << endl;\n    return 0;\n}`,
  java: `// Write your Java solution here\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Compiling Java main structure...");\n        int[] latency = {12, 45, 68, 92};\n        double sum = Arrays.stream(latency).sum();\n        System.out.println("Average response latency: " + (sum / latency.length) + " ms");\n    }\n}`
};

export default function MockInterviews() {
  const { user } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState("Frontend Engineer");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Beginner" | "Moderate" | "Hard">("Moderate");
  const [interviewType, setInterviewType] = useState<"technical" | "hr">("technical");
  const [viewState, setViewState] = useState<"config" | "active" | "completed">("config");
  
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  // Dual responses: Code + Concept text explanation
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");
  const [codeText, setCodeText] = useState(CODE_TEMPLATES.javascript);
  const [answerText, setAnswerText] = useState(""); // Conceptual explanation text area
  
  const [consoleOutput, setConsoleOutput] = useState("");
  const [consoleError, setConsoleError] = useState("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentInterviewId, setCurrentInterviewId] = useState("");
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // TTS (Text to Speech) State
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  // Custom Role Dropdown State
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  
  // Webcam & Audio Stream State
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState(120);
  
  // Assessment Report
  const [report, setReport] = useState<EvaluationReport | null>(null);
  
  // Completed History Sessions
  const [historySessions, setHistorySessions] = useState<DBInterviewSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Active selected session for detailed modal view
  const [selectedHistorySession, setSelectedHistorySession] = useState<DBInterviewSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roles = [
    { name: "Frontend Engineer", focus: "React, Next.js, Web Vitals, CSS Architecture, State Management" },
    { name: "Backend Engineer", focus: "Node.js, Databases, Event Loop, System Design, REST/GraphQL APIs" },
    { name: "Fullstack Engineer", focus: "Client-Server Sync, Session Auth, API Design, End-to-End Latency" },
    { name: "DevOps / Cloud Engineer", focus: "CI/CD, Terraform, Kubernetes, AWS, VPC & Security Architecture" },
    { name: "Mobile Engineer", focus: "React Native, Swift, Kotlin, Memory Management, Offline Sync" },
    { name: "AI / Machine Learning Engineer", focus: "Transformers, RAG, Model Fine-tuning, PyTorch, Vector Search" },
    { name: "Data Engineer", focus: "ETL/ELT, Spark, Kafka, Data Warehousing, Partition Indexing" },
    { name: "Data Analyst", focus: "SQL, Pandas, BI Dashboarding, Statistical Modeling, EDA" },
    { name: "Cybersecurity Engineer", focus: "OWASP, Cryptography, OAuth 2.0, Penetration Testing, IAM" },
    { name: "Product Manager", focus: "Roadmap Prioritization, KPI/North Star Metrics, User Testing, Agile" },
    { name: "UI/UX Designer", focus: "Figma Component Systems, Accessibility (WCAG), User Journeys, Usability Testing" },
    { name: "QA Automation Engineer", focus: "Selenium/Playwright, CI/CD Gates, Integration Tests, Test Flakiness" }
  ];

  // Fetch history and load voices on mount
  useEffect(() => {
    if (user?.uid) {
      fetchHistory();
    }

    // Load SpeechSynthesis Voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const list = window.speechSynthesis.getVoices();
        // Show English ones for structured placements
        const englishVoices = list.filter(v => v.lang.startsWith("en"));
        setAvailableVoices(englishVoices);
        
        // Read saved voice name from settings
        let savedVoiceName = "";
        const savedSettingsRaw = user?.uid 
          ? (localStorage.getItem(`student_settings_${user.uid}`) || localStorage.getItem("student_settings"))
          : localStorage.getItem("student_settings");
        if (savedSettingsRaw) {
          try {
            const parsed = JSON.parse(savedSettingsRaw);
            if (parsed.aiConfig?.assistantVoice) {
              savedVoiceName = parsed.aiConfig.assistantVoice;
            }
          } catch (e) {
            console.error("Failed to parse assistantVoice settings:", e);
          }
        }

        // Match natural sounding voices as priority
        const defaultVoice = englishVoices.find(v => v.name === savedVoiceName) || 
                            englishVoices.find(v => 
                              v.name.toLowerCase().includes("natural") || 
                              v.name.toLowerCase().includes("google") || 
                              v.name.toLowerCase().includes("aria") || 
                              v.name.toLowerCase().includes("guy")
                            ) || englishVoices[0];
        
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [user?.uid]);

  const fetchHistory = async () => {
    if (!user?.uid) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`http://localhost:5000/api/interview/history/${user.uid}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistorySessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch database interview history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Database history is already sorted by date descending from backend API
  useEffect(() => {
  }, [historySessions]);

  // Handle click outside custom role dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle active webcam stream
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: false 
      });
      setWebcamStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera access declined or unavailable, falling back to voice stream visualization.", err);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
  };

  // Hardware lifecycle cleanups
  useEffect(() => {
    return () => {
      stopWebcam();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [webcamStream]);

  // Speak AI question out loud
  const speakQuestion = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const list = window.speechSynthesis.getVoices();
        
        // Find selected voice or fallback to natural English
        const chosenVoice = list.find(v => v.name === selectedVoiceName) || 
                            list.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("natural")) ||
                            list.find(v => v.lang.startsWith("en")) || 
                            list[0];
        
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }
        
        // Read saved speech rate setting
        let speed = 0.95;
        const savedSettingsRaw = user?.uid 
          ? (localStorage.getItem(`student_settings_${user.uid}`) || localStorage.getItem("student_settings"))
          : localStorage.getItem("student_settings");
        if (savedSettingsRaw) {
          try {
            const parsed = JSON.parse(savedSettingsRaw);
            if (parsed.aiConfig?.speechSpeed) {
              speed = Number(parsed.aiConfig.speechSpeed);
            }
          } catch (e) {
            console.error("Failed to parse speech speed settings:", e);
          }
        }
        utterance.rate = speed;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }, 150);
    }
  };

  // Sample natural voice preview
  const handleTestVoiceName = () => {
    speakQuestion("Hello, I am your student placement twin interviewer. This is a preview of my natural voice synthesizing pacing.");
  };

  // Countdown timer logic
  useEffect(() => {
    if (viewState !== "active" || isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [viewState, isLoading, currentStep]);

  const handleAutoSubmit = () => {
    // Collect both code compiler blocks and concept description text
    const compiledCode = `[CODEWORKSPACE - LANGUAGE: ${selectedLanguage.toUpperCase()}]\n${codeText}\n\n[STDOUT COMPILER FEEDBACK]\n${consoleOutput || "No compilation run executed"}\n\n[CONCEPTUAL EXPLANATION]\n${answerText.trim() || "[Candidate time expired. No response logged.]"}`;
    triggerSubmitAnswer(compiledCode);
  };

  const handleStartInterview = async () => {
    setIsLoading(true);
    setViewState("active");
    setCurrentStep(1);
    setHistory([]);
    setFeedback("");
    setAnswerText("");
    setCodeText(CODE_TEMPLATES.javascript);
    setSelectedLanguage("javascript");
    setConsoleOutput("");
    setConsoleError("");
    setReport(null);
    startWebcam();

    const initialTime = selectedDifficulty === "Beginner" ? 150 : selectedDifficulty === "Hard" ? 90 : 120;
    setTimeLeft(initialTime);

    try {
      const response = await fetch("http://localhost:5000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role: selectedRole, 
          type: interviewType,
          userId: user?.uid || 'anonymous',
          difficulty: selectedDifficulty
        }),
      });
      const data = await response.json();
      if (data.question) {
        setCurrentQuestion(data.question);
        setCurrentStep(data.step || 1);
        setTotalSteps(data.totalSteps || 3);
        if (data.interviewId) {
          setCurrentInterviewId(data.interviewId);
        }
        
        if (isTtsEnabled) {
          speakQuestion(data.question);
        }
      }
    } catch (err) {
      console.error(err);
      setCurrentQuestion("Failed to connect to the backend server. Please verify the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechToggle = () => {
    if (typeof window === "undefined") return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const latestResultIndex = event.results.length - 1;
        const transcript = event.results[latestResultIndex][0].transcript;
        setAnswerText(prev => prev + (prev ? " " : "") + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setCodeText(CODE_TEMPLATES[lang] || "");
    setConsoleOutput("");
    setConsoleError("");
  };

  // AI-powered compiler execution via backend Gemini sandbox simulation
  const runCodeSandbox = async () => {
    setIsRunningCode(true);
    setConsoleOutput("Initializing runtime sandbox compiler environment...\n");
    setConsoleError("");

    try {
      const response = await fetch("http://localhost:5000/api/interview/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage, code: codeText })
      });
      const data = await response.json();
      
      if (data.stderr) {
        setConsoleError(data.stderr);
        setConsoleOutput(prev => prev + `\n[ERROR] Runtime compilation execution failed.`);
      } else {
        setConsoleOutput(prev => prev + `[SUCCESS] Compilation complete.\n[EXECUTE] Running binary...\n------------------------------------------------\n` + (data.stdout || "(No stdout logged)") + `\n------------------------------------------------`);
      }
    } catch (err: any) {
      setConsoleError(err.message || "Failed to communicate with sandbox environment.");
      setConsoleOutput(prev => prev + `\n[ERROR] Connection to compilation sandbox failed.`);
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleSubmitAnswer = () => {
    // Combine code blocks and concept descriptions
    const combinedOutput = `[CODE WORKSPACE - LANGUAGE: ${selectedLanguage.toUpperCase()}]\n${codeText}\n\n[STDOUT COMPILER FEEDBACK]\n${consoleOutput || "No compilation run executed"}\n\n[CONCEPTUAL EXPLANATION]\n${answerText.trim() || "[No explanation provided]"}`;
    triggerSubmitAnswer(combinedOutput);
  };

  const triggerSubmitAnswer = async (combinedPayload: string) => {
    if (isLoading) return;
    setIsLoading(true);
    
    // Reset Speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const response = await fetch("http://localhost:5000/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          type: interviewType,
          question: currentQuestion,
          answer: combinedPayload,
          step: currentStep,
          history: history.map(h => ({ question: h.question, answer: h.answer })),
          interviewId: currentInterviewId,
          difficulty: selectedDifficulty
        }),
      });
      const data = await response.json();
      
      const newHistory = [...history, { question: currentQuestion, answer: combinedPayload, feedback: data.feedback }];
      setHistory(newHistory);
      setAnswerText("");
      setCodeText(CODE_TEMPLATES[selectedLanguage]);
      setConsoleOutput("");
      setConsoleError("");

      if (data.isCompleted) {
        setReport(data.report);
        setViewState("completed");
        stopWebcam();
        
        // Refresh MongoDB data
        fetchHistory();
      } else {
        setCurrentQuestion(data.nextQuestion);
        setCurrentStep(data.step);
        setFeedback(data.feedback);
        
        const nextTime = selectedDifficulty === "Beginner" ? 150 : selectedDifficulty === "Hard" ? 90 : 120;
        setTimeLeft(nextTime);

        if (isTtsEnabled) {
          speakQuestion(data.nextQuestion);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer. Check server connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAggregatedStats = () => {
    const completed = historySessions.filter(s => s.status === 'completed');
    if (completed.length === 0) {
      return { total: 0, avgTechnical: 0, avgCommunication: 0, avgConfidence: 0, rating: "N/A" };
    }
    const techSum = completed.reduce((acc, s) => acc + (s.report?.technicalScore || 0), 0);
    const commSum = completed.reduce((acc, s) => acc + (s.report?.communicationScore || 0), 0);
    const confSum = completed.reduce((acc, s) => acc + (s.report?.confidenceScore || 0), 0);
    const totalCount = completed.length;

    const avgT = Math.round(techSum / totalCount);
    const avgM = Math.round(commSum / totalCount);
    const avgC = Math.round(confSum / totalCount);
    const overall = Math.round((avgT + avgM + avgC) / 3);

    let rating = "C-Tier";
    if (overall >= 90) rating = "S-Tier";
    else if (overall >= 80) rating = "A-Tier";
    else if (overall >= 70) rating = "B-Tier";

    return {
      total: totalCount,
      avgTechnical: avgT,
      avgCommunication: avgM,
      avgConfidence: avgC,
      rating
    };
  };

  const stats = getAggregatedStats();

  const handleOpenModal = (session: DBInterviewSession) => {
    setSelectedHistorySession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedHistorySession(null);
    setIsModalOpen(false);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Helper for generating line number blocks
  const codeLines = codeText.split('\n');
  const lineNumbers = Array.from({ length: Math.max(codeLines.length, 1) }, (_, i) => i + 1);

  return (
    <div className="space-y-8 font-sans print-hidden">
      {/* Stylesheet injection for native printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: white !important;
            color: black !important;
            font-size: 12px !important;
          }
          .print-hidden {
            display: none !important;
          }
          .printable-report {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            z-index: 99999 !important;
            background: white !important;
            color: black !important;
            padding: 2rem !important;
          }
        }
      ` }} />

      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Placement Assessment loops</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-1 bg-gradient-to-r from-zinc-900 via-indigo-950 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-300 bg-clip-text text-transparent">
            AI Interview Terminal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium max-w-2xl">
            Simulate realistic board placement questions with premium vocal agent synthesis and dual editor compiler execution panels.
          </p>
        </div>

        {viewState === "completed" && (
          <button 
            onClick={() => setViewState("config")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-500" />
            Return to Panel
          </button>
        )}
      </header>

      {/* VIEW STATE: CONFIGURATION & HISTORY */}
      {viewState === "config" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main config pane */}
          <div className="xl:col-span-2 space-y-8">
            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-zinc-200/50 dark:border-zinc-800/40 group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-110 transition-all duration-700"></div>
              
              <h2 className="text-lg font-black mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Configure Placement Parameters
              </h2>
              
              <div className="space-y-6">
                {/* 1. Target Role Selection Dropdown */}
                <div className="relative" ref={roleDropdownRef}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
                    Target Role Domain
                  </label>
                  
                  {/* Selected Role Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/30 dark:bg-zinc-900/10 hover:border-indigo-500/40 text-left transition-all cursor-pointer flex items-center justify-between group shadow-sm active:scale-99"
                  >
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                        {selectedRole}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold leading-normal">
                        {roles.find(r => r.name === selectedRole)?.focus || "Choose your focus area"}
                      </span>
                    </div>
                    <div className="shrink-0 ml-4 p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-650 dark:group-hover:text-zinc-200 transition-colors">
                      <ChevronRight className={`w-4 h-4 transform transition-transform duration-300 ${isRoleDropdownOpen ? "rotate-90 text-indigo-500" : ""}`} />
                    </div>
                  </button>

                  {/* Dropdown Menu Overlay */}
                  {isRoleDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 p-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/80 shadow-2xl rounded-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[360px] flex flex-col">
                      {/* Search Bar */}
                      <div className="relative mb-2">
                        <input
                          type="text"
                          placeholder="Search target roles..."
                          value={roleSearchQuery}
                          onChange={(e) => setRoleSearchQuery(e.target.value)}
                          className="w-full p-2.5 pl-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500/50 transition-all placeholder-zinc-400"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        {roleSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setRoleSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Dropdown List Items */}
                      <div className="overflow-y-auto space-y-1 pr-1 flex-1">
                        {roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())).length === 0 ? (
                          <div className="py-8 text-center text-zinc-450 text-xs font-bold uppercase tracking-wider">
                            No matching roles found
                          </div>
                        ) : (
                          roles
                            .filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()))
                            .map((role) => (
                              <button
                                key={role.name}
                                type="button"
                                onClick={() => {
                                  setSelectedRole(role.name);
                                  setIsRoleDropdownOpen(false);
                                  setRoleSearchQuery("");
                                }}
                                className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-center border ${
                                  selectedRole === role.name 
                                    ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/5 shadow-[0_4px_15px_rgba(99,102,241,0.08)]" 
                                    : "border-transparent bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:border-zinc-200/50 dark:hover:border-zinc-800/40"
                                }`}
                              >
                                <span className={`font-extrabold text-xs flex items-center gap-1.5 ${
                                  selectedRole === role.name ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-900 dark:text-white"
                                }`}>
                                  <Activity className={`w-3 h-3 ${selectedRole === role.name ? "text-indigo-500" : "text-zinc-400"}`} />
                                  {role.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold leading-normal">
                                  {role.focus}
                                </span>
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Difficulty Tiers */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3.5">
                    Placement Difficulty Level
                  </label>
                  <div className="flex gap-3">
                    {(["Beginner", "Moderate", "Hard"] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedDifficulty(level)}
                        className={`flex-1 py-3.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                          selectedDifficulty === level 
                            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md"
                            : "border-zinc-250 dark:border-zinc-800 bg-white/20 dark:bg-zinc-900/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700"
                        }`}
                      >
                        {level} {level === "Beginner" ? "• 150s" : level === "Hard" ? "• 90s" : "• 120s"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Category Type */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3.5">
                    Assessment Focus Category
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setInterviewType("technical")}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden group/item ${
                        interviewType === "technical" 
                          ? "border-indigo-500 bg-indigo-500/5 shadow-[0_4px_15px_rgba(99,102,241,0.05)]" 
                          : "border-zinc-200 dark:border-zinc-800 bg-white/5 dark:bg-zinc-900/10 hover:border-indigo-500/30"
                      }`}
                    >
                      <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover/item:scale-105 duration-300 ${
                        interviewType === "technical" 
                          ? "bg-indigo-500/15 text-indigo-500 border border-indigo-500/20" 
                          : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 border border-transparent"
                      }`}>
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs text-zinc-900 dark:text-white">Technical Architecture</h3>
                        <p className="text-[10px] text-zinc-450 mt-0.5">Systems, syntax & tradeoffs.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setInterviewType("hr")}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden group/item ${
                        interviewType === "hr" 
                          ? "border-indigo-500 bg-indigo-500/5 shadow-[0_4px_15px_rgba(99,102,241,0.05)]" 
                          : "border-zinc-200 dark:border-zinc-800 bg-white/5 dark:bg-zinc-900/10 hover:border-indigo-500/30"
                      }`}
                    >
                      <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover/item:scale-105 duration-300 ${
                        interviewType === "hr" 
                          ? "bg-indigo-500/15 text-indigo-500 border border-indigo-500/20" 
                          : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 border border-transparent"
                      }`}>
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs text-zinc-900 dark:text-white">Behavioral / HR Loop</h3>
                        <p className="text-[10px] text-zinc-455 mt-0.5">STAR method, leadership & logs.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Vocal Synthesis Dropdown & Test Settings */}
                <div className="pt-5 border-t border-zinc-250 dark:border-zinc-800/60 space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Interviewer Premium Vocal Agent (TTS)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1 flex gap-2">
                      <button
                        onClick={() => setIsTtsEnabled(!isTtsEnabled)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer shrink-0 ${
                          isTtsEnabled 
                            ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" 
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-transparent"
                        }`}
                        title={isTtsEnabled ? "Mute Recruiter Voice" : "Enable Recruiter Voice"}
                      >
                        {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </button>
                      
                      <select
                        disabled={!isTtsEnabled}
                        value={selectedVoiceName}
                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                        className="w-full p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-750 dark:text-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500/50 transition-all disabled:opacity-40"
                      >
                        {availableVoices.length === 0 ? (
                          <option>Loading system vocal synthesizer voices...</option>
                        ) : (
                          availableVoices.map(voice => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang}) {voice.name.toLowerCase().includes("natural") ? "🌟 Premium" : ""}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <button
                      type="button"
                      disabled={!isTtsEnabled || !selectedVoiceName}
                      onClick={handleTestVoiceName}
                      className="px-5 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer transition-all disabled:opacity-40 shrink-0"
                    >
                      Sample Human Voice
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      3 loop questions • 120s timer
                    </span>
                  </div>

                  <button
                    onClick={handleStartInterview}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-655 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg active:scale-98 transition-all cursor-pointer border border-indigo-500/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Launch Session
                  </button>
                </div>
              </div>
            </div>

            {/* Historical Sessions List */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  Past Sessions History
                </h2>
                {loadingHistory && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
              </div>

              {historySessions.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/10">
                  <Activity className="w-10 h-10 text-zinc-400 mx-auto opacity-40 mb-3" />
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">No completed sessions logged yet</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Initialize and finish an interview to see report records.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historySessions.map((session) => {
                    const avgScore = session.report ? Math.round(
                      (session.report.technicalScore + session.report.communicationScore + session.report.confidenceScore) / 3
                    ) : 0;
                    
                    return (
                      <div 
                        key={session._id}
                        className="flex flex-col justify-between p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/20 dark:bg-zinc-900/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                              session.type === 'technical' 
                                ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/25"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                            }`}>
                              {session.type}
                            </span>
                            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white mt-2 leading-tight">
                              {session.role}
                            </h4>
                            <p className="text-[10px] text-zinc-450 mt-1 font-bold">
                              {new Date(session.createdAt).toLocaleDateString(undefined, { 
                                month: 'short', day: 'numeric', year: 'numeric' 
                              })}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-xl font-black ${
                              avgScore >= 80 ? "text-emerald-500" : avgScore >= 70 ? "text-orange-500" : "text-rose-500"
                            }`}>
                              {avgScore}
                            </span>
                            <span className="text-[10px] text-zinc-450 font-bold block">Rating</span>
                          </div>
                        </div>

                        {session.report && (
                          <button
                            onClick={() => handleOpenModal(session)}
                            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 rounded-xl text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 cursor-pointer transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detailed Diagnostic
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Aggregated sidebar pane */}
          <div className="space-y-8">
            <div className="glass-panel rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-800/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                <Award className="w-4.5 h-4.5 text-indigo-500" />
                Competency Aggregates
              </h3>

              {stats.total === 0 ? (
                <div className="py-6 text-center text-zinc-455 text-xs">
                  <Activity className="w-8 h-8 text-zinc-400 mx-auto opacity-30 mb-2" />
                  <p className="font-bold uppercase tracking-wider text-[10px]">No Competency Vectors</p>
                  <p className="text-[10px] mt-0.5">Complete your initial assessment to index scores.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Rank badge */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-650 flex items-center justify-center font-black text-white text-lg shadow-md shrink-0">
                      {stats.rating}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-450">Twin Rating Index</p>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">Average performance ranking across loops.</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <ProgressIndicator label="Technical Mastery" score={stats.avgTechnical} gradient="from-blue-500 to-indigo-500" />
                    <ProgressIndicator label="Communication Efficiency" score={stats.avgCommunication} gradient="from-emerald-500 to-teal-500" />
                    <ProgressIndicator label="Confidence Vector Index" score={stats.avgConfidence} gradient="from-orange-500 to-amber-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-800/40 relative">
              <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
                Candidate Integrity Shield
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal font-medium">
                Our twin engine simulates camera feedback & dictation streams. Grant permissions for both to experience actual loops or use placeholders.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                <UserCheck className="w-3.5 h-3.5" />
                Browser Sandbox Verified
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW STATE: ACTIVE ASSESSMENT INTERVIEW WITH DUAL CODE / CONCEPT RESPONSES */}
      {viewState === "active" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Active Terminal Panel (Left 8 cols for Dual Workspace) */}
          <div className="lg:col-span-8 glass-panel rounded-3xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800/40 flex flex-col justify-between bg-zinc-950/20">
            
            {/* Terminal Header */}
            <div className="px-5 py-4 border-b border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-450">
                  {interviewType === 'technical' ? "PLACEMENT ALGORITHMIC ENVIRONMENT" : "BEHAVIORAL CASE workspace"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                  Question {currentStep} of {totalSteps}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 capitalize">
                  {selectedDifficulty} Tier
                </span>
              </div>
            </div>

            {/* Terminal Main Streams */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              
              {isLoading && !currentQuestion ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4 flex-1">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <span className="text-[10px] font-black text-zinc-450 uppercase tracking-widest animate-pulse">
                    Synthesizing Question Context...
                  </span>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col">
                  {/* AI Recruiter Panel */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        AI Twin Recruiter
                      </h3>
                      {isTtsEnabled && (
                        <button
                          onClick={() => speakQuestion(currentQuestion)}
                          className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-indigo-500 hover:underline cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          Repeat Question
                        </button>
                      )}
                    </div>
                    <div className="p-5 bg-zinc-50/80 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 leading-relaxed">
                        {currentQuestion}
                      </p>
                    </div>
                  </div>

                  {/* DUAL WORKSPACE: CODING EDITOR + CONCEPT EXPLANATION */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 flex-1 items-stretch">
                    
                    {/* LEFT PANEL: Coding Compiler Workspace */}
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-indigo-500" />
                          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Coding Compiler Workspace
                          </h3>
                        </div>

                        {/* Language Select Dropdown */}
                        <select
                          value={selectedLanguage}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="p-1 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold outline-none focus:border-indigo-500/50"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="cpp">C++</option>
                          <option value="java">Java</option>
                        </select>
                      </div>

                      {/* Code editor frame with line numbers */}
                      <div className="flex-1 flex bg-zinc-950 text-zinc-150 font-mono text-xs p-3 rounded-2xl border border-zinc-850 min-h-[220px]">
                        <div className="select-none text-right pr-3 border-r border-zinc-850 mr-3 text-zinc-600 dark:text-zinc-550 leading-6 text-[10px]">
                          {lineNumbers.map(n => <div key={n}>{n}</div>)}
                        </div>
                        <textarea
                          value={codeText}
                          onChange={(e) => setCodeText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Tab") {
                              e.preventDefault();
                              const start = e.currentTarget.selectionStart;
                              const end = e.currentTarget.selectionEnd;
                              const newVal = codeText.substring(0, start) + "  " + codeText.substring(end);
                              setCodeText(newVal);
                              setTimeout(() => {
                                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                              }, 0);
                            }
                          }}
                          className="w-full bg-transparent text-zinc-150 outline-none resize-none leading-6 font-mono text-[11px]"
                        />
                      </div>

                      {/* Run compile trigger and terminal logs console */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Compiler Terminal Stdout</span>
                          <button
                            onClick={runCodeSandbox}
                            disabled={isRunningCode}
                            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500 hover:bg-indigo-650 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            {isRunningCode ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                            Run Code
                          </button>
                        </div>
                        <div className="bg-black p-3.5 rounded-xl border border-zinc-850 text-[10px] font-mono h-24 overflow-y-auto shadow-inner text-emerald-500">
                          {consoleError && (
                            <div className="text-rose-500 font-bold mb-1.5">[COMPILE ERROR] {consoleError}</div>
                          )}
                          <div className="whitespace-pre-line text-zinc-200 leading-normal">{consoleOutput || "Compiler Output Stream Idle..."}</div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: Conceptual Explanation */}
                    <div className="flex flex-col space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-indigo-500" />
                          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Conceptual Explanation & STAR log
                          </h3>
                        </div>

                        {/* Dictation voice stream trigger */}
                        <button 
                          onClick={handleSpeechToggle}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                            isListening 
                              ? "bg-rose-500 text-white border-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse" 
                              : "bg-white dark:bg-zinc-900/60 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-855 hover:border-indigo-500/30"
                          }`}
                        >
                          {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-indigo-500" />}
                          {isListening ? "Listening..." : "Dictate"}
                        </button>
                      </div>

                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Detail your conceptual approach here. Use the STAR method to map out problem scenarios, tasks, exact execution action paths, and final latency/system results..."
                        className="flex-1 w-full p-4 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-850 text-zinc-900 dark:text-white text-xs font-semibold rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none placeholder-zinc-400 leading-relaxed shadow-inner min-h-[220px]"
                      />
                    </div>

                  </div>

                  {/* Bottom Panel Actions */}
                  <div className="flex items-center justify-between pt-5 border-t border-zinc-200/40 dark:border-zinc-800/40">
                    <button 
                      onClick={() => {
                        if (confirm("Terminate placement loop? Discarded progression reports cannot be restored.")) {
                          stopWebcam();
                          setViewState("config");
                        }
                      }}
                      className="text-xs font-bold text-zinc-450 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      Cancel Loop
                    </button>

                    <button
                      onClick={handleSubmitAnswer}
                      disabled={(!answerText.trim() && !codeText.trim()) || isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-[0_4px_15px_rgba(99,102,241,0.2)] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {currentStep === totalSteps ? "Compile Evaluation" : "Submit Answer"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right stream check (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            {/* Webcam / Wave container */}
            <div className="glass-panel rounded-3xl overflow-hidden shadow-sm relative bg-zinc-950 aspect-video lg:aspect-auto lg:flex-1 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800/50 min-h-[200px]">
              
              {/* Webcam Live Capture element */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  webcamStream ? "opacity-100" : "opacity-0"
                }`}
              />

              <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              
              <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 bg-black/60 border border-white/5 rounded-lg backdrop-blur-md z-10">
                <span className={`w-2 h-2 rounded-full ${webcamStream ? "bg-emerald-500" : "bg-orange-500"} animate-pulse`}></span>
                <span className="text-[9px] font-black uppercase text-white tracking-widest">
                  {webcamStream ? "LIVE CAMERA STREAM" : "AUDIO ONLY MONITOR"}
                </span>
              </div>
              
              {/* Virtual waveform visualization if webcam disabled */}
              {!webcamStream && (
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isListening ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                  }`}>
                    <Mic className={`w-6 h-6 ${isListening ? "animate-pulse" : ""}`} />
                  </div>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {isListening ? "Active Audio Capture" : "Audio Capture Idle"}
                  </span>
                </div>
              )}

              {/* Pulsing visual feedback audio wave */}
              {isListening && (
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 h-8 z-10 bg-black/30 py-1">
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-7" style={{ animationDelay: '300ms' }}></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-4" style={{ animationDelay: '450ms' }}></span>
                  <span className="w-1 bg-rose-500 rounded-full animate-bounce h-6" style={{ animationDelay: '600ms' }}></span>
                </div>
              )}
            </div>

            {/* Countdown timer card */}
            <div className="glass-panel p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/40 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${timeLeft < 20 ? "text-rose-500 animate-bounce" : "text-indigo-500"}`} />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Time Allotted
                  </span>
                </div>
                <span className={`text-base font-black ${
                  timeLeft < 20 ? "text-rose-500 animate-pulse scale-105" : "text-zinc-800 dark:text-white"
                } transition-all`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="w-full bg-zinc-200/50 dark:bg-zinc-800/50 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    timeLeft < 20 ? "bg-rose-500" : timeLeft < 50 ? "bg-orange-500" : "bg-indigo-500"
                  }`} 
                  style={{ width: `${(timeLeft / (selectedDifficulty === "Beginner" ? 150 : selectedDifficulty === "Hard" ? 90 : 120)) * 100}%` }}
                />
              </div>
            </div>

            {/* Instant AI Step Feedback (appears post Q1) */}
            {feedback && (
              <div className="glass-panel p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/40 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-lg"></div>
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Realtime Feedback
                </h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                  {feedback}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* VIEW STATE: COMPLETED ASSESSMENT REPORT CARD */}
      {viewState === "completed" && report && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-98 duration-500 relative">
          
          {/* Confetti celebration container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <ConfettiStream />
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden shadow-xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800/40 relative">
            <div className="absolute -top-12 -right-12 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
              <div className="p-4.5 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-2xl shadow-[0_4px_25px_rgba(16,185,129,0.25)]">
                <Award className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Placement Evaluation Completed!</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium max-w-md mx-auto">
                  Your AI Twin placement agent has evaluated your verbal transcript responses against criteria mapped for {selectedRole}.
                </p>
              </div>
            </div>

            {/* Neon score rings grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <ScoreCircle score={report.technicalScore} label="Technical Competency Index" colorClass="stroke-blue-500" glowColor="rgba(59,130,246,0.5)" />
              <ScoreCircle score={report.communicationScore} label="Behavioral & Articulation" colorClass="stroke-emerald-500" glowColor="rgba(16,185,129,0.5)" />
              <ScoreCircle score={report.confidenceScore} label="Tone Integrity Vector" colorClass="stroke-orange-500" glowColor="rgba(249,115,22,0.5)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60">
                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <AwardIcon className="w-4 h-4" />
                  Twin Assessment Summary
                </h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                  {report.summary || "You successfully communicated core system methodologies. Your answers demonstrated logical execution flows and structured logic matching mid-to-senior profiles."}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/60">
                <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Identified Skill Gaps
                </h4>
                <ul className="text-xs text-zinc-655 dark:text-zinc-300 space-y-1.5 font-semibold list-disc list-inside">
                  {report.gaps && report.gaps.length > 0 ? (
                    report.gaps.map((gap, i) => <li key={i}>{gap}</li>)
                  ) : (
                    <>
                      <li>Elaborate on database replication lags.</li>
                      <li>Incorporate concrete latency metrics in action logs.</li>
                      <li>Clarify network handshake structures in detail.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Chronological loop review logs */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Chronological Session Logs</h3>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="p-5 bg-zinc-50/50 dark:bg-zinc-955/25 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">LOCKED QUESTION {index + 1}</span>
                    </div>
                    <p className="text-xs font-extrabold text-zinc-805 dark:text-zinc-150 leading-relaxed">
                      {item.question}
                    </p>
                    
                    <div className="pl-4 border-l-2 border-zinc-250 dark:border-zinc-800 py-1 space-y-2">
                      <div className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Candidate response transcript:</div>
                      <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap italic bg-black/10 dark:bg-black/35 p-3 rounded-xl">
                        {item.answer}
                      </p>
                      {item.feedback && (
                        <>
                          <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-2">AI Recruiter comment:</div>
                          <p className="text-xs text-zinc-700 dark:text-zinc-305 leading-relaxed font-semibold">
                            {item.feedback}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiter verbose summary */}
            <div className="space-y-3.5 mt-8">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Placement Board Boardroom Report</h3>
              <div className="p-6 bg-zinc-55 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl leading-relaxed text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line font-semibold shadow-inner">
                {report.detailedEvaluation}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/40">
              <button 
                onClick={() => setViewState("config")}
                className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black uppercase tracking-wider hover:shadow-md active:scale-95 transition-all cursor-pointer text-center"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-750 text-zinc-800 dark:text-white text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                Export PDF Report
              </button>
              <button 
                onClick={handleStartInterview}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-500 dark:text-indigo-400 text-xs font-black uppercase tracking-wider border border-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Re-enter Loop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY VERSION OF COMPLETED REPORT (NATIVE PDF TEMPLATE) */}
      {report && (
        <div className="hidden printable-report w-full bg-white text-zinc-900 p-8 font-sans">
          <div className="border-b-4 border-indigo-600 pb-5 mb-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-indigo-900">Placement Assessment Report</h1>
                <p className="text-xs text-zinc-500 mt-1">Generated by Student AI Twin Platform • MongoDB Persisted</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400">DATE: {new Date().toLocaleDateString()}</p>
                <p className="text-xs font-bold text-zinc-400 font-mono">CANDIDATE: {user?.name || "Student User"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-zinc-200 rounded-xl text-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Technical Score</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{report.technicalScore}/100</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-xl text-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Communication Score</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{report.communicationScore}/100</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-xl text-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Confidence Score</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{report.confidenceScore}/100</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-2">Recruiter Summary Evaluation</h3>
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs leading-relaxed text-zinc-800 whitespace-pre-line">
              {report.detailedEvaluation}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">Interview Q&A Transcript Review</h3>
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div key={idx} className="p-4 border border-zinc-150 rounded-xl space-y-2 text-xs">
                  <p className="font-extrabold text-zinc-900">Q{idx + 1}: {item.question}</p>
                  <p className="text-zinc-650 italic pl-3 border-l-2 border-zinc-300 whitespace-pre-wrap">Answer: {item.answer}</p>
                  {item.feedback && <p className="text-emerald-700 pl-3">Critique: {item.feedback}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DRAWER FOR VIEWING HISTORICAL SESSIONS */}
      {isModalOpen && selectedHistorySession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200 relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-zinc-150 dark:border-zinc-800/60">
              <div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${
                  selectedHistorySession.type === 'technical' 
                    ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/25"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                }`}>
                  {selectedHistorySession.type} Mode
                </span>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mt-2">
                  {selectedHistorySession.role} Report
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                  Completed {new Date(selectedHistorySession.createdAt).toLocaleDateString(undefined, { 
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedHistorySession.report && (
              <>
                {/* Score meters grid inside modal */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Technical</span>
                    <p className="text-xl font-black text-indigo-500 mt-1">{selectedHistorySession.report.technicalScore}/100</p>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Behavioral</span>
                    <p className="text-xl font-black text-emerald-500 mt-1">{selectedHistorySession.report.communicationScore}/100</p>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Confidence</span>
                    <p className="text-xl font-black text-orange-500 mt-1">{selectedHistorySession.report.confidenceScore}/100</p>
                  </div>
                </div>

                {/* Recruiter Evaluation Detailed text */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Detailed Evaluation Summary</h4>
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-955/45 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold whitespace-pre-wrap">
                    {selectedHistorySession.report.detailedEvaluation}
                  </div>
                </div>

                {/* Dynamic Summary & Gaps inside history modal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Twin Assessment Summary</h4>
                    <p className="text-xs text-zinc-650 dark:text-zinc-300 font-semibold leading-relaxed">
                      {selectedHistorySession.report.summary || "You successfully communicated core system methodologies. Your answers demonstrated logical execution flows and structured logic matching mid-to-senior profiles."}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Identified Skill Gaps</h4>
                    <ul className="text-xs text-zinc-650 dark:text-zinc-300 space-y-1 font-semibold list-disc list-inside">
                      {selectedHistorySession.report.gaps && selectedHistorySession.report.gaps.length > 0 ? (
                        selectedHistorySession.report.gaps.map((gap, i) => <li key={i}>{gap}</li>)
                      ) : (
                        <>
                          <li>Elaborate on database replication lags.</li>
                          <li>Incorporate concrete latency metrics in action logs.</li>
                          <li>Clarify network handshake structures in detail.</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* History list of questions/answers */}
                {selectedHistorySession.history && selectedHistorySession.history.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dialogue Transcript Logs</h4>
                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                      {selectedHistorySession.history.map((qa, index) => (
                        <div key={index} className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-2">
                          <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-250">
                            Q{index + 1}: {qa.question}
                          </p>
                          <div className="pl-3 border-l border-zinc-200 dark:border-zinc-800 italic text-[11px] text-zinc-550 dark:text-zinc-400 bg-black/5 dark:bg-black/20 p-2.5 rounded-lg whitespace-pre-wrap">
                            {qa.answer || "[No response transcript recorded]"}
                          </div>
                          {qa.feedback && (
                            <div className="pl-3 text-[11px] text-emerald-600 dark:text-emerald-500 font-semibold">
                              Critique: {qa.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Modal actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800/60">
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close Panel
              </button>
              
              {selectedHistorySession.report && (
                <button
                  onClick={() => {
                    handlePrint();
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print Evaluation
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PRINT-ONLY VERSION OF COMPLETED REPORT (NATIVE PDF TEMPLATE - FROM DETAIL DRAWER MODAL) */}
      {selectedHistorySession && selectedHistorySession.report && (
        <div className="hidden printable-report w-full bg-white text-zinc-900 p-8 font-sans">
          <div className="border-b-4 border-indigo-600 pb-5 mb-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-indigo-900">Placement Assessment Report</h1>
                <p className="text-xs text-zinc-500 mt-1">Generated by Student AI Twin Platform • MongoDB Persisted</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-400">DATE: {new Date(selectedHistorySession.createdAt).toLocaleDateString()}</p>
                <p className="text-xs font-bold text-zinc-400 font-mono">CANDIDATE: {user?.name || "Student User"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-zinc-200 rounded-xl text-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Technical Score</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{selectedHistorySession.report.technicalScore}/100</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-xl text-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Communication Score</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{selectedHistorySession.report.communicationScore}/100</p>
            </div>
            <div className="p-4 border border-zinc-200 rounded-xl text-center">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Confidence Score</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{selectedHistorySession.report.confidenceScore}/100</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-2">Recruiter Summary Evaluation</h3>
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs leading-relaxed text-zinc-800 whitespace-pre-line">
              {selectedHistorySession.report.detailedEvaluation}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider mb-3">Interview Q&A Transcript Review</h3>
            <div className="space-y-4">
              {selectedHistorySession.history && selectedHistorySession.history.map((item, idx) => (
                <div key={idx} className="p-4 border border-zinc-150 rounded-xl space-y-2 text-xs">
                  <p className="font-extrabold text-zinc-900">Q{idx + 1}: {item.question}</p>
                  <p className="text-zinc-650 italic pl-3 border-l-2 border-zinc-300 whitespace-pre-wrap">Answer: {item.answer}</p>
                  {item.feedback && <p className="text-emerald-700 pl-3">Critique: {item.feedback}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* SUB COMPONENTS */

function ProgressIndicator({ label, score, gradient }: { label: string; score: number; gradient: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-zinc-550 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">{label}</span>
        <span className="font-extrabold text-indigo-500 dark:text-indigo-400 text-xs">{score}%</span>
      </div>
      <div className="h-2 w-full bg-zinc-200/50 dark:bg-zinc-800/40 border border-zinc-200/20 dark:border-zinc-800/20 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
}

function ScoreCircle({ score, label, colorClass, glowColor }: { score: number; label: string; colorClass: string; glowColor: string }) {
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-6 bg-zinc-900/40 border border-zinc-800/40 rounded-3xl backdrop-blur-xl relative overflow-hidden group shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-550"></div>
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="stroke-zinc-850"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-white">{score}</span>
          <span className="text-[9px] text-zinc-500 font-extrabold tracking-widest uppercase">Index</span>
        </div>
      </div>
      <span className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

function ConfettiStream() {
  const shards = Array.from({ length: 40 });
  return (
    <>
      {shards.map((_, i) => {
        const left = Math.random() * 100; // %
        const delay = Math.random() * 3.5; // s
        const duration = 2.5 + Math.random() * 2.5; // s
        const size = 6 + Math.random() * 6; // px
        const color = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'][i % 5];
        return (
          <div
            key={i}
            className={`absolute rounded-sm opacity-70 animate-bounce ${color}`}
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              top: `-10px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              animationIterationCount: 'infinite',
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      })}
    </>
  );
}
