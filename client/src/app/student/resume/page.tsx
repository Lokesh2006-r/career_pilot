"use client";

import { useState } from "react";

import { auth } from "@/lib/firebase";
import { API_BASE_URL } from "@/lib/api";

export default function ResumeLab() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", auth.currentUser?.uid || "test-user");

    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const fileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Helper: color for percentile
  const getPercentileColor = (p: number) => {
    if (p >= 75) return "text-emerald-500";
    if (p >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const getPercentileLabel = (p: number) => {
    if (p >= 85) return "Exceptional";
    if (p >= 70) return "Strong";
    if (p >= 50) return "Average";
    if (p >= 30) return "Below Average";
    return "Needs Work";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Resume Lab</h1>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1">Get precise AI feedback, ATS grading, and semantic optimization recommendations.</p>
        </div>
      </header>

      {!result ? (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`glass-panel rounded-3xl p-16 text-center border-2 border-dashed relative overflow-hidden group/upload transition-all duration-500 ${
            dragActive 
              ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.01]" 
              : "border-zinc-300 dark:border-zinc-800 bg-white/20 dark:bg-zinc-950/20 hover:border-indigo-500/40 hover:bg-white/30 dark:hover:bg-zinc-950/30"
          }`}
        >
          {/* Animated decorative backgrounds */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover/upload:bg-indigo-500/10 transition-colors"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl"></div>

          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-650 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_30px_rgba(99,102,241,0.3)] mb-8 group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-transform duration-300">
              <i className="fa-solid fa-cloud-arrow-up w-10 h-10" ></i>
            </div>
            
            <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
              Drag & Drop your Resume
            </h3>
            <p className="text-zinc-550 dark:text-zinc-400 mb-10 text-sm leading-relaxed max-w-sm">
              Upload PDF or DOCX file (up to 5MB). Our high-grade parser will evaluate matching indices, missing metrics, and compliance score.
            </p>
            
            <form onSubmit={handleUpload} className="w-full flex flex-col items-center gap-6">
              <div className="relative w-full max-w-sm">
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.docx"
                  onChange={fileSelected}
                  className="hidden"
                />
                <label 
                  htmlFor="resume-file-input"
                  className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/30 cursor-pointer shadow-sm w-full transition-all"
                >
                  <span className="truncate max-w-[240px]">
                    {file ? file.name : "Select from computer"}
                  </span>
                  <span className="text-xs bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-500/20 shrink-0">
                    Browse
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className="w-full max-w-sm py-4 bg-gradient-to-tr from-indigo-500 to-purple-650 text-white rounded-xl font-bold hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-arrows-rotate w-5 h-5 animate-spin" ></i>
                    Analyzing with AI Twin...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles w-5 h-5" ></i>
                    Analyze Resume
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Main Scoring Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* ATS Score Card */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
              <h3 className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-6">ATS Match Index</h3>
              
              {/* Premium Radial Gauge SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    className="stroke-zinc-200 dark:stroke-zinc-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    className="stroke-indigo-500"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={389.5}
                    strokeDashoffset={389.5 - (389.5 * result.atsScore) / 100}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none">{result.atsScore}</span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1">out of 100</span>
                </div>
              </div>
              
              <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <i className="fa-solid fa-bullseye w-3.5 h-3.5" ></i> High Placement Index
              </p>
            </div>

            {/* Confidence Score Card */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
              <h3 className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-6">Confidence Score</h3>
              
              {/* Premium Radial Gauge SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    className="stroke-zinc-200 dark:stroke-zinc-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    className="stroke-cyan-500"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={389.5}
                    strokeDashoffset={389.5 - (389.5 * (result.confidenceScore || 85)) / 100}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none">{result.confidenceScore || 85}%</span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Accuracy</span>
                </div>
              </div>

              <p className={`text-xs font-semibold flex items-center gap-1 ${
                (result.confidenceScore || 85) >= 80 ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                <i className="fa-solid fa-shield-halved w-3.5 h-3.5" ></i> High Trust Factor
              </p>
            </div>

            {/* Extracted Skills and Missing Keywords */}
            <div className="glass-panel p-6 rounded-3xl lg:col-span-2 space-y-6 flex flex-col justify-between group">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-3.5">
                  <i className="fa-solid fa-circle-check w-4.5 h-4.5 text-emerald-500" ></i>
                  Extracted Skills & Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills?.map((skill: string, i: number) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-500/10 hover:border-indigo-500/25 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-zinc-200/50 dark:border-zinc-800/40 pt-5">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2 mb-3.5">
                  <i className="fa-solid fa-circle-exclamation w-4.5 h-4.5 text-rose-500" ></i>
                  High-Priority Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords?.map((kw: string, i: number) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg border border-rose-500/10 hover:border-rose-500/25 transition-all duration-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============== BENCHMARK SECTION (Kaggle Dataset) ============== */}
          {result.benchmark && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
              
              {/* Section Title */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                  <i className="fa-solid fa-chart-column text-sm"></i>
                </div>
                <div>
                  <h2 className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white">Industry Benchmark</h2>
                  <p className="text-xs text-zinc-500">Compared against {result.benchmark.datasetTotalResumes?.toLocaleString()}+ real-world resumes from Kaggle dataset</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Category Detection Card */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-violet-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                  
                  <h3 className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-tag text-violet-500"></i>
                    Detected Job Category
                  </h3>
                  
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-700 dark:text-violet-300 rounded-xl font-bold text-base border border-violet-500/15">
                      <i className="fa-solid fa-briefcase text-violet-500"></i>
                      {result.benchmark.matchedCategory.replace(/-/g, ' ')}
                    </span>
                  </div>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Based on {result.benchmark.categoryResumeCount} resumes in this category
                  </p>

                  {/* Top 3 matching categories */}
                  {result.benchmark.topMatchedCategories?.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-zinc-200/40 dark:border-zinc-800/30">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-2">Also Matches</p>
                      <div className="space-y-1.5">
                        {result.benchmark.topMatchedCategories.slice(1).map((cat: any, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{cat.category.replace(/-/g, ' ')}</span>
                            <span className="text-[10px] font-bold text-zinc-400">{cat.matchPercent}% match</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Percentile Rank Card */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group flex flex-col items-center justify-center text-center">
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                  
                  <h3 className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <i className="fa-solid fa-ranking-star text-amber-500"></i>
                    Percentile Rank
                  </h3>
                  
                  {/* Big percentile number */}
                  <div className="relative mb-3">
                    <span className={`text-6xl font-black tracking-tighter leading-none ${getPercentileColor(result.benchmark.percentileRank)}`}>
                      {result.benchmark.percentileRank}
                    </span>
                    <span className={`text-xl font-bold ${getPercentileColor(result.benchmark.percentileRank)}`}>th</span>
                  </div>
                  
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    {getPercentileLabel(result.benchmark.percentileRank)}
                  </p>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
                    Your resume scores better than {result.benchmark.percentileRank}% of {result.benchmark.matchedCategory.replace(/-/g, ' ')} resumes
                  </p>
                  
                  {/* Mini comparison bar */}
                  <div className="w-full mt-5 pt-4 border-t border-zinc-200/40 dark:border-zinc-800/30">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-2">
                      <span>Your Score: {result.atsScore}</span>
                      <span>Category Avg: {result.benchmark.avgCategoryAtsScore}</span>
                    </div>
                    <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                      {/* Category average marker */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 dark:bg-zinc-600 z-10"
                        style={{ left: `${result.benchmark.avgCategoryAtsScore}%` }}
                      ></div>
                      {/* Student score fill */}
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          result.atsScore >= result.benchmark.avgCategoryAtsScore
                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                            : 'bg-gradient-to-r from-amber-400 to-amber-500'
                        }`}
                        style={{ width: `${Math.min(result.atsScore, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Missing Industry Skills Card */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -top-6 -right-6 w-28 h-28 bg-orange-500/5 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
                  
                  <h3 className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-puzzle-piece text-orange-500"></i>
                    Skills Gap vs. Industry Peers
                  </h3>
                  
                  <p className="text-xs text-zinc-500 mb-4">
                    Top skills in <span className="font-bold text-zinc-700 dark:text-zinc-300">{result.benchmark.matchedCategory.replace(/-/g, ' ')}</span> that are missing from your resume:
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {result.benchmark.missingIndustrySkills?.map((skill: string, i: number) => (
                      <span 
                        key={i} 
                        className="px-3 py-1.5 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-lg border border-orange-500/10 hover:border-orange-500/25 transition-all duration-300 flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-plus text-[8px] opacity-60"></i>
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  {result.benchmark.missingIndustrySkills?.length > 0 && (
                    <p className="text-[10px] text-zinc-400 mt-4 leading-relaxed">
                      <i className="fa-solid fa-lightbulb text-amber-400 mr-1"></i>
                      Adding these skills could improve your match rate by up to {Math.min(result.benchmark.missingIndustrySkills.length * 5, 35)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
            
            <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2.5">
              <i className="fa-solid fa-microchip w-5 h-5 text-indigo-500" ></i>
              Strategic Improvement Plan
            </h3>
            
            <ul className="space-y-4">
              {result.suggestions?.map((sugg: any, i: number) => (
                <li key={i} className="flex gap-4 p-4 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/30 bg-white/10 dark:bg-zinc-900/20 hover:border-indigo-500/20 transition-all duration-300">
                  <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 text-xs font-bold shadow-sm mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    {typeof sugg === 'string' ? (
                      <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed">{sugg}</p>
                    ) : (
                      <>
                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{sugg.title}</h4>
                        <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed">{sugg.explanation}</p>
                        {sugg.example && (
                          <div className="mt-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-xs text-zinc-700 dark:text-zinc-300 flex flex-col gap-1.5">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px]">Example</span>
                            <span className="leading-relaxed">{sugg.example}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Reset Button */}
          <div className="flex justify-center">
            <button 
              onClick={() => setResult(null)} 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 text-zinc-650 dark:text-zinc-300 font-semibold text-sm hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm cursor-pointer"
            >
              <i className="fa-solid fa-file-lines w-4 h-4" ></i>
              Upload another resume
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
