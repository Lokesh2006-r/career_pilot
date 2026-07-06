"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

interface EvalResult {
  question: string;
  studentAnswer: string;
  score: number;
  maxScore: number;
  feedback: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
}

interface Evaluation {
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  results: EvalResult[];
}

export default function EvaluateScriptPage() {
  const [questions, setQuestions] = useState("");
  const [studentAnswers, setStudentAnswers] = useState("");
  const [totalMarks, setTotalMarks] = useState("100");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const handleEvaluate = async () => {
    if (!questions.trim() || !studentAnswers.trim()) {
      setError("Please provide both questions and student answers.");
      return;
    }
    setError("");
    setLoading(true);
    setEvaluation(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/exam/evaluate-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, studentAnswers, totalMarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setEvaluation(data.evaluation);
      setIsDemo(data.isDemo || false);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = (grade: string) => {
    if (["A+", "A"].includes(grade)) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (grade === "B") return "text-blue-500 bg-blue-500/10 border-blue-500/30";
    if (grade === "C") return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-rose-500 bg-rose-500/10 border-rose-500/30";
  };

  const scoreBarColor = (pct: number) => {
    if (pct >= 75) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  const resultScorePct = (r: EvalResult) => Math.round((r.score / (r.maxScore || 1)) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/student/exam-craft"
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-zinc-500 dark:text-zinc-400"
        >
          <i className="fa-solid fa-arrow-left" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Evaluate Answer Script <i className="fa-solid fa-chart-line text-zinc-900 dark:text-white ml-2" />
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Submit a question paper and student answers for AI-powered grading and feedback.
          </p>
        </div>
      </div>

      {!evaluation ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <i className="fa-solid fa-list-ol text-zinc-900 dark:text-white text-sm" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                Exam Questions
              </h3>
            </div>
            <textarea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder={"Paste the exam questions:\n\n1. What is polymorphism? (10 marks)\n2. Explain memory management in C. (10 marks)"}
              rows={12}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Student Answers */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <i className="fa-solid fa-pen-nib text-zinc-900 dark:text-white text-sm" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                Student Answers
              </h3>
            </div>
            <textarea
              value={studentAnswers}
              onChange={(e) => setStudentAnswers(e.target.value)}
              placeholder={"Paste the student's answers:\n\n1. Polymorphism means many forms. In programming it allows different classes to be treated as the same type.\n\n2. C uses malloc and free for memory management. You have to manually allocate and free it."}
              rows={12}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Total Marks + Submit */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                Total Marks:
              </label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                min={10} max={1000}
                className="w-24 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium flex-1">
                <i className="fa-solid fa-triangle-exclamation" /> {error}
              </div>
            )}

            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin" /> Evaluating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-magnifying-glass-chart" /> Evaluate Script
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Grade Circle */}
              <div className={`shrink-0 w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${gradeColor(evaluation.grade)}`}>
                <span className="text-3xl">{evaluation.grade}</span>
                <span className="text-xs font-semibold mt-0.5">{evaluation.percentage}%</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-zinc-900 dark:text-white text-lg">
                    {evaluation.totalScore} / {evaluation.maxScore} Marks
                  </h3>
                  {isDemo && <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">Demo Mode</span>}
                </div>
                <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(evaluation.percentage)}`}
                    style={{ width: `${evaluation.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                  {evaluation.results.length} questions evaluated
                </p>
              </div>

              <button
                onClick={() => setEvaluation(null)}
                className="sm:self-start px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <i className="fa-solid fa-rotate-left mr-1.5" /> Re-evaluate
              </button>
            </div>
          </div>

          {/* Per-Question Results */}
          <div className="space-y-3">
            {evaluation.results.map((r, i) => {
              const pct = resultScorePct(r);
              return (
                <div key={i} className="rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 overflow-hidden">
                  <button
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  >
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{r.question}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBarColor(pct)}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${pct >= 75 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-rose-500"}`}>
                          {r.score}/{r.maxScore}
                        </span>
                      </div>
                      <i className={`fa-solid fa-chevron-down text-zinc-400 transition-transform ${expandedIdx === i ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {expandedIdx === i && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 p-5 space-y-4">
                      {/* Student Answer */}
                      <div>
                        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Student's Answer</p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3">{r.studentAnswer}</p>
                      </div>

                      {/* AI Feedback */}
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <i className="fa-solid fa-wand-magic-sparkles" /> AI Feedback
                        </p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{r.feedback}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Points Covered */}
                        {r.keyPointsCovered?.length > 0 && (
                          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <i className="fa-solid fa-circle-check" /> Points Covered
                            </p>
                            <ul className="space-y-1">
                              {r.keyPointsCovered.map((pt, j) => (
                                <li key={j} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                                  <i className="fa-solid fa-check text-zinc-900 dark:text-white mt-0.5 shrink-0" />{pt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Points Missed */}
                        {r.keyPointsMissed?.length > 0 && (
                          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <i className="fa-solid fa-circle-xmark" /> Points Missed
                            </p>
                            <ul className="space-y-1">
                              {r.keyPointsMissed.map((pt, j) => (
                                <li key={j} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                                  <i className="fa-solid fa-minus text-zinc-900 dark:text-white mt-0.5 shrink-0" />{pt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
