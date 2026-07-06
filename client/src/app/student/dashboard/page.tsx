"use client";


import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { ExcelReportModal } from "@/components/ExcelReportModal";

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
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);



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
    return () => {
      window.removeEventListener('profile_updated', loadProfileName);
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
    <div className="flex flex-col gap-10 animate-fade-in text-zinc-900 dark:text-zinc-100 max-w-7xl mx-auto pb-10">
      


      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-[11px] uppercase tracking-wider mb-1">
            <i className="fa-solid fa-layer-group w-3.5 h-3.5"></i>
            Performance Dashboard
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Overview, {firstName}</h1>
        </div>
        <div className="flex items-center gap-3">
        </div>
      </header>

      {/* Toast Alert message */}
      {logSuccessMessage && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up border border-zinc-800 dark:border-zinc-200">
          <i className="fa-regular fa-circle-check w-4 h-4 text-zinc-900 dark:text-white"></i>
          <span className="text-xs font-semibold">{logSuccessMessage}</span>
        </div>
      )}

      {statsLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <i className="fa-solid fa-spinner fa-spin w-6 h-6 text-zinc-400"></i>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider animate-pulse">Aggregating telemetry...</p>
        </div>
      ) : (
        <>
          {/* Executive Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <MetricCard 
              title="Readiness Index" 
              value={`${placementReadiness}%`} 
              trend={placementReadiness >= 75 ? "Target credentials met" : "Preparation required"} 
              icon={<i className="fa-solid fa-bullseye w-4 h-4 text-zinc-600 dark:text-zinc-400"></i>} 
            />
            <MetricCard 
              title="Consistency" 
              value={`${consistencyScore}%`} 
              trend={`${practiceLogs.length} sessions logged (30d)`} 
              icon={<i className="fa-solid fa-chart-line w-4 h-4 text-zinc-600 dark:text-zinc-400"></i>} 
            />
            <MetricCard 
              title="Active Streak" 
              value={`${practiceStreak}d`} 
              trend={practiceStreak > 0 ? "Maintained activity" : "No recent activity"} 
              icon={<i className="fa-solid fa-bolt w-4 h-4 text-zinc-600 dark:text-zinc-400"></i>} 
            />
            <MetricCard 
              title="Weekly Volume" 
              value={`${weeklyPracticeMinutes}m`} 
              trend={`Target: ${weeklyMinutesTarget}m (${Math.round((weeklyPracticeMinutes/weeklyMinutesTarget)*100)}%)`} 
              icon={<i className="fa-solid fa-clock w-4 h-4 text-zinc-600 dark:text-zinc-400"></i>} 
            />
          </div>

          {/* Bento Grid Layout - Now completely flat */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            
            {/* Heatmap & Timeline Feed - Main Span */}
            <div className="md:col-span-8 flex flex-col gap-10">
              
              <div className="flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                      Activity Graph
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Aggregated commits, mock interviews, and logged milestones.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsExcelModalOpen(true)} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-500/20">
                      <i className="fa-solid fa-download"></i> Report
                    </button>
                    <div className="flex items-center gap-1.5 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                      <span className="text-[10px] text-zinc-500">Less</span>
                      {[0, 1, 2, 3, 4].map(v => (
                        <div 
                          key={v} 
                          className="w-3 h-3 rounded-[2px]" 
                          style={{ backgroundColor: `var(--heatmap-bg-${v})` }}
                        />
                      ))}
                      <span className="text-[10px] text-zinc-500">More</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto relative" onMouseLeave={() => setSelectedHeatCell(null)}>
                  {selectedHeatCell && (
                    <div className="fixed z-50 pointer-events-none" style={{ left: selectedHeatCell.x, top: selectedHeatCell.y - 36 }}>
                      <div className="relative">
                        <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-medium px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
                          {selectedHeatCell.level === 0 ? 'No activity' : `${selectedHeatCell.level} activity level`} on {selectedHeatCell.date}
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid rgb(24 24 27)' }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-[3px] min-w-[620px] pb-1 pt-1">
                    {heatmapGrid.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-[3px]">
                        {week.map((day, di) => {
                          const level = day >= 0 && day <= 4 ? day : 0;
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
                                setSelectedHeatCell({ date: dateStr, level, x: rect.left + rect.width / 2 - 50, y: rect.top });
                              }}
                              className={`w-[11px] h-[11px] rounded-[2px] transition-all cursor-default border border-black/5 dark:border-white/5 ${isHovered ? 'ring-1 ring-zinc-400 scale-110 z-10' : ''}`}
                              style={{ backgroundColor: `var(--heatmap-bg-${level})` }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                    Event Timeline
                  </h3>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{timelineActivities.length} Events</span>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {timelineActivities.length > 0 ? (
                    timelineActivities.slice(0, 10).map((act, i) => {
                      let typeLabel = "LOG";
                      if (act.type === 'coding') typeLabel = "CODE";
                      if (act.type === 'interview') typeLabel = "INTV";
                      
                      return (
                        <div key={act.id} className="group flex items-start gap-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 px-2 rounded-md transition-colors -mx-2">
                          <div className="w-12 shrink-0 pt-0.5">
                            <span className="text-[10px] font-mono text-zinc-400">{act.time.substring(5).replace('-', '/')}</span>
                          </div>
                          <div className="flex-1 space-y-1 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-xs text-zinc-900 dark:text-white">{act.title}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{typeLabel}</span>
                            </div>
                            <p className="text-[11px] text-zinc-500 leading-relaxed truncate max-w-[400px]">{act.desc}</p>
                          </div>
                          {act.type === 'log' && (
                            <button onClick={() => deleteLog(act.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-zinc-400 hover:text-rose-500 rounded transition-all shrink-0">
                              <i className="fa-solid fa-xmark w-3 h-3"></i>
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-zinc-400 text-xs">
                      No events recorded. Telemetry will appear here.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Side Panel - Recommendations & Tasks */}
            <div className="md:col-span-4 flex flex-col gap-10">
              
              {/* Recommendations Terminal */}
              <div className="flex flex-col text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-terminal text-[10px]"></i> Actionable Insights
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">[{rec.type}]</span>
                        <span className="text-zinc-800 dark:text-zinc-100 font-medium">{rec.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed pl-10 border-l border-zinc-200 dark:border-zinc-800">{rec.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items List */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                    Action Items
                  </h3>
                  <span className="text-[10px] font-medium text-zinc-500">{checklistCompletedPct}% Done</span>
                </div>

                <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-zinc-800 dark:bg-zinc-200 transition-all duration-500" style={{ width: `${checklistCompletedPct}%` }}></div>
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto min-h-[150px] mb-4">
                  {dailyTasks.map((task) => (
                    <div key={task.id} className="group flex items-center justify-between py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 px-2 -mx-2 rounded transition-colors">
                      <div onClick={() => toggleTask(task.id)} className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${task.completed ? 'bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white text-white dark:text-zinc-900' : 'border-zinc-300 dark:border-zinc-700'}`}>
                          {task.completed && <i className="fa-solid fa-check text-[8px]"></i>}
                        </div>
                        <span className={`text-[11px] ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-300'}`}>{task.label}</span>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-colors">
                        <i className="fa-solid fa-xmark w-3 h-3"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={addTask} className="flex gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                  <input type="text" value={newTaskLabel} onChange={(e) => setNewTaskLabel(e.target.value)} placeholder="Add task..." className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs focus:outline-none focus:border-zinc-400 dark:text-zinc-200" />
                  <button type="submit" className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">Add</button>
                </form>
              </div>

            </div>
          </div>

          {/* Secondary Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-zinc-200 dark:border-zinc-800 pt-10 mt-6">
            
            {/* Session Logger */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">Log Session</h3>
              <form onSubmit={handleLogPractice} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-500 mb-1">Type</label>
                    <select value={logCategory} onChange={(e) => setLogCategory(e.target.value as any)} className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-[11px] bg-zinc-50 dark:bg-zinc-900 focus:outline-none dark:text-zinc-200">
                      <option value="coding">Coding</option>
                      <option value="interview">Interview</option>
                      <option value="revision">Theory</option>
                      <option value="resume">Career</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-500 mb-1">Duration (m)</label>
                    <input type="number" min="1" value={logDuration} onChange={(e) => setLogDuration(Number(e.target.value))} className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-[11px] bg-zinc-50 dark:bg-zinc-900 focus:outline-none dark:text-zinc-200" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-500 mb-1">Notes</label>
                  <input type="text" value={logNotes} onChange={(e) => setLogNotes(e.target.value)} placeholder="Summary of work..." className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded text-[11px] bg-zinc-50 dark:bg-zinc-900 focus:outline-none dark:text-zinc-200" />
                </div>
                <button type="submit" className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded text-xs font-medium transition-colors border border-zinc-200 dark:border-zinc-700">Submit Log</button>
              </form>
            </div>

            {/* Diagnostic Mastery */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">Competency Map</h3>
              <div className="space-y-4 pt-1">
                {skillsToDisplay.map((skill, idx) => (
                  <SkillBar key={skill} name={skill} progress={getProgress(skill, idx)} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">Evaluations</h3>
              <div className="flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/30 p-6 rounded-xl transition-colors h-full border border-dashed border-zinc-200 dark:border-zinc-800">
                <i className="fa-solid fa-microphone-lines text-xl text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white mb-3 transition-colors"></i>
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Mock Interview</h4>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">Launch a technical diagnostic loop to update readiness scores.</p>
                <Link href="/student/mock-interviews" className="mt-4 text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded">Launch Module</Link>
              </div>
            </div>

          </div>

          {/* --- NEW AI TOOLS SECTION --- */}
          <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-zinc-900 dark:text-white"></i> AI Tools Hub
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Supercharge your prep with AI-driven insights.</p>
              </div>
              <Link href="/student/ai-tools" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                View All Tools <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Career Health Mini Card */}
              <Link href="/student/ai-tools/career-health" className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-700/50 shadow-sm transition-all flex flex-col h-full cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                    <i className="fa-solid fa-heart-pulse text-zinc-900 dark:text-white"></i>
                  </div>
                  <i className="fa-solid fa-arrow-right text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:text-white transition-colors"></i>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Career Health Score</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Holistic AI analysis of your resume, coding, and interview readiness.</p>
              </Link>

              {/* Dream Company Mini Card */}
              <Link href="/student/ai-tools/dream-company" className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 shadow-sm transition-all flex flex-col h-full cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <i className="fa-solid fa-map-location-dot text-zinc-900 dark:text-white"></i>
                  </div>
                  <i className="fa-solid fa-arrow-right text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:text-white transition-colors"></i>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Dream Company Roadmap</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Select your target employer and get a customized preparation strategy.</p>
              </Link>

              {/* Placement Readiness Mini Card */}
              <Link href="/student/ai-tools/placement-readiness" className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700/50 shadow-sm transition-all flex flex-col h-full cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <i className="fa-solid fa-bullseye text-zinc-900 dark:text-white"></i>
                  </div>
                  <i className="fa-solid fa-arrow-right text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:text-white transition-colors"></i>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Placement Readiness</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">Get an AI prediction of your interview readiness with actionable steps.</p>
              </Link>
            </div>
          </div>
        </>
      )}
      <ExcelReportModal 
        isOpen={isExcelModalOpen} 
        onClose={() => setIsExcelModalOpen(false)} 
        practiceLogs={practiceLogs} 
        interviews={interviews}
        codingProfile={codingProfile}
      />
    </div>
  );
}

function MetricCard({ title, value, trend, icon }: { title: string; value: string; trend: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between h-full group">
      <div className="flex justify-between items-start mb-3">
        <span className="text-zinc-500 text-[10px] md:text-xs font-medium tracking-wide uppercase">{title}</span>
        {icon}
      </div>
      <div>
        <h3 className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white leading-none mb-2 tracking-tight transition-transform group-hover:translate-x-1">{value}</h3>
        <p className="text-[10px] text-zinc-400 font-medium">{trend}</p>
      </div>
    </div>
  );
}

function SkillBar({ name, progress }: { name: string; progress: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1.5 font-medium text-zinc-700 dark:text-zinc-300">
        <span>{name}</span>
        <span className="text-zinc-400">{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full bg-zinc-800 dark:bg-zinc-200" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
