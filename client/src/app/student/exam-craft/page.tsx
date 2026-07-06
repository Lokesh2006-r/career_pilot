"use client";

import Link from "next/link";

export default function ExamCraftPage() {
  const tools = [
    {
      title: "Generate Questions",
      description: "Upload syllabus or notes to automatically generate exam questions.",
      icon: "fa-solid fa-file-circle-question",
      theme: "text-purple-500 bg-purple-500/10",
      borderTheme: "hover:border-purple-500/50 hover:shadow-purple-500/10",
      href: "/student/exam-craft/generate-questions",
    },
    {
      title: "Answer Generation",
      description: "Provide questions to get detailed answers formatted to your required length.",
      icon: "fa-solid fa-book-open",
      theme: "text-pink-500 bg-pink-500/10",
      borderTheme: "hover:border-pink-500/50 hover:shadow-pink-500/10",
      href: "/student/exam-craft/answer-generation",
    },
    {
      title: "Evaluate Answer Script",
      description: "Upload student scripts and auto-grade them using AI analysis.",
      icon: "fa-solid fa-chart-line",
      theme: "text-blue-500 bg-blue-500/10",
      borderTheme: "hover:border-blue-500/50 hover:shadow-blue-500/10",
      href: "/student/exam-craft/evaluate-script",
    },
    {
      title: "Topic Quiz Generator",
      description: "Generate customizable multiple-choice quizzes on any specific topic.",
      icon: "fa-solid fa-brain",
      theme: "text-zinc-500 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800/80",
      borderTheme: "hover:border-zinc-500/50 hover:shadow-zinc-500/10",
      href: "/student/exam-craft/topic-quiz",
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Exam Craft <i className="fa-solid fa-wand-magic-sparkles text-zinc-900 dark:text-white ml-2"></i>
          </h1>
          <p className="text-sm sm:text-base text-zinc-550 dark:text-zinc-400 mt-2 max-w-2xl">
            Empower your academic preparation with AI-driven tools. Generate questions, draft comprehensive answers, and auto-grade scripts instantly.
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Link 
            key={index} 
            href={tool.href}
            className={`group flex flex-col p-6 rounded-2xl bg-white dark:bg-[#0f0f11] border border-zinc-200 dark:border-zinc-800/60 shadow-sm transition-all duration-300 cursor-pointer ${tool.borderTheme}`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${tool.theme}`}>
              <i className={`${tool.icon} text-2xl`}></i>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3 tracking-wide">
              {tool.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
