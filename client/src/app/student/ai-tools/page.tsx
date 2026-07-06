"use client";

import Link from "next/link";

const AI_TOOLS = [
  {
    title: "Career Health Score",
    description: "AI-generated score based on your resume, coding progress, and overall profile.",
    icon: "fa-solid fa-heart-pulse text-rose-500",
    href: "/student/ai-tools/career-health",
    color: "bg-rose-500/10",
  },
  {
    title: "Dream Company Roadmap",
    description: "Select your dream company and get a personalized preparation roadmap.",
    icon: "fa-solid fa-map-location-dot text-indigo-500",
    href: "/student/ai-tools/dream-company",
    color: "bg-indigo-500/10",
  },
  {
    title: "GitHub Analyzer",
    description: "Connect your GitHub to get an AI analysis of your repository quality and commits.",
    icon: "fa-brands fa-github text-zinc-900 dark:text-white",
    href: "/student/ai-tools/github-analyzer",
    color: "bg-zinc-500/10",
  },
  {
    title: "Portfolio Analyzer",
    description: "Submit your portfolio URL for an AI review of UX, SEO, and performance.",
    icon: "fa-solid fa-laptop-code text-cyan-500",
    href: "/student/ai-tools/portfolio-analyzer",
    color: "bg-cyan-500/10",
  },
  {
    title: "Skill Gap Analyzer",
    description: "Compare your current skills with industry requirements for your target role.",
    icon: "fa-solid fa-chart-pie text-amber-500",
    href: "/student/ai-tools/skill-gap",
    color: "bg-amber-500/10",
  },
  {
    title: "Placement Readiness",
    description: "Get a comprehensive prediction of your placement readiness based on your data.",
    icon: "fa-solid fa-bullseye text-emerald-500",
    href: "/student/ai-tools/placement-readiness",
    color: "bg-emerald-500/10",
  },
  {
    title: "Weekly Career Report",
    description: "Automatically generate and download your weekly progress report.",
    icon: "fa-solid fa-calendar-check text-purple-500",
    href: "/student/ai-tools/weekly-report",
    color: "bg-purple-500/10",
  },
  {
    title: "Project Quality Analyzer",
    description: "Analyze a specific GitHub repository for code organization and best practices.",
    icon: "fa-solid fa-code-branch text-blue-500",
    href: "/student/ai-tools/project-analyzer",
    color: "bg-blue-500/10",
  },
  {
    title: "Career Timeline",
    description: "Interactive timeline of your skills, certs, and milestones.",
    icon: "fa-solid fa-timeline text-orange-500",
    href: "/student/ai-tools/career-timeline",
    color: "bg-orange-500/10",
  },
  {
    title: "Achievement Passport",
    description: "Digital badges and milestones tracking your coding and career journey.",
    icon: "fa-solid fa-award text-yellow-500",
    href: "/student/ai-tools/achievements",
    color: "bg-yellow-500/10",
  },
];

export default function AIToolsHub() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in text-zinc-900 dark:text-zinc-100 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-[11px] uppercase tracking-wider mb-1">
            <i className="fa-solid fa-wand-magic-sparkles w-3.5 h-3.5"></i>
            CareerPilot Hub
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Tools Suite</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Supercharge your placement preparation with AI-driven insights, analytics, and roadmaps.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {AI_TOOLS.map((tool, index) => (
          <Link key={index} href={tool.href}>
            <div className="group h-full flex flex-col p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm hover:shadow-md cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${tool.color}`}>
                  <i className={`${tool.icon} text-xl`}></i>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fa-solid fa-arrow-right text-sm text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed flex-1">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
