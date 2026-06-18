"use client";


import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface DailyTask {
  id: string;
  label: string;
  category: 'coding' | 'interview' | 'resume' | 'academics';
  completed: boolean;
}

interface PracticeLog {
  id: string;
  date: string;
  category: 'coding' | 'interview' | 'resume' | 'revision';
  duration: number;
  notes: string;
}

interface QuizQuestion {
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    topic: "Operating Systems",
    question: "What is the primary difference between a process and a thread?",
    options: [
      "A process has its own address space, whereas threads share the address space of their parent process.",
      "Processes are managed by the hardware, whereas threads are managed by the kernel.",
      "Threads run in parallel, whereas processes can only run sequentially.",
      "Processes use shared memory by default, while threads require message passing IPC."
    ],
    correctAnswer: 0,
    explanation: "Processes are independent execution units with their own private memory/address space. Threads are execution contexts within a process that share the process's code, data, and system resources."
  },
  {
    topic: "Computer Networks",
    question: "Which TCP header flag is used to initiate a connection handshake request?",
    options: [
      "ACK (Acknowledgment)",
      "FIN (Finish)",
      "SYN (Synchronize)",
      "RST (Reset)"
    ],
    correctAnswer: 2,
    explanation: "The TCP 3-way handshake begins with a client sending a packet with the SYN (Synchronize) flag set, indicating the start of a connection sequence."
  },
  {
    topic: "System Design",
    question: "Which partitioning scheme allocates database records to servers based on hashing the partition key?",
    options: [
      "Range-based Partitioning",
      "List-based Partitioning",
      "Hash-based (Consistent) Partitioning",
      "Round-robin Partitioning"
    ],
    correctAnswer: 2,
    explanation: "Hash-based partitioning applies a hash function to the partition key of a record to determine the target server/partition, helping distribute load evenly across nodes."
  },
  {
    topic: "Database Systems",
    question: "In relational databases, what property ensures that once a transaction is committed, it remains saved even in the event of a crash?",
    options: [
      "Atomicity",
      "Consistency",
      "Isolation",
      "Durability"
    ],
    correctAnswer: 3,
    explanation: "Durability is the ACID property that guarantees that database transactions that have committed will survive permanently, typically by writing logs to non-volatile storage."
  }
];

const SEED_LOGS: PracticeLog[] = [];

export default function StudentDashboardOverview() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("Student");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', content: "Hi there! I am your AI Twin. Ask me anything about your placements, mock interviews, or resume improvement tips." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const [resumeData, setResumeData] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [codingProfile, setCodingProfile] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Daily checklist tasks
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: "1", label: "Solve 1 Medium LeetCode problem", category: "coding", completed: false },
    { id: "2", label: "Conduct a 15-minute mock interview", category: "interview", completed: false },
    { id: "3", label: "Address 1 resume suggestion tip", category: "resume", completed: false },
    { id: "4", label: "Revise TCP/IP three-way handshake", category: "academics", completed: false }
  ]);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<'coding' | 'interview' | 'resume' | 'academics'>("coding");

  // Practice session logging
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([]);
  const [logCategory, setLogCategory] = useState<'coding' | 'interview' | 'resume' | 'revision'>("coding");
  const [logDuration, setLogDuration] = useState<number>(30);
  const [logNotes, setLogNotes] = useState("");
  const [logSuccessMessage, setLogSuccessMessage] = useState<string | null>(null);

  // Pomodoro timer widget
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerIsRunning, setTimerIsRunning] = useState(false);

  // Daily Quiz challenge
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);
  const [quizDayIndex, setQuizDayIndex] = useState(0);

  // Heatmap cell hover — floating tooltip
  const [selectedHeatCell, setSelectedHeatCell] = useState<{ date: string; level: number; x: number; y: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadProfileName = async () => {
    if (!user) return;
    
    // First try localStorage
    let nameLoaded = false;
    const saved = localStorage.getItem(`student_profile_${user.uid}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) {
          setFirstName(parsed.fullName.split(" ")[0]);
          nameLoaded = true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    if (!nameLoaded && user?.name) {
      setFirstName(user.name.split(" ")[0]);
    }

    // Then attempt database fetch
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.fullName) {
          setFirstName(json.data.fullName.split(" ")[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load profile name from DB on dashboard:", err);
    }
  };

  useEffect(() => {
    loadProfileName();
    window.addEventListener('profile_updated', loadProfileName);
    const openChat = () => setIsChatOpen(true);
    window.addEventListener('openAITwin', openChat);
    return () => {
      window.removeEventListener('profile_updated', loadProfileName);
      window.removeEventListener('openAITwin', openChat);
    };
  }, [user]);

  // Load and seed practice logs & checklists
  useEffect(() => {
    if (!user) return;

    const checklistKey = `daily_checklist_${user.uid}`;
    const logsKey = `practice_logs_${user.uid}`;

    const defaultTasks: DailyTask[] = [
      { id: "1", label: "Solve 1 Medium LeetCode problem", category: "coding", completed: false },
      { id: "2", label: "Conduct a 15-minute mock interview", category: "interview", completed: false },
      { id: "3", label: "Address 1 resume suggestion tip", category: "resume", completed: false },
      { id: "4", label: "Revise TCP/IP three-way handshake", category: "academics", completed: false }
    ];

    const loadChecklistAndLogs = async () => {
      let checklist = defaultTasks;
      let logs = SEED_LOGS;
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (json.data.dailyChecklist && json.data.dailyChecklist.length > 0) {
              checklist = json.data.dailyChecklist;
            }
            if (json.data.practiceLogs && json.data.practiceLogs.length > 0) {
              logs = json.data.practiceLogs;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch checklist/logs from DB:", err);
      }

      // If DB was empty or failed, use local storage
      if (checklist === defaultTasks) {
        const savedTasks = localStorage.getItem(checklistKey);
        if (savedTasks) {
          try { checklist = JSON.parse(savedTasks); } catch {}
        }
      }
      if (logs === SEED_LOGS) {
        const savedLogs = localStorage.getItem(logsKey);
        if (savedLogs) {
          try { logs = JSON.parse(savedLogs); } catch {}
        }
      }

      setDailyTasks(checklist);
      setPracticeLogs(logs);
      localStorage.setItem(checklistKey, JSON.stringify(checklist));
      localStorage.setItem(logsKey, JSON.stringify(logs));
    };

    loadChecklistAndLogs();

    // Set quiz based on current day of month
    setQuizDayIndex(new Date().getDate() % QUIZ_QUESTIONS.length);
  }, [user]);

  const saveTasks = async (tasks: DailyTask[]) => {
    setDailyTasks(tasks);
    if (user) {
      localStorage.setItem(`daily_checklist_${user.uid}`, JSON.stringify(tasks));
      try {
        await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dailyChecklist: tasks })
        });
      } catch (err) {
        console.error("Failed to save daily checklist to DB:", err);
      }
    }
  };

  const saveLogs = async (logs: PracticeLog[]) => {
    setPracticeLogs(logs);
    if (user) {
      localStorage.setItem(`practice_logs_${user.uid}`, JSON.stringify(logs));
      try {
        await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ practiceLogs: logs })
        });
      } catch (err) {
        console.error("Failed to save practice logs to DB:", err);
      }
    }
  };

  const toggleTask = (id: string) => {
    const updated = dailyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks(updated);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskLabel.trim()) return;
    const newTask: DailyTask = {
      id: Date.now().toString(),
      label: newTaskLabel.trim(),
      category: newTaskCategory,
      completed: false
    };
    saveTasks([...dailyTasks, newTask]);
    setNewTaskLabel("");
  };

  const deleteTask = (id: string) => {
    const updated = dailyTasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  // Pomodoro Tick Handler
  useEffect(() => {
    let interval: any = null;
    if (timerIsRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(s => s - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(m => m - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished
          setTimerIsRunning(false);
          setLogCategory("revision");
          setLogDuration(25);
          setLogNotes("Completed a 25-minute Pomodoro study block.");
          setLogSuccessMessage("Timer Finished! Log populated below.");
          setTimeout(() => setLogSuccessMessage(null), 5000);
          setTimerMinutes(25);
          setTimerSeconds(0);
          
          // Micro sound notification
          if (typeof window !== "undefined" && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance("Pomodoro practice complete. Great job!");
            window.speechSynthesis.speak(utterance);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerIsRunning, timerMinutes, timerSeconds]);

  // Log Practice session handler
  const handleLogPractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (logDuration <= 0 || !user) return;

    const newLog: PracticeLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: logCategory,
      duration: Number(logDuration),
      notes: logNotes.trim() || `Practiced ${logCategory} for ${logDuration} mins.`
    };

    const updatedLogs = [newLog, ...practiceLogs];
    saveLogs(updatedLogs);

    setLogNotes("");
    setLogSuccessMessage("Practice logged successfully!");
    setTimeout(() => setLogSuccessMessage(null), 3000);
  };

  // Delete Log handler
  const deleteLog = (id: string) => {
    if (!user) return;
    const updated = practiceLogs.filter(l => l.id !== id);
    saveLogs(updated);
  };

  // Fetch backend data
  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setStatsLoading(true);
      try {
        const fetchResume = async () => {
          try {
            const resumeRes = await fetch(`${API_BASE_URL}/api/resume/latest/${user.uid}`);
            if (resumeRes.ok) {
              const resJson = await resumeRes.json();
              if (resJson.data) setResumeData(resJson.data);
            }
          } catch (e) { console.error("Error fetching resume:", e); }
        };

        const fetchInterviews = async () => {
          try {
            const interviewRes = await fetch(`${API_BASE_URL}/api/interview/history/${user.uid}`);
            if (interviewRes.ok) {
              const intJson = await interviewRes.json();
              if (Array.isArray(intJson)) setInterviews(intJson);
            }
          } catch (e) { console.error("Error fetching interviews:", e); }
        };

        const fetchProfileAndCoding = async () => {
          try {
            // Start with empty handles — only fill from saved profile or localStorage
            let handles = { leetcode: "", codeforces: "", codechef: "" };

            try {
              const res = await fetch(`${API_BASE_URL}/api/student/profile/${user.uid}`);
              if (res.ok) {
                const json = await res.json();
                if (json.success && json.data && json.data.codingHandles) {
                  const h = json.data.codingHandles;
                  if (h.leetcode || h.codeforces || h.codechef) {
                    handles = h;
                  }
                }
              }
            } catch (err) {
              console.error("Failed to fetch handles from DB on dashboard:", err);
            }

            // Fallback to local storage if handles are still empty
            if (!handles.leetcode && !handles.codeforces && !handles.codechef) {
              const savedHandlesRaw = localStorage.getItem(`coding_handles_${user.uid}`);
              if (savedHandlesRaw) {
                try {
                  const h = JSON.parse(savedHandlesRaw);
                  if (h.leetcode || h.codeforces || h.codechef) {
                    handles = h;
                  }
                } catch {}
              }
            }

            localStorage.setItem(`coding_handles_${user.uid}`, JSON.stringify(handles));

            const params = new URLSearchParams();
            if (handles.leetcode) params.set("leetcode", handles.leetcode);
            if (handles.codeforces) params.set("codeforces", handles.codeforces);
            if (handles.codechef) params.set("codechef", handles.codechef);

            if (handles.leetcode || handles.codeforces || handles.codechef) {
              const codingRes = await fetch(`${API_BASE_URL}/api/coding/profile?${params}`);
              if (codingRes.ok) {
                const codingJson = await codingRes.json();
                if (codingJson.success && codingJson.data) setCodingProfile(codingJson.data);
              }
            }
          } catch (e) { console.error("Error fetching coding profile:", e); }
        };

        // Run independent fast requests in parallel to unblock the UI quickly
        await Promise.all([
          fetchResume(),
          fetchInterviews()
        ]);
        
        // Run slow external third-party scraping in the background
        fetchProfileAndCoding();

      } catch (err) {
        console.error("Error in fetchAllData wrapper:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending) return;

    const userMessage: Message = { role: 'user', content: inputVal };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setInputVal("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, uid: user?.uid }),
      });
      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', content: "Failed to connect to the backend server." }]);
    } finally {
      setIsSending(false);
    }
  };

  // Calculations for overall scores and metrics
  const completedInts = interviews.filter(i => i.status === 'completed');
  let avgFeedback = "No interviews completed yet";
  let averageInterviewScore = 0;
  if (completedInts.length > 0) {
    const sum = completedInts.reduce((acc, curr) => {
      const report = curr.report || {};
      const avg = ((report.technicalScore || 0) + (report.communicationScore || 0) + (report.confidenceScore || 0)) / 3;
      return acc + avg;
    }, 0);
    averageInterviewScore = Math.round(sum / completedInts.length);
    avgFeedback = `Avg Score: ${averageInterviewScore}/100`;
  }

  const totalSolved = (codingProfile?.leetcode?.solved || 0) + 
                      (codingProfile?.codeforces?.solved || 0) + 
                      (codingProfile?.codechef?.solved || 0);

  const getPlacementReadiness = () => {
    let scoresCount = 0;
    let totalScore = 0;
    if (resumeData && resumeData.atsScore) { totalScore += resumeData.atsScore; scoresCount++; }
    if (completedInts.length > 0) { totalScore += averageInterviewScore; scoresCount++; }
    if (totalSolved > 0) {
      const codingScore = Math.min(100, Math.round((totalSolved / 150) * 100));
      totalScore += codingScore; scoresCount++;
    }
    return scoresCount === 0 ? 0 : Math.round(totalScore / scoresCount);
  };

  const placementReadiness = getPlacementReadiness();

  // Dynamic calculations from practice logs
  const calculateStreak = (logs: PracticeLog[]) => {
    if (logs.length === 0) return 0;
    const uniqueDays = Array.from(new Set(logs.map(l => l.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    let current = new Date(uniqueDays[0]);

    for (let i = 1; i < uniqueDays.length; i++) {
      const nextDate = new Date(uniqueDays[i]);
      const diffTime = Math.abs(current.getTime() - nextDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        current = nextDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streak;
  };

  const practiceStreak = calculateStreak(practiceLogs);

  const getWeeklyPracticeMinutes = () => {
    const oneWeekAgo = Date.now() - 7 * 86400000;
    return practiceLogs
      .filter(l => new Date(l.date).getTime() >= oneWeekAgo)
      .reduce((sum, l) => sum + l.duration, 0);
  };

  const weeklyPracticeMinutes = getWeeklyPracticeMinutes();
  const weeklyMinutesTarget = 300;

  const getConsistencyScore = () => {
    const activeDaysLast30 = new Set();
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    practiceLogs.forEach(l => {
      const time = new Date(l.date).getTime();
      if (time >= thirtyDaysAgo) {
        activeDaysLast30.add(l.date);
      }
    });
    return Math.min(100, Math.round((activeDaysLast30.size / 30) * 100));
  };

  const consistencyScore = getConsistencyScore();

  // Recommendations builder
  const recommendations: { title: string; desc: string; type: 'coding' | 'resume' | 'job' }[] = [];
  if (!resumeData) {
    recommendations.push({ title: "Upload Resume for ATS scoring", desc: "Our AI Twin scans your experience keywords to give custom recommendations.", type: "resume" });
  } else if (resumeData.missingKeywords?.length > 0) {
    recommendations.push({ title: "Add Missing Experience Keywords", desc: `Keywords missing from your resume: ${resumeData.missingKeywords.slice(0, 3).join(", ")}.`, type: "resume" });
  }
  if (completedInts.length === 0) {
    recommendations.push({ title: "Conduct First AI Mock Interview", desc: "Launch mock interviews to diagnostic technical & communication levels.", type: "job" });
  }
  if (totalSolved < 50) {
    recommendations.push({ title: "Push solved coding count past 100+", desc: "More solved coding questions indicates strong problem solving indices.", type: "coding" });
  }
  if (recommendations.length === 0) {
    recommendations.push({ title: "Revise Operating Systems Paging", desc: "A common interview focus point. Focus on LRU and page table lookups.", type: "job" });
  }

  const checklistCompletedPct = dailyTasks.length > 0 
    ? Math.round((dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100) 
    : 0;

  const skillsToDisplay: string[] = resumeData?.skills?.length > 0 
    ? resumeData.skills.slice(0, 4) 
    : ["React / Next.js", "Node.js", "Python", "System Design"];

  const getProgress = (skillName: string, idx: number) => {
    if (!resumeData) return [85, 75, 60, 40][idx % 4];
    const progressMap: Record<string, number> = { react: 85, nextjs: 85, node: 80, typescript: 80, javascript: 85, python: 75, java: 70, cpp: 70, sql: 75, mongodb: 70 };
    const key = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [k, val] of Object.entries(progressMap)) if (key.includes(k)) return val;
    return 65 - (idx * 5);
  };

  const getGradient = (idx: number) => [
    "from-indigo-500 to-cyan-500", 
    "from-indigo-500 to-purple-500", 
    "from-purple-500 to-rose-500", 
    "from-cyan-500 to-emerald-500"
  ][idx % 4];

  // Combined activity timeline feed (mock synced backend logs + custom logged items)
  const getUnifiedActivityTimeline = () => {
    const list: any[] = [];
    
    // Add custom logged practice items
    practiceLogs.forEach(l => {
      list.push({
        id: l.id,
        type: 'log',
        title: `Logged Practice: ${l.category.toUpperCase()}`,
        desc: l.notes,
        time: l.date,
        duration: l.duration,
        category: l.category
      });
    });

    // Add completed mock interviews
    completedInts.forEach(int => {
      list.push({
        id: int._id,
        type: 'interview',
        title: `Completed Mock Interview`,
        desc: `Role: ${int.role}. Overall evaluation: ${int.report?.overallFeedback?.slice(0, 80)}...`,
        time: new Date(int.createdAt).toISOString().split('T')[0],
        score: int.report?.overallScore || 0,
        category: 'interview'
      });
    });

    // Add synced coding submissions
    const allSubmissions = [
      ...(codingProfile?.leetcode?.recentSubmissions || []),
      ...(codingProfile?.codeforces?.recentSubmissions || []),
      ...(codingProfile?.codechef?.recentSubmissions || [])
    ];
    
    allSubmissions.slice(0, 5).forEach((sub: any, idx) => {
      const timeVal = sub.timestamp 
        ? new Date(sub.timestamp * 1000).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];
      list.push({
        id: `sub-${idx}-${sub.title || sub.problem}`,
        type: 'coding',
        title: `Solved Problem: ${sub.title || sub.problem}`,
        desc: `Accepted on ${sub.platform || 'Linked profile'}. Status: Verified.`,
        time: timeVal,
        category: 'coding'
      });
    });

    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  };

  const timelineActivities = getUnifiedActivityTimeline();

  // Unified Calendar heatmap grid calculation
  const getUnifiedHeatmapGrid = () => {
    const weeks = 22;
    const grid: number[][] = [];
    for (let w = 0; w < weeks; w++) {
      grid.push([0, 0, 0, 0, 0, 0, 0]);
    }

    const totalDays = weeks * 7;
    const nowMs = Date.now();

    // 1. Map real practice logs to days
    practiceLogs.forEach(l => {
      const dateVal = new Date(l.date);
      const diffMs = nowMs - dateVal.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < totalDays) {
        const dayIdx = totalDays - 1 - diffDays;
        const w = Math.floor(dayIdx / 7);
        const d = dayIdx % 7;
        if (w >= 0 && w < weeks && d >= 0 && d < 7) {
          const score = l.duration >= 60 ? 3 : l.duration >= 30 ? 2 : 1;
          grid[w][d] = Math.max(grid[w][d], score);
        }
      }
    });

    // 2. Map real coding submissions (LeetCode, Codeforces, CodeChef) to days
    const dailySubmissions: Record<string, number> = {};
    const mergeCalendar = (daily: Record<string, number> | undefined) => {
      if (!daily) return;
      for (const [date, cnt] of Object.entries(daily)) {
        dailySubmissions[date] = (dailySubmissions[date] || 0) + cnt;
      }
    };

    if (codingProfile?.leetcode) mergeCalendar(codingProfile.leetcode.dailySubmissions);
    if (codingProfile?.codeforces) mergeCalendar(codingProfile.codeforces.dailySubmissions);
    if (codingProfile?.codechef) mergeCalendar(codingProfile.codechef.dailySubmissions);

    Object.entries(dailySubmissions).forEach(([dateStr, cnt]) => {
      if (cnt <= 0) return;
      const dateVal = new Date(dateStr);
      const diffMs = nowMs - dateVal.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < totalDays) {
        const dayIdx = totalDays - 1 - diffDays;
        const w = Math.floor(dayIdx / 7);
        const d = dayIdx % 7;
        if (w >= 0 && w < weeks && d >= 0 && d < 7) {
          const score = cnt <= 2 ? 1 : cnt <= 5 ? 2 : 3;
          grid[w][d] = Math.max(grid[w][d], score);
        }
      }
    });

    return grid;
  };

  const heatmapGrid = getUnifiedHeatmapGrid();

  // Daily CS brainteaser rotation
  const activeQuiz = QUIZ_QUESTIONS[quizDayIndex];

  const handleQuizAnswerSubmit = (optionIdx: number) => {
    if (quizAnswered) return;
    setSelectedOption(optionIdx);
    setQuizAnswered(true);
    setShowQuizExplanation(true);

    if (optionIdx === activeQuiz.correctAnswer) {
      // Auto log 15 minutes of revision practice
      const quizLog: PracticeLog = {
        id: `quiz-log-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        category: "revision",
        duration: 15,
        notes: `Brainteaser Quiz Master: Correctly answered question on topic ${activeQuiz.topic}.`
      };
      const updatedLogs = [quizLog, ...practiceLogs];
      setPracticeLogs(updatedLogs);
      if (user) {
        localStorage.setItem(`practice_logs_${user.uid}`, JSON.stringify(updatedLogs));
      }

      setLogSuccessMessage("Correct answer! Logged +15 minutes of revision.");
      setTimeout(() => setLogSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-fade-in text-zinc-900 dark:text-zinc-100">
      
      {/* AI Twin Slide-out Chat Panel */}
      {isChatOpen && typeof document !== 'undefined' && (
        require('react-dom').createPortal(
          <>
            <div onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[100]" />
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white/90 dark:bg-zinc-950/90 border-l border-zinc-200/50 dark:border-zinc-800/40 backdrop-blur-2xl z-[101] flex flex-col shadow-2xl animate-in slide-in-from-right duration-350">
              <div className="p-5 border-b border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20">
                    <i className="fa-solid fa-microchip w-5 h-5 animate-pulse" ></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                      AI Twin Chat
                      <i className="fa-solid fa-wand-magic-sparkles w-4 h-4 text-indigo-500 fill-indigo-500/20" ></i>
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Academic & Placement Guide</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-xl text-zinc-550">
                  <i className="fa-solid fa-xmark w-5 h-5" ></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-tr-none' : 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-800/30'}`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100/80 dark:bg-zinc-900/60 rounded-2xl rounded-tl-none px-4 py-3 border border-zinc-200/50 dark:border-zinc-800/30 flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-5 border-t border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 flex gap-2">
                <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="Ask your twin something..." className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                <button type="submit" disabled={!inputVal.trim() || isSending} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 transition-colors"><i className="fa-solid fa-paper-plane w-4 h-4" ></i></button>
              </form>
            </div>
          </>,
          document.body
        )
      )}

      {/* Top Banner section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 md:p-6 glass-panel rounded-2xl md:rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="z-10 flex-1">
          <div className="flex items-center gap-2 text-indigo-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <i className="fa-solid fa-wand-magic-sparkles w-4 h-4" ></i>
            Performance & practice cockpit
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xl text-xs md:text-sm leading-relaxed hidden sm:block">
            Your placement preparedness indices are computed live. Log your daily coding, mock interviews, and revise core CS fundamentals.
          </p>
        </div>
      </header>

      {/* Toast Alert message */}
      {logSuccessMessage && (
        <div className="fixed top-24 md:top-6 right-6 px-5 py-4 bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <i className="fa-regular fa-circle-check w-5 h-5" ></i>
          <span className="text-xs font-extrabold uppercase tracking-wide">{logSuccessMessage}</span>
        </div>
      )}

      {statsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <i className="fa-solid fa-spinner fa-spin w-10 h-10 text-indigo-500 animate-spin" ></i>
          <p className="text-sm text-zinc-400 font-bold uppercase tracking-wider animate-pulse">Aggregating overall performance metrics...</p>
        </div>
      ) : (
        <>
          {/* Practice statistics overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <MetricCard 
              title="Placement Readiness" 
              value={`${placementReadiness}%`} 
              trend={placementReadiness >= 75 ? "Target credentials met" : "Complete key preparation steps"} 
              icon={<i className="fa-solid fa-bullseye w-5 h-5 text-indigo-500" ></i>} 
            />
            <MetricCard 
              title="Consistency score" 
              value={`${consistencyScore}%`} 
              trend={`${practiceLogs.length} logged sessions in last 30d`} 
              icon={<i className="fa-solid fa-chart-line w-5 h-5 text-cyan-500" ></i>} 
            />
            <MetricCard 
              title="Daily practice streak" 
              value={`${practiceStreak} Days`} 
              trend={practiceStreak > 0 ? "🔥 Keep the fire burning!" : "Log a practice session today"} 
              icon={<i className="fa-solid fa-fire w-5 h-5 text-amber-500 fill-amber-500/10" ></i>} 
            />
            <MetricCard 
              title="Weekly Practice" 
              value={`${weeklyPracticeMinutes}m`} 
              trend={`Target: ${weeklyMinutesTarget}m | ${Math.round((weeklyPracticeMinutes/weeklyMinutesTarget)*100)}%`} 
              icon={<i className="fa-solid fa-clock w-5 h-5 text-emerald-500" ></i>} 
            />
          </div>

          {/* Interactive practice tools section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
            
            {/* Practice checklist widget */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                      <i className="fa-solid fa-square-check w-5 h-5 text-indigo-500" ></i>
                      Daily Practice Checklist
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Customize and tick off daily practice milestones.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-500">{checklistCompletedPct}% Done</span>
                    <div className="w-20 h-2 bg-zinc-200/50 dark:bg-zinc-800/40 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${checklistCompletedPct}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Checklist Add form */}
                <form onSubmit={addTask} className="flex gap-2 mb-4 bg-zinc-50/50 dark:bg-zinc-900/30 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <input 
                    type="text" 
                    value={newTaskLabel}
                    onChange={(e) => setNewTaskLabel(e.target.value)}
                    placeholder="Add a new custom preparation task..." 
                    className="flex-1 px-3 py-2 bg-transparent text-xs focus:outline-none dark:text-white"
                  />
                  <select 
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-lg border border-zinc-200/60 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 focus:outline-none dark:text-zinc-300"
                  >
                    <option value="coding">Coding</option>
                    <option value="interview">Interview</option>
                    <option value="resume">Resume</option>
                    <option value="academics">Revision</option>
                  </select>
                  <button 
                    type="submit" 
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-plus w-4 h-4" ></i>
                  </button>
                </form>

                {/* Tasks List */}
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {dailyTasks.length > 0 ? (
                    dailyTasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          task.completed 
                            ? "bg-zinc-50/30 dark:bg-zinc-900/10 border-indigo-500/10 text-zinc-400 dark:text-zinc-500" 
                            : "bg-white dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/30 hover:border-indigo-500/20"
                        }`}
                      >
                        <div 
                          onClick={() => toggleTask(task.id)}
                          className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                        >
                          {task.completed ? (
                            <i className="fa-solid fa-square-check w-4.5 h-4.5 text-indigo-500 shrink-0" ></i>
                          ) : (
                            <i className="fa-regular fa-square w-4.5 h-4.5 text-zinc-400 shrink-0" ></i>
                          )}
                          <span className={`text-xs font-semibold ${task.completed ? 'line-through' : ''}`}>
                            {task.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            task.category === "coding" ? "text-blue-500 bg-blue-500/10 border border-blue-550/15" :
                            task.category === "interview" ? "text-emerald-500 bg-emerald-500/10 border border-emerald-550/15" :
                            task.category === "resume" ? "text-purple-500 bg-purple-500/10 border border-purple-550/15" :
                            "text-amber-500 bg-amber-500/10 border border-amber-550/15"
                          }`}>
                            {task.category}
                          </span>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-1 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can w-3.5 h-3.5" ></i>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-zinc-400 text-xs font-semibold">
                      Your checklist is empty. Add tasks using the form above.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pomodoro Timer widget */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-1">
                  <i className="fa-solid fa-clock w-5 h-5 text-indigo-500" ></i>
                  Focus Practice Block
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 mb-6">Commit to a 25-minute undistracted revision sprint.</p>
              </div>

              <div className="flex flex-col items-center justify-center my-4">
                <div className="text-5xl font-black tracking-tight tabular-nums text-zinc-950 dark:text-white mb-6 bg-gradient-to-tr from-indigo-500 to-purple-650 bg-clip-text text-transparent drop-shadow-sm">
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setTimerIsRunning(!timerIsRunning)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                      timerIsRunning 
                        ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" 
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/10"
                    }`}
                  >
                    {timerIsRunning ? (
                      <>
                        <i className="fa-solid fa-pause w-3.5 h-3.5" ></i> Pause
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-play w-3.5 h-3.5" ></i> Start Focus
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      setTimerIsRunning(false);
                      setTimerMinutes(25);
                      setTimerSeconds(0);
                    }}
                    className="p-2.5 border border-zinc-200/50 dark:border-zinc-800/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 rounded-xl text-zinc-500 dark:text-zinc-400 cursor-pointer"
                    title="Reset Timer"
                  >
                    <i className="fa-solid fa-rotate-left w-4 h-4" ></i>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-[10px] text-zinc-400 dark:text-zinc-550 text-center leading-relaxed border-t border-zinc-100 dark:border-zinc-900/60 pt-3">
                Completed focus blocks will automatically load ready-to-log minutes to your timeline grid.
              </div>
            </div>

          </div>

          {/* Practice activity grid & timeline */}
          <div className="glass-panel rounded-3xl p-6 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-calendar w-5 h-5 text-indigo-500" ></i>
                  Practice Activity Grid
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Consolidated tracking of mock interviews, resume improvements, and solved coding milestones.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-bold">Less</span>
                {[0, 1, 2, 3].map(v => (
                  <div 
                    key={v} 
                    className="w-3.5 h-3.5 rounded-sm border border-black/5 dark:border-white/5" 
                    style={{ backgroundColor: `var(--heatmap-bg-${v})` }}
                  />
                ))}
                <span className="text-[10px] text-zinc-400 font-bold">More</span>
              </div>
            </div>

            <div
              className="overflow-x-auto relative"
              onMouseLeave={() => setSelectedHeatCell(null)}
            >
              {/* Floating tooltip */}
              {selectedHeatCell && (
                <div
                  className="fixed z-50 pointer-events-none"
                  style={{ left: selectedHeatCell.x, top: selectedHeatCell.y - 44 }}
                >
                  <div className="relative">
                    <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      {selectedHeatCell.level === 0
                        ? 'No activity'
                        : selectedHeatCell.level === 1
                        ? 'Light practice'
                        : selectedHeatCell.level === 2
                        ? 'Medium practice'
                        : 'Heavy practice'}{' '}
                      on {selectedHeatCell.date}
                    </div>
                    {/* Arrow pointing down */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid rgb(24 24 27)', // zinc-900
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-1.5 min-w-[620px] pb-2">
                {heatmapGrid.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1.5">
                    {week.map((day, di) => {
                      const level = day >= 0 && day <= 3 ? day : 0;
                      const weeks = 22;
                      const totalDays = weeks * 7;
                      const dayIdx = wi * 7 + di;
                      const diffDays = totalDays - 1 - dayIdx;
                      const cellDate = new Date(Date.now() - diffDays * 86400000);
                      const dateStr = cellDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const isHovered = selectedHeatCell?.date === dateStr;
                      return (
                        <div
                          key={di}
                          onMouseEnter={(e) => {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setSelectedHeatCell({
                              date: dateStr,
                              level,
                              x: rect.left + rect.width / 2 - 70,
                              y: rect.top,
                            });
                          }}
                          className={`w-3.5 h-3.5 rounded-sm transition-transform duration-100 cursor-crosshair border border-black/5 dark:border-white/5 ${
                            isHovered ? 'scale-125 ring-2 ring-white/80 dark:ring-zinc-900/80 shadow-md' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: `var(--heatmap-bg-${level})` }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Practice logger & Daily Quiz Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Practice Session Logger */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-1">
                  <i className="fa-solid fa-chart-line w-5 h-5 text-indigo-500" ></i>
                  Log Daily Practice Session
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 mb-4">Record your practice logs to visualize daily consistency metrics.</p>

                <form onSubmit={handleLogPractice} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-550 mb-1.5">Practice Category</label>
                      <select 
                        value={logCategory}
                        onChange={(e) => setLogCategory(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/50 dark:bg-zinc-900/50 text-xs focus:outline-none dark:text-zinc-200"
                      >
                        <option value="coding">LeetCode / Coding Practice</option>
                        <option value="interview">Mock Interview Preparation</option>
                        <option value="revision">CS Fundamentals / Academics</option>
                        <option value="resume">Resume Optimization</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-550 mb-1.5">Duration (Minutes)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="300"
                        value={logDuration}
                        onChange={(e) => setLogDuration(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/50 dark:bg-zinc-900/50 text-xs focus:outline-none dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-550 mb-1.5">Practice Notes / Key Takeaways</label>
                    <textarea 
                      rows={3}
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="Specify solved problem details, networking topics reviewed, or behavioral points analyzed..."
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/50 dark:bg-zinc-900/50 text-xs focus:outline-none dark:text-zinc-200 resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Submit Practice Log
                  </button>
                </form>
              </div>
            </div>

            {/* Rotating Quiz node */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  Daily Revision Node
                </span>
                <h3 className="text-base font-extrabold mt-3.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-question w-5 h-5 text-indigo-500" ></i>
                  CS Brainteaser
                </h3>
                <span className="text-[10px] text-zinc-400 font-bold block mb-4 mt-0.5">{activeQuiz.topic}</span>
                
                <p className="text-xs font-bold leading-relaxed mb-4 text-zinc-800 dark:text-zinc-200">
                  {activeQuiz.question}
                </p>

                <div className="space-y-2">
                  {activeQuiz.options.map((opt, oIdx) => {
                    const isSelected = selectedOption === oIdx;
                    const isCorrect = oIdx === activeQuiz.correctAnswer;
                    
                    let btnColor = "bg-white/50 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/30 hover:border-indigo-550/20 text-zinc-700 dark:text-zinc-300";
                    if (quizAnswered) {
                      if (isCorrect) {
                        btnColor = "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400";
                      } else if (isSelected) {
                        btnColor = "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400";
                      } else {
                        btnColor = "opacity-50 border-zinc-200/30 dark:border-zinc-800/10 bg-transparent text-zinc-400";
                      }
                    }

                    return (
                      <button 
                        key={oIdx}
                        disabled={quizAnswered}
                        onClick={() => handleQuizAnswerSubmit(oIdx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-semibold leading-relaxed transition-all cursor-pointer ${btnColor}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {showQuizExplanation && (
                <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                  <p className="text-[9px] font-black uppercase text-indigo-500 tracking-wider mb-1">Explanation</p>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-300 leading-relaxed">
                    {activeQuiz.explanation}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* AI Twin Recommendations & Diagnostic Mastery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
                  <i className="fa-solid fa-microchip w-5 h-5 text-indigo-500 animate-pulse" ></i>
                  AI Twin Recommendations
                </h3>
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((rec, i) => (
                    <RecommendationItem key={i} title={rec.title} desc={rec.desc} type={rec.type} />
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-5">
                  <i className="fa-solid fa-trophy w-5 h-5 text-amber-500" ></i>
                  Diagnostic Mastery
                </h3>
                <div className="space-y-4.5">
                  {skillsToDisplay.map((skill, idx) => (
                    <SkillBar key={skill} name={skill} progress={getProgress(skill, idx)} gradient={getGradient(idx)} />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Activity Feed and Timeline Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timeline Activities Feed */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-5">
                  <i className="fa-solid fa-clock-rotate-left w-5 h-5 text-indigo-500" ></i>
                  Practice Timeline & Submissions
                </h3>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {timelineActivities.length > 0 ? (
                    timelineActivities.slice(0, 10).map((act, i) => {
                      let tagColor = "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
                      if (act.type === 'coding') tagColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
                      if (act.type === 'interview') tagColor = "text-emerald-500 bg-emerald-500/10 border-emerald-550/20";
                      
                      return (
                        <div key={act.id} className="p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/30 bg-white/10 dark:bg-zinc-900/10 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-zinc-900 dark:text-white">{act.title}</span>
                              {act.duration && (
                                <span className="text-[10px] text-zinc-400 font-bold">({act.duration} mins)</span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{act.desc}</p>
                            <span className="text-[9px] text-zinc-400 font-black block pt-1 uppercase">{act.time}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${tagColor}`}>
                              {act.type}
                            </span>
                            {act.type === 'log' && (
                              <button 
                                onClick={() => deleteLog(act.id)}
                                className="p-1 hover:bg-rose-500/10 text-zinc-450 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                title="Delete Log"
                              >
                                <i className="fa-solid fa-trash-can w-3.5 h-3.5" ></i>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-zinc-400 text-xs">
                      No preparation milestones recorded. Use the tools above to log custom practice.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions and Modules links */}
            <div className="flex flex-col gap-6">
              
              <div className="glass-panel rounded-3xl p-6 group">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-5">
                  <i className="fa-solid fa-graduation-cap w-5 h-5 text-indigo-500" ></i>
                  Academic Revision Nodes
                </h3>
                <div className="space-y-3.5">
                  <AcademicFocusItem title="Operating Systems Paging" sub="Virtual Memory architectures, page fault diagnostics & LRU Cache replacement schemes" />
                  <AcademicFocusItem title="Computer Networks Handshake" sub="TCP Connection parameters, SYN-ACK verification, sequence offsets & network latency" />
                </div>
              </div>

              <Link 
                href="/student/mock-interviews" 
                className="glass-panel rounded-3xl p-6 flex flex-col justify-between group overflow-hidden relative hover:border-indigo-550/30 transition-all duration-300 flex-1 min-h-[160px]"
              >
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-500/10 border border-indigo-550/25 px-2.5 py-1 rounded-full">
                    Diagnostic Module
                  </span>
                  <h3 className="text-lg font-bold mt-4 mb-2">Conduct AI Mock Interview</h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-405 leading-relaxed">
                    Start a live, 3-question mock interview simulating FAANG parameters. Diagnostic scorecard is updated instantly.
                  </p>
                </div>
                <div className="mt-6 flex justify-between items-center z-10">
                  <span className="text-xs font-semibold text-indigo-500 group-hover:underline">Launch interface</span>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-zinc-200/50 dark:border-zinc-800/40 text-indigo-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                    <i className="fa-solid fa-arrow-up-right-from-square w-4 h-4" ></i>
                  </div>
                </div>
              </Link>

            </div>

          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, trend, icon, link }: { title: string; value: string; trend: string; icon: React.ReactNode; link?: string }) {
  const content = (
    <div className="glass-panel p-3 md:p-6 rounded-2xl md:rounded-3xl flex flex-col justify-between group relative overflow-hidden transition-all hover:border-indigo-550/30 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md shadow-sm h-full cursor-pointer">
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <span className="text-zinc-400 text-[9px] md:text-xs font-bold uppercase tracking-wider leading-tight">{title}</span>
        <div className="p-1.5 md:p-2 bg-white/50 dark:bg-zinc-900/40 rounded-lg md:rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 shrink-0 [&>*]:w-4 [&>*]:h-4 md:[&>*]:w-5 md:[&>*]:h-5">{icon}</div>
      </div>
      <div>
        <h3 className="text-xl md:text-3xl font-extrabold text-zinc-950 dark:text-white leading-none mb-1 md:mb-2">{value}</h3>
        <p className="text-[9px] md:text-[10px] text-zinc-550 dark:text-zinc-450 font-bold leading-tight">{trend}</p>
      </div>
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
}

function RecommendationItem({ title, desc, type }: { title: string; desc: string; type: string }) {
  const colors: any = { 
    coding: "text-blue-500 bg-blue-500/10 border-blue-550/20", 
    resume: "text-emerald-500 bg-emerald-500/10 border-emerald-550/20", 
    job: "text-purple-500 bg-purple-500/10 border-purple-550/20" 
  };
  return (
    <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/20 hover:border-indigo-500/30 transition-all duration-300 flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{title}</h4>
        <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">{desc}</p>
      </div>
      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shrink-0 ${colors[type] || colors.job}`}>
        {type}
      </span>
    </div>
  );
}

function SkillBar({ name, progress, gradient }: { name: string; progress: number; gradient: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5 font-bold text-zinc-850 dark:text-zinc-300">
        <span>{name}</span>
        <span className="text-indigo-500 dark:text-indigo-400">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-zinc-200/50 dark:bg-zinc-800/30 rounded-full overflow-hidden border border-zinc-250/20 dark:border-zinc-850/20">
        <div className={`h-full bg-gradient-to-r ${gradient}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

function AcademicFocusItem({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/30 bg-white/10 dark:bg-zinc-900/10 hover:border-indigo-500/15 transition-colors">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
      <div>
        <h4 className="font-bold text-xs">{title}</h4>
        <p className="text-[10px] text-zinc-550 dark:text-zinc-400 mt-0.5 leading-relaxed">{sub}</p>
      </div>
    </div>
  );
}
