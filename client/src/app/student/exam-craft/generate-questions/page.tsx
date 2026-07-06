"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";

type QuestionType = "MCQ" | "Short Answer" | "Long Answer";
type Difficulty = "Easy" | "Medium" | "Hard";

interface Question {
  id: number;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options?: string[];
  answer?: string;
}

export default function GenerateQuestionsPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [questionType, setQuestionType] = useState("Mixed");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!file && !pastedText.trim()) {
      setError("Please upload a file or paste your study content.");
      return;
    }
    setError("");
    setLoading(true);
    setQuestions([]);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (pastedText) formData.append("pastedText", pastedText);
      formData.append("count", count.toString());
      formData.append("difficulty", difficulty);
      formData.append("questionType", questionType);

      const res = await fetch(`${API_BASE_URL}/api/exam/generate-questions`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions");
      setQuestions(data.questions || []);
      setIsDemo(data.isDemo || false);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    const text = questions
      .map((q, i) => {
        let out = `${i + 1}. [${q.type}] ${q.question}`;
        if (q.options) {
          out += "\n" + q.options.map((o, idx) => `   ${String.fromCharCode(65 + idx)}) ${o}`).join("\n");
          if (q.answer) out += `\n   ✓ Answer: ${q.answer}`;
        }
        return out;
      })
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const difficultyColors: Record<Difficulty, string> = {
    Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    Hard: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };

  const typeColors: Record<QuestionType, string> = {
    MCQ: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    "Short Answer": "text-purple-500 bg-purple-500/10 border-purple-500/20",
    "Long Answer": "text-pink-500 bg-pink-500/10 border-pink-500/20",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/student/exam-craft"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-500 dark:text-zinc-400"
          >
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Generate Questions{" "}
              <i className="fa-solid fa-file-circle-question text-zinc-900 dark:text-white ml-2" />
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Upload your syllabus or notes and let AI craft exam-ready questions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Input Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* File Upload */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              Study Content
            </h3>

            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                file
                  ? "border-purple-500/50 bg-purple-500/5"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-600"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (f) setPastedText("");
                }}
              />
              {file ? (
                <div className="space-y-2">
                  <i className="fa-solid fa-file-check text-3xl text-zinc-900 dark:text-white" />
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{file.name}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Click to upload <span className="font-semibold text-purple-500">PDF, DOCX, or TXT</span>
                  </p>
                  <p className="text-xs text-zinc-400">Max 10MB</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <hr className="flex-1 border-zinc-200 dark:border-zinc-800" />
              <span className="text-xs text-zinc-400 font-medium">OR</span>
              <hr className="flex-1 border-zinc-200 dark:border-zinc-800" />
            </div>

            <textarea
              value={pastedText}
              onChange={(e) => { setPastedText(e.target.value); if (e.target.value) setFile(null); }}
              placeholder="Paste your notes or syllabus text here…"
              rows={6}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          {/* Settings */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              Settings
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Number of Questions: <span className="text-purple-500">{count}</span>
              </label>
              <input
                type="range" min={5} max={30} value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-zinc-400">
                <span>5</span><span>30</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      difficulty === d
                        ? difficultyColors[d]
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Question Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["Mixed", "MCQ", "Short Answer", "Long Answer"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuestionType(t)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      questionType === t
                        ? "border-purple-500/50 bg-purple-500/10 text-purple-500"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
                <i className="fa-solid fa-triangle-exclamation" />
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-sm shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin" /> Generating…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles" /> Generate Questions
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right — Results Panel */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-zinc-900 dark:text-white" />
              </div>
              <div className="text-center">
                <p className="font-bold text-zinc-900 dark:text-white">Crafting your questions…</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">AI is analyzing your content</p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4 rounded-2xl bg-white dark:bg-[#0f0f11] border border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <i className="fa-solid fa-file-circle-question text-3xl text-zinc-900 dark:text-white" />
              </div>
              <div className="text-center">
                <p className="font-bold text-zinc-700 dark:text-zinc-300">Your questions will appear here</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Upload content and click Generate</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-list-check text-zinc-900 dark:text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{questions.length} Questions Generated</p>
                    {isDemo && <p className="text-xs text-amber-500 font-medium">Demo mode — set GEMINI_API_KEY for real AI</p>}
                  </div>
                </div>
                <button
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                >
                  {copied ? <><i className="fa-solid fa-check text-zinc-900 dark:text-white" /> Copied!</> : <><i className="fa-solid fa-copy" /> Copy All</>}
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id || i} className="p-5 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 hover:border-purple-500/30 transition-all group">
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 text-xs font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${typeColors[q.type as QuestionType] || "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"}`}>
                            {q.type}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${difficultyColors[q.difficulty as Difficulty] || "text-amber-500 bg-amber-500/10 border-amber-500/20"}`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{q.question}</p>
                        {q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => (
                              <div
                                key={oi}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
                                  q.answer === opt
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                                }`}
                              >
                                <span className="font-black">{String.fromCharCode(65 + oi)}.</span>
                                {opt}
                                {q.answer === opt && <i className="fa-solid fa-check ml-auto text-zinc-900 dark:text-white" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
