import React from 'react';

interface TemplatesGalleryProps {
  setStep: (step: "onboarding" | "templates" | "editor") => void;
  resumeData: any;
  setResumeData: (data: any) => void;
}

const TEMPLATES = [
  { 
    id: 'modern', 
    name: 'Modern Clean', 
    recommended: true,
    colors: ['bg-indigo-600', 'bg-zinc-900']
  },
  { 
    id: 'creative', 
    name: 'Creative Tech', 
    recommended: true,
    colors: ['bg-purple-600', 'bg-emerald-500']
  },
  { 
    id: 'executive', 
    name: 'Executive Dark', 
    recommended: false,
    colors: ['bg-[#344054]', 'bg-white']
  },
  { 
    id: 'professional', 
    name: 'Professional Standard', 
    recommended: true,
    colors: ['bg-slate-800', 'bg-blue-700']
  },
  { 
    id: 'minimal', 
    name: 'Classic Minimal', 
    recommended: false,
    colors: ['bg-zinc-900', 'bg-zinc-400']
  },
  { 
    id: 'tech', 
    name: 'Developer Dark Mode', 
    recommended: true,
    colors: ['bg-zinc-950', 'bg-emerald-400']
  }
];

export function TemplatesGallery({ setStep, resumeData, setResumeData }: TemplatesGalleryProps) {
  
  const handleSelect = (templateId: string) => {
    setResumeData({ ...resumeData, template: templateId });
    setStep("editor");
  };

  return (
    <div className="space-y-12 animate-fade-in py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Templates we recommend for you
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          You can always change your template later in the editor.
        </p>
      </div>

      {/* Filter Bar Mockup */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 ml-2">Filter by</span>
        <select className="px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
          <option>Headshot</option>
          <option>No Headshot</option>
        </select>
        <select className="px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
          <option>Graphics</option>
          <option>Text Only</option>
        </select>
        <select className="px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
          <option>2 Columns</option>
          <option>1 Column</option>
        </select>

        <div className="flex items-center gap-2 ml-auto pr-2">
          <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 mr-2">Colors</span>
          <div className="w-6 h-6 rounded-full bg-zinc-900 border-2 border-indigo-500 ring-2 ring-indigo-500/30 flex items-center justify-center">
            <i className="fa-solid fa-check text-[10px] text-white"></i>
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-700 cursor-pointer hover:scale-110 transition-transform"></div>
          <div className="w-6 h-6 rounded-full bg-emerald-600 cursor-pointer hover:scale-110 transition-transform"></div>
          <div className="w-6 h-6 rounded-full bg-blue-600 cursor-pointer hover:scale-110 transition-transform"></div>
          <div className="w-6 h-6 rounded-full bg-purple-600 cursor-pointer hover:scale-110 transition-transform"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-6">
          Showing <span className="text-zinc-900 dark:text-white font-bold">{TEMPLATES.length}</span> templates
        </p>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="relative group perspective">
              {/* Template Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-indigo-500/20 group-hover:-translate-y-2 relative aspect-[1/1.4] flex flex-col items-center justify-center">
                
                {/* Visual Mockup inside card depending on template type */}
                {tpl.id === 'executive' && (
                  <div className="w-full h-full flex opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-1/3 bg-[#344054] h-full p-4 flex flex-col gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-400 mx-auto mt-4"></div>
                      <div className="h-1 bg-white/20 w-full mt-4"></div>
                      <div className="h-1.5 bg-white/40 w-3/4"></div>
                      <div className="h-1.5 bg-white/40 w-1/2"></div>
                    </div>
                    <div className="w-2/3 bg-white h-full p-6 flex flex-col gap-3">
                      <div className="h-3 bg-zinc-800 w-3/4"></div>
                      <div className="h-1 bg-zinc-300 w-1/4"></div>
                      <div className="h-2 bg-zinc-200 w-full mt-4"></div>
                      <div className="h-2 bg-zinc-200 w-full"></div>
                      <div className="h-2 bg-zinc-200 w-5/6"></div>
                    </div>
                  </div>
                )}
                {tpl.id === 'modern' && (
                  <div className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity bg-white p-6 flex flex-col gap-3">
                    <div className="h-4 bg-indigo-600 w-1/2"></div>
                    <div className="h-1.5 bg-zinc-400 w-1/4"></div>
                    <div className="w-full h-[1px] bg-indigo-100 my-2"></div>
                    <div className="flex gap-4">
                      <div className="w-1/4 space-y-2">
                         <div className="h-2 bg-indigo-500 w-full"></div>
                         <div className="h-1.5 bg-zinc-200 w-full"></div>
                         <div className="h-1.5 bg-zinc-200 w-3/4"></div>
                      </div>
                      <div className="w-3/4 space-y-2">
                         <div className="h-2 bg-zinc-800 w-1/3"></div>
                         <div className="h-1.5 bg-zinc-300 w-full"></div>
                         <div className="h-1.5 bg-zinc-300 w-full"></div>
                         <div className="h-1.5 bg-zinc-300 w-5/6"></div>
                      </div>
                    </div>
                  </div>
                )}
                {tpl.id === 'creative' && (
                   <div className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity bg-zinc-50 flex flex-col">
                     <div className="h-1/4 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-end">
                       <div className="h-4 bg-white/90 w-1/2 rounded-sm"></div>
                     </div>
                     <div className="p-4 flex gap-4 h-3/4">
                       <div className="w-2/3 space-y-2">
                         <div className="h-2 bg-purple-600 w-1/4 rounded-full"></div>
                         <div className="h-1.5 bg-zinc-300 w-full"></div>
                         <div className="h-1.5 bg-zinc-300 w-full"></div>
                         <div className="h-1.5 bg-zinc-300 w-4/5"></div>
                       </div>
                       <div className="w-1/3 space-y-2 border-l border-zinc-200 pl-4">
                         <div className="h-2 bg-zinc-400 w-1/2"></div>
                         <div className="h-1 bg-zinc-200 w-full"></div>
                         <div className="h-1 bg-zinc-200 w-full"></div>
                       </div>
                     </div>
                   </div>
                )}
                {tpl.id === 'minimal' && (
                  <div className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity bg-white p-6 flex flex-col items-center text-center gap-2">
                    <div className="h-3 bg-zinc-900 w-1/2 mt-4"></div>
                    <div className="h-1 bg-zinc-400 w-3/4"></div>
                    <div className="h-[1px] bg-zinc-800 w-full my-2"></div>
                    <div className="h-2 bg-zinc-800 w-1/4 mt-2"></div>
                    <div className="h-1.5 bg-zinc-200 w-full text-left"></div>
                    <div className="h-1.5 bg-zinc-200 w-full text-left"></div>
                    <div className="h-1.5 bg-zinc-200 w-5/6 text-left"></div>
                  </div>
                )}
                {tpl.id === 'professional' && (
                  <div className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity bg-white p-6 flex flex-col gap-2">
                    <div className="h-4 bg-slate-800 w-3/4 mx-auto text-center font-serif"></div>
                    <div className="h-[2px] bg-slate-800 w-full my-2"></div>
                    <div className="h-2 bg-slate-800 w-1/4"></div>
                    <div className="flex gap-2">
                       <div className="h-1.5 bg-zinc-300 w-3/4"></div>
                       <div className="h-1.5 bg-zinc-300 w-1/4"></div>
                    </div>
                    <div className="h-1.5 bg-zinc-200 w-full"></div>
                    <div className="h-1.5 bg-zinc-200 w-full"></div>
                  </div>
                )}
                {tpl.id === 'tech' && (
                  <div className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity bg-zinc-950 p-6 flex flex-col gap-3 font-mono">
                    <div className="h-4 bg-emerald-400 w-1/2"></div>
                    <div className="h-1.5 bg-zinc-500 w-3/4"></div>
                    <div className="h-[1px] bg-zinc-800 w-full my-2"></div>
                    <div className="h-2 bg-emerald-400 w-1/4"></div>
                    <div className="h-1.5 bg-zinc-400 w-full"></div>
                    <div className="h-1.5 bg-zinc-400 w-full"></div>
                    <div className="h-1.5 bg-zinc-400 w-4/5"></div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button 
                    onClick={() => handleSelect(tpl.id)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                  >
                    Choose template
                  </button>
                </div>

                {/* Recommended Badge */}
                {tpl.recommended && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full shadow-sm z-10 border border-blue-200">
                    Recommended
                  </div>
                )}
              </div>
              
              {/* Template Title */}
              <div className="mt-4 text-center">
                <h3 className="font-bold text-zinc-900 dark:text-white">{tpl.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
