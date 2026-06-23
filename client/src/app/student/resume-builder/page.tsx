"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

import { API_BASE_URL } from "@/lib/api";
import { OnboardingView } from "./OnboardingView";
import { TemplatesGallery } from "./TemplatesGallery";

interface Experience {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Project {
  title: string;
  techStack: string;
  description: string;
  link: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    summary: string;
    avatar: string;
  };
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: {
    languages: string;
    frameworks: string;
    databases: string;
    tools: string;
  };
  template: string;
}

export default function ResumeBuilder() {
  const { user } = useAuth();
  const userId = user?.uid || "sandbox-uid";

  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "projects" | "education" | "skills">("personal");
  const [step, setStep] = useState<"onboarding" | "templates" | "editor">("onboarding");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [enhancingSummary, setEnhancingSummary] = useState(false);
  const [autoEnhancing, setAutoEnhancing] = useState(false);
  const [enhancingIndex, setEnhancingIndex] = useState<{ type: "experience" | "projects"; index: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      github: "",
      linkedin: "",
      summary: "",
      avatar: "",
    },
    experience: [
      { company: "", role: "", location: "", startDate: "", endDate: "", description: "" }
    ],
    projects: [
      { title: "", techStack: "", link: "", description: "" }
    ],
    education: [
      { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" }
    ],
    skills: {
      languages: "",
      frameworks: "",
      databases: "",
      tools: "",
    },
    template: "modern",
  });

  // Load saved resume data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/resume/build/load/${userId}`);
        const result = await response.json();
        if (result.data) {
          const dbData = result.data;
          setResumeData({
            personalInfo: dbData.personalInfo || { fullName: "", email: "", phone: "", location: "", website: "", github: "", linkedin: "", summary: "", avatar: "" },
            experience: dbData.experience?.length ? dbData.experience : [{ company: "", role: "", location: "", startDate: "", endDate: "", description: "" }],
            projects: dbData.projects?.length ? dbData.projects : [{ title: "", techStack: "", link: "", description: "" }],
            education: dbData.education?.length ? dbData.education : [{ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" }],
            skills: {
              languages: dbData.skills?.languages?.join(", ") || "",
              frameworks: dbData.skills?.frameworks?.join(", ") || "",
              databases: dbData.skills?.databases?.join(", ") || "",
              tools: dbData.skills?.tools?.join(", ") || "",
            },
            template: dbData.template || "modern",
          });
        }
      } catch (err) {
        console.error("Failed to load resume data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Save resume data
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    
    // Parse skills back into arrays
    const formattedData = {
      userId,
      ...resumeData,
      skills: {
        languages: resumeData.skills.languages.split(",").map(s => s.trim()).filter(Boolean),
        frameworks: resumeData.skills.frameworks.split(",").map(s => s.trim()).filter(Boolean),
        databases: resumeData.skills.databases.split(",").map(s => s.trim()).filter(Boolean),
        tools: resumeData.skills.tools.split(",").map(s => s.trim()).filter(Boolean),
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/build/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });
      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // AI Enhance Description
  const handleAIEnhance = async (type: "experience" | "projects", index: number, text: string) => {
    if (!text.trim()) return;
    setEnhancingIndex({ type, index });

    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (data.enhancedText) {
        if (type === "experience") {
          const updated = [...resumeData.experience];
          updated[index].description = data.enhancedText;
          setResumeData({ ...resumeData, experience: updated });
        } else {
          const updated = [...resumeData.projects];
          updated[index].description = data.enhancedText;
          setResumeData({ ...resumeData, projects: updated });
        }
      }
    } catch (err) {
      console.error("AI enhancement failed", err);
      alert("AI enhancement failed. Please try again.");
    } finally {
      setEnhancingIndex(null);
    }
  };

  // Upload and Parse Resume
  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/parse-enhancer`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.data) {
        const parsed = result.data;
        setResumeData({
          personalInfo: parsed.personalInfo || { fullName: "", email: "", phone: "", location: "", website: "", github: "", linkedin: "", summary: "", avatar: "" },
          experience: parsed.experience?.length ? parsed.experience : [{ company: "", role: "", location: "", startDate: "", endDate: "", description: "" }],
          projects: parsed.projects?.length ? parsed.projects : [{ title: "", techStack: "", link: "", description: "" }],
          education: parsed.education?.length ? parsed.education : [{ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" }],
          skills: {
            languages: Array.isArray(parsed.skills?.languages) ? parsed.skills.languages.join(", ") : (parsed.skills?.languages || ""),
            frameworks: Array.isArray(parsed.skills?.frameworks) ? parsed.skills.frameworks.join(", ") : (parsed.skills?.frameworks || ""),
            databases: Array.isArray(parsed.skills?.databases) ? parsed.skills.databases.join(", ") : (parsed.skills?.databases || ""),
            tools: Array.isArray(parsed.skills?.tools) ? parsed.skills.tools.join(", ") : (parsed.skills?.tools || ""),
          },
          template: resumeData.template || "modern",
        });
        alert("Resume uploaded, parsed and populating form successfully!");
      }
    } catch (err) {
      console.error("Failed to parse resume:", err);
      alert("Failed to parse resume. Please try again.");
    } finally {
      setParsing(false);
      e.target.value = "";
    }
  };

  // AI Enhance Professional Summary
  const handleAIEnhanceSummary = async (text: string) => {
    if (!text.trim()) return;
    setEnhancingSummary(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (data.enhancedText) {
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            summary: data.enhancedText
          }
        }));
      }
    } catch (err) {
      console.error("AI summary enhancement failed", err);
      alert("AI summary enhancement failed. Please try again.");
    } finally {
      setEnhancingSummary(false);
    }
  };

  // AI Auto-Enhance All Descriptions
  const handleAutoEnhanceAll = async () => {
    setAutoEnhancing(true);
    try {
      // 1. Enhance Summary
      let updatedSummary = resumeData.personalInfo.summary;
      if (updatedSummary.trim()) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/resume/enhance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: updatedSummary }),
          });
          const data = await res.json();
          if (data.enhancedText) updatedSummary = data.enhancedText;
        } catch (e) {
          console.error("Failed to enhance summary:", e);
        }
      }

      // 2. Enhance Experience Descriptions
      const updatedExperience = await Promise.all(
        resumeData.experience.map(async (exp) => {
          if (!exp.description.trim()) return exp;
          try {
            const res = await fetch(`${API_BASE_URL}/api/resume/enhance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: exp.description }),
            });
            const data = await res.json();
            return { ...exp, description: data.enhancedText || exp.description };
          } catch (e) {
            console.error("Failed to enhance experience description:", exp.company, e);
            return exp;
          }
        })
      );

      // 3. Enhance Projects Descriptions
      const updatedProjects = await Promise.all(
        resumeData.projects.map(async (proj) => {
          if (!proj.description.trim()) return proj;
          try {
            const res = await fetch(`${API_BASE_URL}/api/resume/enhance`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: proj.description }),
            });
            const data = await res.json();
            return { ...proj, description: data.enhancedText || proj.description };
          } catch (e) {
            console.error("Failed to enhance project description:", proj.title, e);
            return proj;
          }
        })
      );

      setResumeData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, summary: updatedSummary },
        experience: updatedExperience,
        projects: updatedProjects,
      }));

      alert("All resume descriptions and summary auto-enhanced successfully using Gemini!");
    } catch (err) {
      console.error("Auto-enhance failed", err);
      alert("Failed to auto-enhance all sections. Please try again.");
    } finally {
      setAutoEnhancing(false);
    }
  };

  // List Modification Handlers
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { company: "", role: "", location: "", startDate: "", endDate: "", description: "" }]
    });
  };

  const removeExperience = (index: number) => {
    const updated = [...resumeData.experience];
    updated.splice(index, 1);
    setResumeData({ ...resumeData, experience: updated });
  };

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [...resumeData.projects, { title: "", techStack: "", link: "", description: "" }]
    });
  };

  const removeProject = (index: number) => {
    const updated = [...resumeData.projects];
    updated.splice(index, 1);
    setResumeData({ ...resumeData, projects: updated });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", gpa: "" }]
    });
  };

  const removeEducation = (index: number) => {
    const updated = [...resumeData.education];
    updated.splice(index, 1);
    setResumeData({ ...resumeData, education: updated });
  };

  // Form input change handlers
  const handlePersonalInfoChange = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personalInfo: { ...resumeData.personalInfo, [field]: value }
    });
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, experience: updated });
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    const updated = [...resumeData.projects];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, projects: updated });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updated = [...resumeData.education];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, education: updated });
  };

  const handleSkillsChange = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      skills: { ...resumeData.skills, [field]: value }
    });
  };
  const handlePrint = () => {
    window.print();
  };

  if (step === "onboarding") {
    return <OnboardingView setStep={setStep} handleUploadResume={handleUploadResume} parsing={parsing} />;
  }

  if (step === "templates") {
    return <TemplatesGallery setStep={setStep} resumeData={resumeData} setResumeData={setResumeData} />;
  }

  return (
    <div className="space-y-8 animate-fade-in print:m-0 print:p-0">
      
      {/* CSS print override styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide sidebar, header, navigation, and editor panel */
          aside,
          header,
          .print\\:hidden {
            display: none !important;
          }
          
          /* Hide all page content except preview sheet */
          body * {
            visibility: hidden;
          }
          #resume-preview-sheet, #resume-preview-sheet * {
            visibility: visible;
          }
          
          /* Normalize the layout wrappers to prevent blank offset space */
          html, body, main, div {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            box-shadow: none !important;
          }
          
          #resume-preview-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 2cm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            overflow: visible !important;
          }
        }
      ` }} />

      {/* Header Panel */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden border-b border-zinc-200/50 dark:border-zinc-800/40 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-655 flex items-center justify-center text-white shadow-md">
              <i className="fa-solid fa-wand-magic-sparkles w-4 h-4 animate-pulse" ></i>
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-tr from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">Resume Enhancer</h1>
          </div>
          <p className="text-zinc-550 dark:text-zinc-400 mt-1 text-sm">Submit your fully updated resume format to generate enhancements for your job application success.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            id="ai-resume-upload"
            accept=".pdf,.docx"
            onChange={handleUploadResume}
            className="hidden"
          />
          <label
            htmlFor="ai-resume-upload"
            className="flex items-center gap-2 px-5 py-3 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/35 text-indigo-500 dark:text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            {parsing ? (
              <>
                <i className="fa-solid fa-arrows-rotate w-4 h-4 animate-spin" ></i>
                Parsing & Enhancing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up w-4 h-4" ></i>
                Upload Resume
              </>
            )}
          </label>

          <button
            onClick={handleAutoEnhanceAll}
            disabled={autoEnhancing}
            className="flex items-center gap-2 px-5 py-3 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 hover:border-purple-500/35 text-purple-500 dark:text-purple-400 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {autoEnhancing ? (
              <>
                <i className="fa-solid fa-arrows-rotate w-4 h-4 animate-spin" ></i>
                Auto-Enhancing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles w-4 h-4 animate-pulse" ></i>
                AI Auto-Enhance All
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95"
          >
            {saving ? <i className="fa-solid fa-arrows-rotate w-4 h-4 animate-spin" ></i> : <i className="fa-solid fa-floppy-disk w-4 h-4" ></i>}
            Save
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-tr from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition-all active:scale-95"
          >
            <i className="fa-solid fa-download w-4 h-4" ></i>
            Download PDF
          </button>
        </div>
      </header>

      {/* Save Notification */}
      {saveStatus !== "idle" && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border print:hidden ${
          saveStatus === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
        }`}>
          {saveStatus === "success" ? <i className="fa-solid fa-check w-5 h-5" ></i> : <i className="fa-solid fa-circle-exclamation w-5 h-5" ></i>}
          <span className="text-xs font-bold uppercase tracking-wider">
            {saveStatus === "success" ? "Resume saved successfully!" : "Failed to save resume. Please try again."}
          </span>
        </div>
      )}

      {/* Editor & Preview Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Editor Panel */}
        <div className="lg:col-span-6 space-y-6 print:hidden max-h-[calc(100vh-200px)] overflow-y-auto pr-2 pb-8">
          
          {/* 1. Personal Details */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border border-zinc-200/50 dark:border-zinc-800/40">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-user w-4.5 h-4.5 text-indigo-500" ></i>
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-405">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange("fullName", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                    placeholder="Alex Mercer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-405">Email Address</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                    placeholder="alex.mercer@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-405">Phone Number</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-405">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-405">Website</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.website}
                    onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                    placeholder="alexmercer.dev"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-405">GitHub Link</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => handlePersonalInfoChange("github", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                    placeholder="github.com/alexmercer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-405">LinkedIn Link</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                    placeholder="linkedin.com/in/alexmercer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-405">Profile Photo URL (Optional)</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.avatar || ""}
                  onChange={(e) => handlePersonalInfoChange("avatar", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                  placeholder="https://images.unsplash.com/... or leave blank for initials avatar"
                />
              </div>
            </div>
          </div>

          {/* 2. Professional Summary */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border border-zinc-200/50 dark:border-zinc-800/40">
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <i className="fa-solid fa-file-lines w-4.5 h-4.5 text-indigo-500" ></i>
                Professional Summary
              </h3>
              <button
                type="button"
                disabled={!resumeData.personalInfo.summary.trim() || enhancingSummary}
                onClick={() => handleAIEnhanceSummary(resumeData.personalInfo.summary)}
                className="inline-flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-colors bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/35 px-3 py-1.5 rounded-lg text-indigo-500 dark:text-indigo-400"
              >
                {enhancingSummary ? (
                  <>
                    <i className="fa-solid fa-arrows-rotate w-3.5 h-3.5 animate-spin" ></i>
                    Enhancing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles w-3.5 h-3.5 animate-pulse" ></i>
                    AI Enhance
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-1">
              <textarea
                rows={4}
                value={resumeData.personalInfo.summary}
                onChange={(e) => handlePersonalInfoChange("summary", e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all resize-none leading-relaxed"
                placeholder="Results-driven full-stack software engineer with 2+ years of experience building secure web architectures and cloud microservices. Passionate about AI integrations and RAG search indexation frameworks..."
              />
            </div>
          </div>

          {/* 3. Professional Experience */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border border-zinc-200/50 dark:border-zinc-800/40">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
              <i className="fa-solid fa-briefcase w-4.5 h-4.5 text-indigo-500" ></i>
              Work Experience
            </h3>
            
            <div className="space-y-6 animate-fade-in">
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/20 relative space-y-4">
                  <button 
                    onClick={() => removeExperience(idx)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-trash-can w-4 h-4" ></i>
                  </button>
                  
                  <h4 className="text-xs font-black uppercase text-indigo-500">Position #{idx + 1}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-450">Company Name</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="Uber"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Job Title / Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="Software Engineer Intern"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleExperienceChange(idx, "location", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="Seattle, WA"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceChange(idx, "startDate", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="May 2024"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceChange(idx, "endDate", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="Aug 2024 (or Present)"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Description / Key Achievements</label>
                      <button
                        type="button"
                        disabled={!exp.description.trim() || enhancingIndex !== null}
                        onClick={() => handleAIEnhance("experience", idx, exp.description)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-colors bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/35 px-3 py-1 rounded-lg text-indigo-500 dark:text-indigo-400"
                      >
                        {enhancingIndex?.type === "experience" && enhancingIndex.index === idx ? (
                          <>
                            <i className="fa-solid fa-arrows-rotate w-3 h-3 animate-spin" ></i>
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-wand-magic-sparkles w-3 h-3" ></i>
                            AI Optimize
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all resize-none leading-relaxed"
                      placeholder="Optimized matching backend algorithm. Reduced dispatch latency of riders. Used Node.js and Redis cache."
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={addExperience}
                className="w-full py-3.5 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-zinc-500 hover:text-indigo-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <i className="fa-solid fa-plus w-4 h-4" ></i>
                Add Experience
              </button>
            </div>
          </div>

          {/* 4. Projects */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border border-zinc-200/50 dark:border-zinc-800/40">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
              <i className="fa-solid fa-wand-magic-sparkles w-4.5 h-4.5 text-indigo-500" ></i>
              Projects
            </h3>
            
            <div className="space-y-6 animate-fade-in">
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/20 relative space-y-4">
                  <button 
                    onClick={() => removeProject(idx)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-trash-can w-4 h-4" ></i>
                  </button>
                  
                  <h4 className="text-xs font-black uppercase text-indigo-500">Project #{idx + 1}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="Student AI Twin"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Tech Stack / Core Tools</label>
                      <input
                        type="text"
                        value={proj.techStack}
                        onChange={(e) => handleProjectChange(idx, "techStack", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="React, Next.js, Gemini API, Node.js"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Project Link (Optional)</label>
                    <input
                      type="text"
                      value={proj.link}
                      onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                      placeholder="github.com/alexmercer/ai-twin"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Description / Deliverables</label>
                      <button
                        type="button"
                        disabled={!proj.description.trim() || enhancingIndex !== null}
                        onClick={() => handleAIEnhance("projects", idx, proj.description)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-colors bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 hover:border-indigo-500/35 px-3 py-1 rounded-lg text-indigo-500 dark:text-indigo-400"
                      >
                        {enhancingIndex?.type === "projects" && enhancingIndex.index === idx ? (
                          <>
                            <i className="fa-solid fa-arrows-rotate w-3 h-3 animate-spin" ></i>
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-wand-magic-sparkles w-3 h-3" ></i>
                            AI Optimize
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={proj.description}
                      onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all resize-none leading-relaxed"
                      placeholder="Developed a platform matching student profiles with recruiters. Integrated chatbot endpoints using Gemini models."
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={addProject}
                className="w-full py-3.5 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-zinc-500 hover:text-indigo-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <i className="fa-solid fa-plus w-4 h-4" ></i>
                Add Project
              </button>
            </div>
          </div>

          {/* 5. Education */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border border-zinc-200/50 dark:border-zinc-800/40">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
              <i className="fa-solid fa-book-open w-4.5 h-4.5 text-indigo-500" ></i>
              Education
            </h3>
            
            <div className="space-y-6 animate-fade-in">
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/20 relative space-y-4">
                  <button 
                    onClick={() => removeEducation(idx)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-trash-can w-4 h-4" ></i>
                  </button>
                  
                  <h4 className="text-xs font-black uppercase text-indigo-500">Education #{idx + 1}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Institution / University</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="Stanford University"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Degree / Qualification</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="Bachelor of Science"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Field of Study / Major</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleEducationChange(idx, "fieldOfStudy", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Graduation Year</label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(idx, "endDate", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="2025"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">GPA / Grades</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                        placeholder="3.8 / 4.0"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={addEducation}
                className="w-full py-3.5 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-zinc-500 hover:text-indigo-500 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <i className="fa-solid fa-plus w-4 h-4" ></i>
                Add Education Entry
              </button>
            </div>
          </div>

          {/* 6. Core Skills */}
          <div className="glass-panel rounded-3xl p-6 space-y-6 shadow-sm border border-zinc-200/50 dark:border-zinc-800/40">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
              <i className="fa-solid fa-code w-4.5 h-4.5 text-indigo-500" ></i>
              Core Skills
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Languages (comma-separated)</label>
                <input
                  type="text"
                  value={resumeData.skills.languages}
                  onChange={(e) => handleSkillsChange("languages", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                  placeholder="TypeScript, Python, Go, Rust, C++"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Frameworks / Libraries (comma-separated)</label>
                <input
                  type="text"
                  value={resumeData.skills.frameworks}
                  onChange={(e) => handleSkillsChange("frameworks", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                  placeholder="React, Next.js, Node.js, Express, FastAPI"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Databases / Caches (comma-separated)</label>
                <input
                  type="text"
                  value={resumeData.skills.databases}
                  onChange={(e) => handleSkillsChange("databases", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                  placeholder="PostgreSQL, MongoDB, Redis, Cassandra"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wide text-zinc-455">Developer Tools (comma-separated)</label>
                <input
                  type="text"
                  value={resumeData.skills.tools}
                  onChange={(e) => handleSkillsChange("tools", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-805 text-zinc-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-550 transition-all"
                  placeholder="Docker, Kubernetes, Git, AWS (S3, Lambda), CI/CD"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Live Preview Panel */}
        <div className="lg:col-span-6 space-y-6 print:w-full print:m-0 print:p-0">
          
          {/* Template Configuration */}
          <div className="glass-panel rounded-3xl p-5 flex items-center justify-between print:hidden shadow-sm">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Template Selection</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setResumeData({...resumeData, template: 'modern'})}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  resumeData.template === 'modern' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                Modern
              </button>
              <button 
                onClick={() => setResumeData({...resumeData, template: 'minimal'})}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  resumeData.template === 'minimal' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                Minimal
              </button>
              <button 
                onClick={() => setResumeData({...resumeData, template: 'executive'})}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  resumeData.template === 'executive' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                Executive
              </button>
            </div>
          </div>

          <div 
            id="resume-preview-sheet" 
            className={`w-full aspect-[1/1.4142] bg-white text-zinc-900 shadow-md border border-zinc-250 dark:border-zinc-850 rounded-2xl print:border-none print:shadow-none print:rounded-none overflow-y-auto flex flex-col justify-start ${
              resumeData.template === 'executive' ? 'p-0' : 'p-12'
            }`}
          >
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <i className="fa-solid fa-arrows-rotate w-8 h-8 animate-spin text-indigo-500" ></i>
                <span className="text-xs font-semibold uppercase tracking-wider">Syncing Resume Layout...</span>
              </div>
            ) : (
              <div className="w-full h-full text-zinc-900 font-sans">
                {resumeData.template === 'minimal' ? (
                  // MINIMAL TEMPLATE
                  <div className="space-y-4 text-[9px] leading-relaxed">
                    <div className="flex justify-between items-end border-b border-zinc-900 pb-2">
                      <div>
                        <h2 className="text-lg font-bold tracking-tight text-zinc-900 leading-none">
                          {resumeData.personalInfo.fullName || "Your Full Name"}
                        </h2>
                        {resumeData.personalInfo.location ? (
                          <p className="text-zinc-500 font-semibold mt-1">{resumeData.personalInfo.location}</p>
                        ) : (
                          <p className="text-zinc-400 font-semibold mt-1 print:hidden">San Francisco, CA</p>
                        )}
                      </div>
                      <div className="text-right text-[8px] text-zinc-650 font-semibold space-y-0.5">
                        {(resumeData.personalInfo.email || resumeData.personalInfo.phone || resumeData.personalInfo.github || resumeData.personalInfo.linkedin) ? (
                          <>
                            {resumeData.personalInfo.email && <p>{resumeData.personalInfo.email}</p>}
                            {resumeData.personalInfo.phone && <p>{resumeData.personalInfo.phone}</p>}
                            <div className="flex gap-2 justify-end">
                              {resumeData.personalInfo.github && <span>{resumeData.personalInfo.github}</span>}
                              {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
                            </div>
                          </>
                        ) : (
                          <div className="text-zinc-400 print:hidden space-y-0.5">
                            <p>email@example.com</p>
                            <p>(555) 123-4567</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {resumeData.personalInfo.summary ? (
                      <div className="space-y-1">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-900">Summary</h3>
                        <p className="text-zinc-650 text-justify leading-relaxed">{resumeData.personalInfo.summary}</p>
                      </div>
                    ) : (
                      <div className="space-y-1 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-400">Summary</h3>
                        <p className="text-zinc-400 italic">Add a professional summary in the Personal tab...</p>
                      </div>
                    )}

                    {/* Education */}
                    {resumeData.education.some(e => e.institution || e.degree) ? (
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-900">Education</h3>
                        <div className="space-y-2">
                          {resumeData.education.map((edu, i) => (
                            (edu.institution || edu.degree) && (
                              <div key={i}>
                                <div className="flex justify-between items-baseline font-bold text-zinc-900">
                                  <span>{edu.institution}</span>
                                  <span className="text-[8px] text-zinc-550">{edu.endDate}</span>
                                </div>
                                <div className="text-zinc-650 -mt-0.5">
                                  {edu.degree} in {edu.fieldOfStudy} {edu.gpa && <span className="text-zinc-500 font-semibold">(GPA: {edu.gpa})</span>}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-400">Education</h3>
                        <div className="flex justify-between items-start text-zinc-400">
                          <span>Stanford University — B.S. in Computer Science</span>
                          <span className="text-[8px] font-semibold">June 2025</span>
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.some(e => e.company || e.role) ? (
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-900">Experience</h3>
                        <div className="space-y-3">
                          {resumeData.experience.map((exp, i) => (
                            (exp.company || exp.role) && (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between items-baseline font-bold text-zinc-900">
                                  <span>{exp.company} {exp.location && <span className="font-normal text-zinc-500 text-[8px]">({exp.location})</span>}</span>
                                  <span className="text-zinc-555 text-[8px]">{exp.startDate} – {exp.endDate}</span>
                                </div>
                                <div className="text-zinc-700 italic -mt-0.5 font-medium">{exp.role}</div>
                                {exp.description && (
                                  <ul className="list-disc pl-4 space-y-0.5 text-zinc-655 text-justify">
                                    {(exp.description || "").split("\n").filter(Boolean).map((bullet, idx) => (
                                      <li key={idx}>{bullet.replace(/^[•\-\*\s]+/, "")}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-400">Experience</h3>
                        <div>
                          <div className="flex justify-between items-start font-bold text-zinc-400">
                            <span>Software Engineer — Uber</span>
                            <span className="text-zinc-350 text-[8px]">May 2024 – Aug 2024</span>
                          </div>
                          <p className="text-zinc-400 italic">Add work experiences in the Experience tab...</p>
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects.some(p => p.title) ? (
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-900">Projects</h3>
                        <div className="space-y-3">
                          {resumeData.projects.map((proj, i) => (
                            proj.title && (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between items-baseline font-bold text-zinc-900">
                                  <span>{proj.title} {proj.techStack && <span className="font-medium text-zinc-500 text-[7.5px]">({proj.techStack})</span>}</span>
                                  {proj.link && <span className="text-indigo-600 text-[7.5px]">{proj.link}</span>}
                                </div>
                                {proj.description && (
                                  <ul className="list-disc pl-4 space-y-0.5 text-zinc-655 text-justify">
                                    {(proj.description || "").split("\n").filter(Boolean).map((bullet, idx) => (
                                      <li key={idx}>{bullet.replace(/^[•\-\*\s]+/, "")}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-400">Projects</h3>
                        <div>
                          <div className="flex justify-between items-start font-bold text-zinc-400">
                            <span>Student AI Twin (React, Next.js)</span>
                            <span className="text-[7.5px]">github.com/username/project</span>
                          </div>
                          <p className="text-zinc-450 italic">Add key project deliverables in the Projects tab...</p>
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.databases || resumeData.skills.tools) ? (
                      <div className="space-y-1.5">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-900">Skills</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-zinc-700">
                          {resumeData.skills.languages && (
                            <div>
                              <span className="font-bold text-zinc-800">Languages: </span>
                              <span className="text-zinc-650">{resumeData.skills.languages}</span>
                            </div>
                          )}
                          {resumeData.skills.frameworks && (
                            <div>
                              <span className="font-bold text-zinc-800">Frameworks: </span>
                              <span className="text-zinc-650">{resumeData.skills.frameworks}</span>
                            </div>
                          )}
                          {resumeData.skills.databases && (
                            <div>
                              <span className="font-bold text-zinc-800">Databases: </span>
                              <span className="text-zinc-650">{resumeData.skills.databases}</span>
                            </div>
                          )}
                          {resumeData.skills.tools && (
                            <div>
                              <span className="font-bold text-zinc-800">Tools: </span>
                              <span className="text-zinc-650">{resumeData.skills.tools}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[9.5px] tracking-wide text-zinc-400">Skills</h3>
                        <p className="text-zinc-400">Languages: TypeScript, Python | Frameworks: React, Node.js</p>
                      </div>
                    )}
                  </div>
                ) : resumeData.template === 'executive' ? (
                  // EXECUTIVE TEMPLATE (TWO-COLUMN PORTRAIT SIDEBAR)
                  <div className="grid grid-cols-12 min-h-full h-full text-[8.5px] leading-relaxed">
                    
                    {/* LEFT SIDEBAR COLUMN (33%) - Solid Dark Background */}
                    <div className="col-span-4 bg-[#344054] text-white p-6 space-y-6 flex flex-col justify-start min-h-full print:bg-[#344054] print:text-white">
                      
                      {/* Profile Photo */}
                      <div className="flex justify-center my-2">
                        {resumeData.personalInfo.avatar ? (
                          <img 
                            src={resumeData.personalInfo.avatar} 
                            alt="Profile Headshot" 
                            className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-slate-600 border-2 border-white/20 shadow-sm flex items-center justify-center text-white text-xl font-bold">
                            {(resumeData.personalInfo.fullName || "Y N").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <h3 className="font-extrabold uppercase text-[9px] tracking-wider border-b border-white/20 pb-0.5 text-white">Contact</h3>
                        {(resumeData.personalInfo.email || resumeData.personalInfo.phone || resumeData.personalInfo.location || resumeData.personalInfo.linkedin) ? (
                          <div className="space-y-1.5 text-[8px] text-zinc-300">
                            {resumeData.personalInfo.email && (
                              <div>
                                <p className="font-bold text-white text-[7px] uppercase">Email</p>
                                <p className="truncate">{resumeData.personalInfo.email}</p>
                              </div>
                            )}
                            {resumeData.personalInfo.phone && (
                              <div>
                                <p className="font-bold text-white text-[7px] uppercase">Phone</p>
                                <p>{resumeData.personalInfo.phone}</p>
                              </div>
                            )}
                            {resumeData.personalInfo.location && (
                              <div>
                                <p className="font-bold text-white text-[7px] uppercase">Address</p>
                                <p>{resumeData.personalInfo.location}</p>
                              </div>
                            )}
                            {resumeData.personalInfo.linkedin && (
                              <div>
                                <p className="font-bold text-white text-[7px] uppercase">LinkedIn</p>
                                <p className="truncate">{resumeData.personalInfo.linkedin}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5 text-[8px] text-zinc-455 print:hidden">
                            <div>
                              <p className="font-bold text-white/55 text-[7px] uppercase">Email</p>
                              <p>olivia.wilson@gmail.com</p>
                            </div>
                            <div>
                              <p className="font-bold text-white/55 text-[7px] uppercase">Phone</p>
                              <p>+987 654 321</p>
                            </div>
                            <div>
                              <p className="font-bold text-white/55 text-[7px] uppercase">Address</p>
                              <p>Street, city - state</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        <h3 className="font-extrabold uppercase text-[9px] tracking-wider border-b border-white/20 pb-0.5 text-white">Skills</h3>
                        {(resumeData.skills.frameworks || resumeData.skills.databases || resumeData.skills.tools) ? (
                          <ul className="list-disc pl-4 space-y-0.5 text-zinc-300">
                            {resumeData.skills.frameworks && resumeData.skills.frameworks.split(",").map((s, idx) => (
                              <li key={idx}>{s.trim()}</li>
                            ))}
                            {resumeData.skills.databases && resumeData.skills.databases.split(",").map((s, idx) => (
                              <li key={idx}>{s.trim()}</li>
                            ))}
                            {resumeData.skills.tools && resumeData.skills.tools.split(",").map((s, idx) => (
                              <li key={idx}>{s.trim()}</li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="list-disc pl-4 space-y-0.5 text-zinc-400 print:hidden">
                            <li>Accounting Principles</li>
                            <li>Financial Statement Prep</li>
                            <li>Microsoft Excel</li>
                            <li>Auditing</li>
                            <li>Data Analysis</li>
                          </ul>
                        )}
                      </div>

                      {/* Languages */}
                      <div className="space-y-2">
                        <h3 className="font-extrabold uppercase text-[9px] tracking-wider border-b border-white/20 pb-0.5 text-white">Languages</h3>
                        {resumeData.skills.languages ? (
                          <ul className="list-disc pl-4 space-y-0.5 text-zinc-300">
                            {resumeData.skills.languages.split(",").map((s, idx) => (
                              <li key={idx}>{s.trim()}</li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="list-disc pl-4 space-y-0.5 text-zinc-400 print:hidden">
                            <li>English: Advanced</li>
                            <li>Spanish: Proficient</li>
                            <li>French: Intermediate</li>
                          </ul>
                        )}
                      </div>

                    </div>

                    {/* RIGHT CONTENT COLUMN (67%) - Solid White Background */}
                    <div className="col-span-8 bg-white text-zinc-900 p-8 py-10 space-y-5 flex flex-col justify-start min-h-full">
                      
                      {/* Name and Title */}
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 leading-none">
                          {resumeData.personalInfo.fullName || "Olivia Wilson"}
                        </h2>
                        <h4 className="text-[10px] font-bold text-zinc-650 tracking-wide uppercase">
                          {resumeData.experience[0]?.role || "Accountant"}
                        </h4>
                      </div>

                      {/* Summary */}
                      {resumeData.personalInfo.summary ? (
                        <p className="text-zinc-700 text-justify text-[8px] leading-relaxed">
                          {resumeData.personalInfo.summary}
                        </p>
                      ) : (
                        <div className="opacity-40 print:hidden text-[8px] leading-relaxed text-zinc-500 italic text-justify">
                          Skilled and experienced accountant with a proven track record of success in the financial services industry. Expertise in all aspects of accounting, including financial statement preparation, auditing, and taxation. Strong analytical and problem-solving skills.
                        </div>
                      )}

                      {/* Work Experience */}
                      <div className="space-y-2.5">
                        <h3 className="font-bold uppercase text-[10px] tracking-wider text-zinc-950 border-b border-zinc-200 pb-0.5">Work Experience</h3>
                        
                        {resumeData.experience.some(e => e.company || e.role) ? (
                          <div className="space-y-3.5">
                            {resumeData.experience.map((exp, i) => (
                              (exp.company || exp.role) && (
                                <div key={i} className="space-y-1">
                                  <div className="font-bold text-zinc-900 text-[8.5px]">{exp.role}</div>
                                  <div className="text-[7.5px] text-zinc-650 font-semibold">
                                    {exp.company} {exp.location && `| ${exp.location}`} {exp.startDate && `| ${exp.startDate} – ${exp.endDate}`}
                                  </div>
                                  {exp.description && (
                                    <ul className="list-disc pl-4 space-y-0.5 text-zinc-655 text-justify text-[7.5px]">
                                      {(exp.description || "").split("\n").filter(Boolean).map((bullet, idx) => (
                                        <li key={idx}>{bullet.replace(/^[•\-\*\s]+/, "")}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3 print:hidden opacity-40 text-zinc-500">
                            <div className="space-y-1">
                              <div className="font-bold text-zinc-950 text-[8.5px]">Accountant</div>
                              <div className="text-[7.5px] text-zinc-600 font-semibold">ABC Company | City | Jan 2022 – Dec 2023</div>
                              <p className="text-[7.5px] text-zinc-600 text-justify leading-relaxed">
                                Provided accurate financial analysis and reporting for informed decision-making. Managed full-cycle accounting processes, including accounts payable/receivable, general ledger entries, and bank reconciliations.
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="font-bold text-zinc-950 text-[8.5px]">Junior Accountant</div>
                              <div className="text-[7.5px] text-zinc-600 font-semibold">XYZ Company | City | Jan 2021 – Dec 2021</div>
                              <p className="text-[7.5px] text-zinc-600 text-justify leading-relaxed">
                                Collaborated with colleagues to improve documentation and streamline month-end procedures, resulting in enhanced efficiency and accuracy.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Education */}
                      <div className="space-y-2.5">
                        <h3 className="font-bold uppercase text-[10px] tracking-wider text-zinc-955 border-b border-zinc-200 pb-0.5">Education</h3>
                        
                        {resumeData.education.some(e => e.institution || e.degree) ? (
                          <div className="space-y-3.5">
                            {resumeData.education.map((edu, i) => (
                              (edu.institution || edu.degree) && (
                                <div key={i} className="space-y-0.5">
                                  <div className="font-bold text-zinc-900 text-[8.5px]">{edu.degree} in {edu.fieldOfStudy}</div>
                                  <div className="text-[7.5px] text-zinc-650 font-semibold">
                                    {edu.institution} {edu.endDate && `| ${edu.endDate}`} {edu.gpa && `| GPA: ${edu.gpa}`}
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3 print:hidden opacity-40 text-zinc-500">
                            <div className="space-y-0.5">
                              <div className="font-bold text-zinc-950 text-[8.5px]">Bachelor's Degree in BBA</div>
                              <div className="text-[7.5px] text-zinc-600 font-semibold">XYZ University | City | Jan 2018 – Dec 2021</div>
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-zinc-955 text-[8.5px]">Diploma in Accounting & Finance</div>
                              <div className="text-[7.5px] text-zinc-600 font-semibold">ABC Institute | City | Jan 2017 – Dec 2017</div>
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-zinc-955 text-[8.5px]">Diploma in Microsoft Excel</div>
                              <div className="text-[7.5px] text-zinc-600 font-semibold">XYZ Institute | City | July 2016 – Dec 2016</div>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                ) : resumeData.template === 'creative' ? (
                  <CreativeTemplate resumeData={resumeData} />
                ) : resumeData.template === 'professional' ? (
                  <ProfessionalTemplate resumeData={resumeData} />
                ) : resumeData.template === 'tech' ? (
                  <TechTemplate resumeData={resumeData} />
                ) : (
                  // MODERN TEMPLATE (DEFAULT)
                  <div className="space-y-5 text-[10px] leading-relaxed">
                    {/* Header Information */}
                    <div className="text-center space-y-2 border-b border-zinc-200 pb-3">
                      <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none">
                        {resumeData.personalInfo.fullName || "Your Full Name"}
                      </h2>
                      {(resumeData.personalInfo.email || resumeData.personalInfo.phone || resumeData.personalInfo.location || resumeData.personalInfo.website) ? (
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-zinc-550 text-[9px] font-semibold">
                          {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                          {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                          {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                          {resumeData.personalInfo.website && <span>{resumeData.personalInfo.website}</span>}
                        </div>
                      ) : (
                        <div className="text-zinc-400 italic print:hidden text-[9px] font-semibold">
                          your.email@gmail.com • (555) 123-4567 • San Francisco, CA • portfolio.com
                        </div>
                      )}
                      <div className="flex justify-center gap-x-4 text-[9px] font-semibold text-indigo-600">
                        {resumeData.personalInfo.github && <span>{resumeData.personalInfo.github}</span>}
                        {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
                      </div>
                    </div>

                    {/* Professional Summary */}
                    {resumeData.personalInfo.summary ? (
                      <div className="space-y-1">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-900 border-b border-zinc-200 pb-0.5">Summary</h3>
                        <p className="text-zinc-650 leading-relaxed text-justify">{resumeData.personalInfo.summary}</p>
                      </div>
                    ) : (
                      <div className="space-y-1 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-400 border-b border-zinc-200 pb-0.5">Summary</h3>
                        <p className="text-zinc-400 italic">Add a compelling professional summary in the Personal tab to highlight your career objectives...</p>
                      </div>
                    )}

                    {/* Education Section */}
                    {resumeData.education.some(e => e.institution || e.degree) ? (
                      <div className="space-y-2">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-900 border-b border-zinc-200 pb-0.5">Education</h3>
                        <div className="space-y-2.5">
                          {resumeData.education.map((edu, i) => (
                            (edu.institution || edu.degree) && (
                              <div key={i} className="space-y-0.5">
                                <div className="flex justify-between items-baseline font-bold text-zinc-900">
                                  <span>{edu.institution}</span>
                                  <span className="text-[8.5px] text-zinc-550">{edu.endDate}</span>
                                </div>
                                <div className="text-zinc-650 font-medium -mt-0.5">
                                  {edu.degree} in {edu.fieldOfStudy} {edu.gpa && <span className="text-zinc-500 font-semibold">(GPA: {edu.gpa})</span>}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-400 border-b border-zinc-200 pb-0.5">Education</h3>
                        <div className="flex justify-between items-start text-zinc-400 text-[10px]">
                          <div>
                            <span className="font-bold">Stanford University</span>
                            <span> — B.S. in Computer Science</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold">Graduation: June 2025</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Experience Section */}
                    {resumeData.experience.some(e => e.company || e.role) ? (
                      <div className="space-y-2">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-900 border-b border-zinc-200 pb-0.5">Experience</h3>
                        <div className="space-y-3.5">
                          {resumeData.experience.map((exp, i) => (
                            (exp.company || exp.role) && (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between items-baseline font-bold text-zinc-900">
                                  <span>{exp.company} {exp.location && <span className="font-normal text-zinc-500 text-[8.5px]">({exp.location})</span>}</span>
                                  <span className="text-zinc-555 text-[8.5px] font-semibold">{exp.startDate} – {exp.endDate}</span>
                                </div>
                                <div className="text-zinc-700 italic -mt-0.5 font-medium">{exp.role}</div>
                                {exp.description && (
                                  <ul className="list-disc pl-4 space-y-0.5 text-zinc-655 text-justify">
                                    {(exp.description || "").split("\n").filter(Boolean).map((bullet, idx) => (
                                      <li key={idx}>{bullet.replace(/^[•\-\*\s]+/, "")}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-400 border-b border-zinc-200 pb-0.5">Experience</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between items-start font-bold text-zinc-400 text-[10px]">
                            <span>Software Engineer Intern | Uber</span>
                            <span className="text-[9px] font-semibold">May 2024 – Aug 2024</span>
                          </div>
                          <div className="text-[9px] text-zinc-350 italic font-medium">Seattle, WA</div>
                          <p className="text-zinc-450 italic font-normal">Add details in the Experience tab. Tip: Use the 'AI Optimize (X-Y-Z)' button to rewrite descriptions using high-impact metrics!</p>
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {resumeData.projects.some(p => p.title) ? (
                      <div className="space-y-2">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-900 border-b border-zinc-200 pb-0.5">Projects</h3>
                        <div className="space-y-3.5">
                          {resumeData.projects.map((proj, i) => (
                            proj.title && (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between items-baseline font-bold text-zinc-900">
                                  <span>{proj.title} {proj.techStack && <span className="font-semibold text-zinc-500 text-[8.5px]">({proj.techStack})</span>}</span>
                                  {proj.link && <span className="text-indigo-600 text-[8.5px] font-semibold">{proj.link}</span>}
                                </div>
                                {proj.description && (
                                  <ul className="list-disc pl-4 space-y-0.5 text-zinc-655 text-justify">
                                    {(proj.description || "").split("\n").filter(Boolean).map((bullet, idx) => (
                                      <li key={idx}>{bullet.replace(/^[•\-\*\s]+/, "")}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-400 border-b border-zinc-200 pb-0.5">Projects</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between items-start font-bold text-zinc-400 text-[10px]">
                            <span>Student AI Twin (React, Next.js, Node.js)</span>
                            <span className="text-[8.5px] font-semibold">github.com/username/project</span>
                          </div>
                          <p className="text-zinc-450 italic font-normal">Add your engineering projects in the Projects tab to demonstrate practical application of skills.</p>
                        </div>
                      </div>
                    )}

                    {/* Skills Section */}
                    {(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.databases || resumeData.skills.tools) ? (
                      <div className="space-y-2">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-900 border-b border-zinc-200 pb-0.5">Skills</h3>
                        <div className="space-y-1 text-zinc-700">
                          {resumeData.skills.languages && (
                            <div>
                              <span className="font-bold text-zinc-800">Languages: </span>
                              <span className="text-zinc-650">{resumeData.skills.languages}</span>
                            </div>
                          )}
                          {resumeData.skills.frameworks && (
                            <div>
                              <span className="font-bold text-zinc-800">Frameworks / Libraries: </span>
                              <span className="text-zinc-650">{resumeData.skills.frameworks}</span>
                            </div>
                          )}
                          {resumeData.skills.databases && (
                            <div>
                              <span className="font-bold text-zinc-800">Databases / Caching: </span>
                              <span className="text-zinc-650">{resumeData.skills.databases}</span>
                            </div>
                          )}
                          {resumeData.skills.tools && (
                            <div>
                              <span className="font-bold text-zinc-800">Tools / Platforms: </span>
                              <span className="text-zinc-650">{resumeData.skills.tools}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 opacity-40 print:hidden">
                        <h3 className="font-extrabold uppercase text-[11px] tracking-wide text-zinc-400 border-b border-zinc-200 pb-0.5">Skills</h3>
                        <div className="space-y-1 text-zinc-400">
                          <div><span className="font-bold text-zinc-550">Languages:</span> TypeScript, Python, C++, Go</div>
                          <div><span className="font-bold text-zinc-550">Frameworks:</span> React, Next.js, Node.js</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all cursor-pointer whitespace-nowrap border ${
        active 
          ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-sm" 
          : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-transparent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
