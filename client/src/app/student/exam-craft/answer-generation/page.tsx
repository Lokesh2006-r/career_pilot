"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

type AnswerLength = "Brief" | "Standard" | "Detailed";

interface AnswerItem {
  question: string;
  answer: string;
}

export default function AnswerGenerationPage() {
  const [questions, setQuestions] = useState("");
  const [answerLength, setAnswerLength] = useState<AnswerLength>("Standard");
  const [context, setContext] = useState("");
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!questions.trim()) {
      setError("Please enter at least one question.");
      return;
    }
    setError("");
    setLoading(true);
    setAnswers([]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/exam/generate-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answerLength, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate answers");
      setAnswers(data.answers || []);
      setIsDemo(data.isDemo || false);
      setExpandedIdx(0);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  // Simple markdown-like renderer for bold and newlines
  const renderAnswer = (text: string) => {
    return text.split("\n").map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <p
          key={i}
          className={`text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed ${line.startsWith("#") ? "font-bold text-zinc-900 dark:text-white text-base mt-2" : ""}`}
          dangerouslySetInnerHTML={{ __html: boldLine || "&nbsp;" }}
        />
      );
    });
  };

  const lengthConfig: Record<AnswerLength, { label: string; words: string; color: string }> = {
    Brief: { label: "Brief", words: "~80 words", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
    Standard: { label: "Standard", words: "~200 words", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
    Detailed: { label: "Detailed", words: "~400 words", color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
  };

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
            Answer Generation <i className="fa-solid fa-book-open text-pink-500 ml-2" />
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Paste your questions and get comprehensive, formatted answers instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Input */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              Your Questions
            </h3>

            <textarea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder={"Paste your questions here, one per line:\n\n1. Explain polymorphism in OOP.\n2. What is the OSI model?\n3. Describe quicksort algorithm."}
              rows={10}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/40"
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Subject / Context <span className="normal-case text-zinc-400">(optional)</span>
              </label>
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., Computer Science, 3rd year, Data Structures"
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Answer Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(lengthConfig) as [AnswerLength, typeof lengthConfig[AnswerLength]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setAnswerLength(key)}
                    className={`flex flex-col items-center py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      answerLength === key ? cfg.color : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    <span>{cfg.label}</span>
                    <span className="font-normal text-[10px] mt-0.5 opacity-70">{cfg.words}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
                <i className="fa-solid fa-triangle-exclamation" /> {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm shadow-lg hover:shadow-pink-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin" /> Generating Answers…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles" /> Generate Answers
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right — Answers */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-pink-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-zinc-900 dark:text-white">Writing your answers…</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">This may take a few seconds</p>
              </div>
            </div>
          ) : answers.length === 0 ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4 rounded-2xl bg-white dark:bg-[#0f0f11] border border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                <i className="fa-solid fa-book-open text-3xl text-pink-400" />
              </div>
              <div className="text-center">
                <p className="font-bold text-zinc-700 dark:text-zinc-300">Answers will appear here</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Paste your questions and click Generate</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-check-circle text-pink-500" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{answers.length} Answers Generated</p>
                    {isDemo && <p className="text-xs text-amber-500 font-medium">Demo mode — set GEMINI_API_KEY for real AI</p>}
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${lengthConfig[answerLength].color}`}>
                  {lengthConfig[answerLength].label}
                </span>
              </div>

              {answers.map((item, i) => (
                <div key={i} className="rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 overflow-hidden">
                  {/* Question Header */}
                  <button
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-pink-500/10 text-pink-500 text-xs font-black flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.question}</p>
                    </div>
                    <i className={`fa-solid fa-chevron-down text-zinc-400 ml-4 transition-transform ${expandedIdx === i ? "rotate-180" : ""}`} />
                  </button>

                  {/* Answer */}
                  {expandedIdx === i && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 pb-5 pt-4">
                      <div className="flex justify-end mb-3">
                        <button
                          onClick={() => handleCopy(i, item.answer)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          {copied === i ? <><i className="fa-solid fa-check text-emerald-500" /> Copied</> : <><i className="fa-regular fa-copy" /> Copy</>}
                        </button>
                      </div>
                      <div className="space-y-1.5 pl-2 border-l-2 border-pink-500/40">
                        {renderAnswer(item.answer)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
