"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

type Difficulty = "Easy" | "Medium" | "Hard";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type QuizState = "setup" | "playing" | "result";

export default function TopicQuizPage() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  // Playing state
  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Please enter a topic."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/exam/topic-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
      setQuiz(data.quiz || []);
      setIsDemo(data.isDemo || false);
      setUserAnswers(new Array(data.quiz.length).fill(null));
      setCurrentIdx(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setQuizState("playing");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    const updated = [...userAnswers];
    updated[currentIdx] = idx;
    setUserAnswers(updated);
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(userAnswers[currentIdx + 1]);
      setShowExplanation(userAnswers[currentIdx + 1] !== null);
    } else {
      setQuizState("result");
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setSelectedOption(userAnswers[currentIdx - 1]);
      setShowExplanation(userAnswers[currentIdx - 1] !== null);
    }
  };

  const handleRestart = () => {
    setQuizState("setup");
    setQuiz([]);
    setUserAnswers([]);
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const score = userAnswers.filter((a, i) => a === quiz[i]?.correctIndex).length;
  const percentage = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0;

  const difficultyColors: Record<Difficulty, string> = {
    Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    Medium: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    Hard: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  };

  const optionStyle = (idx: number, q: QuizQuestion) => {
    if (!showExplanation) {
      return selectedOption === idx
        ? "border-zinc-500 bg-zinc-100 dark:bg-zinc-800"
        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600";
    }
    if (idx === q.correctIndex) return "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    if (idx === selectedOption && idx !== q.correctIndex) return "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    return "border-zinc-200 dark:border-zinc-800 opacity-50";
  };

  const optionIcon = (idx: number, q: QuizQuestion) => {
    if (!showExplanation) return null;
    if (idx === q.correctIndex) return <i className="fa-solid fa-circle-check text-emerald-500 ml-auto" />;
    if (idx === selectedOption) return <i className="fa-solid fa-circle-xmark text-rose-500 ml-auto" />;
    return null;
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
            Topic Quiz Generator <i className="fa-solid fa-brain text-zinc-500 dark:text-zinc-300 ml-2" />
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Generate and take an interactive MCQ quiz on any topic.
          </p>
        </div>
      </div>

      {/* Setup Screen */}
      {quizState === "setup" && (
        <div className="max-w-xl mx-auto">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="e.g., Data Structures, World War II, Newton's Laws…"
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                Number of Questions: <span className="text-zinc-900 dark:text-white">{count}</span>
              </label>
              <input
                type="range" min={5} max={20} value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full accent-zinc-700 dark:accent-zinc-300"
              />
              <div className="flex justify-between text-xs text-zinc-400">
                <span>5</span><span>20</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      difficulty === d ? difficultyColors[d] : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {d}
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-900 dark:from-zinc-200 dark:to-white text-white dark:text-zinc-900 font-bold text-sm shadow-lg hover:shadow-zinc-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin" /> Generating Quiz…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-play" /> Start Quiz
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Playing Screen */}
      {quizState === "playing" && quiz.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              Question {currentIdx + 1} of {quiz.length}
            </span>
            <div className="flex items-center gap-2">
              {isDemo && <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">Demo</span>}
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${difficultyColors[difficulty]}`}>{difficulty}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-zinc-600 to-zinc-900 dark:from-zinc-300 dark:to-white rounded-full transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / quiz.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 space-y-5">
            <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-relaxed">
              {quiz[currentIdx].question}
            </p>

            {/* Options */}
            <div className="space-y-2.5">
              {quiz[currentIdx].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${optionStyle(idx, quiz[currentIdx])}`}
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-black flex items-center justify-center">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {optionIcon(idx, quiz[currentIdx])}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 animate-fade-in">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-lightbulb text-amber-400" /> Explanation
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{quiz[currentIdx].explanation}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-arrow-left" /> Previous
              </button>

              {!showExplanation ? (
                <span className="text-xs text-zinc-400 font-medium">Select an answer to continue</span>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 transition-all hover:scale-[1.02]"
                >
                  {currentIdx < quiz.length - 1 ? (
                    <>Next <i className="fa-solid fa-arrow-right" /></>
                  ) : (
                    <>Finish Quiz <i className="fa-solid fa-flag-checkered" /></>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {quiz.map((q, i) => {
              const answered = userAnswers[i] !== null;
              const correct = answered && userAnswers[i] === q.correctIndex;
              return (
                <button
                  key={i}
                  onClick={() => { setCurrentIdx(i); setSelectedOption(userAnswers[i]); setShowExplanation(userAnswers[i] !== null); }}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    i === currentIdx ? "scale-150 ring-2 ring-offset-1 ring-zinc-500" :
                    !answered ? "bg-zinc-200 dark:bg-zinc-700" :
                    correct ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Result Screen */}
      {quizState === "result" && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Score Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 text-center space-y-4">
            <div className="text-5xl">
              {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📚"}
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                {score} / {quiz.length} Correct
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                {percentage}% — {percentage >= 80 ? "Excellent work!" : percentage >= 60 ? "Good effort!" : "Keep practising!"}
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <i className="fa-solid fa-rotate-left" /> New Quiz
              </button>
              <button
                onClick={() => { setCurrentIdx(0); setShowExplanation(userAnswers[0] !== null); setSelectedOption(userAnswers[0]); setQuizState("playing"); }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold hover:opacity-90 transition-all"
              >
                <i className="fa-solid fa-eye" /> Review Answers
              </button>
            </div>
          </div>

          {/* Answer Review */}
          <div className="space-y-3">
            {quiz.map((q, i) => {
              const isCorrect = userAnswers[i] === q.correctIndex;
              return (
                <div key={i} className={`p-4 rounded-2xl border ${isCorrect ? "bg-emerald-500/5 border-emerald-500/30" : "bg-rose-500/5 border-rose-500/30"}`}>
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`shrink-0 w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${isCorrect ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-600 dark:text-rose-400"}`}>
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{q.question}</p>
                  </div>
                  <div className="pl-10 space-y-1.5">
                    {userAnswers[i] !== q.correctIndex && userAnswers[i] !== null && (
                      <p className="text-xs text-rose-500 flex items-center gap-1.5">
                        <i className="fa-solid fa-xmark" /> Your answer: {q.options[userAnswers[i]!]}
                      </p>
                    )}
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <i className="fa-solid fa-check" /> Correct: {q.options[q.correctIndex]}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
