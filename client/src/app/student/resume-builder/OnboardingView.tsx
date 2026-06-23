import React from 'react';

interface OnboardingViewProps {
  setStep: (step: "onboarding" | "templates" | "editor") => void;
  handleUploadResume: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  parsing: boolean;
}

export function OnboardingView({ setStep, handleUploadResume, parsing }: OnboardingViewProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in relative overflow-hidden px-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-3xl w-full relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            How would you like to build your resume?
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            Choose to start fresh or upload an existing resume to get intelligent suggestions and a beautiful new design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start New Option */}
          <div 
            onClick={() => setStep("templates")}
            className="group cursor-pointer bg-white dark:bg-zinc-900/50 border-2 border-zinc-200 hover:border-indigo-500 dark:border-zinc-800 dark:hover:border-indigo-500 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col items-center text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <i className="fa-solid fa-plus text-3xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Start with a new resume</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Get step-by-step support with expert content suggestions at your fingertips!
              </p>
            </div>
            <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors w-full sm:w-auto">
              Create new
            </button>
          </div>

          {/* Upload Existing Option */}
          <div className="group bg-white dark:bg-zinc-900/50 border-2 border-zinc-200 hover:border-blue-500 dark:border-zinc-800 dark:hover:border-blue-500 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
            <input
              type="file"
              id="ai-resume-upload-large"
              accept=".pdf,.docx"
              onChange={async (e) => {
                await handleUploadResume(e);
                setStep("templates"); // Proceed to templates after upload
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={parsing}
            />
            <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {parsing ? (
                <i className="fa-solid fa-arrows-rotate text-3xl animate-spin"></i>
              ) : (
                <i className="fa-solid fa-file-arrow-up text-3xl"></i>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Upload an existing resume</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Edit your resume using expertly generated content in a fresh, new design.
              </p>
            </div>
            <div className="px-8 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold transition-colors w-full sm:w-auto">
              {parsing ? "Uploading & Parsing..." : "Choose file"}
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-zinc-400 font-medium">
          Acceptable file types: DOC, DOCX, PDF, HTML, RTF, TXT
        </p>
      </div>
    </div>
  );
}
