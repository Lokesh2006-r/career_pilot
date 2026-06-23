import React from 'react';

export function CreativeTemplate({ resumeData }: { resumeData: any }) {
  return (
    <div className="min-h-full bg-white text-[9px] leading-relaxed">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 pb-12 rounded-b-3xl">
        <h2 className="text-3xl font-black tracking-tight leading-none mb-2">
          {resumeData.personalInfo.fullName || "Your Full Name"}
        </h2>
        <h4 className="text-[11px] font-bold text-white/80 tracking-wide uppercase mb-4">
          {resumeData.experience[0]?.role || "Professional Title"}
        </h4>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/90 text-[8.5px] font-medium">
          {resumeData.personalInfo.email && <span><i className="fa-solid fa-envelope mr-1"></i>{resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && <span><i className="fa-solid fa-phone mr-1"></i>{resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.location && <span><i className="fa-solid fa-location-dot mr-1"></i>{resumeData.personalInfo.location}</span>}
          {resumeData.personalInfo.linkedin && <span><i className="fa-brands fa-linkedin mr-1"></i>{resumeData.personalInfo.linkedin}</span>}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 p-8 -mt-6">
        {/* Main Column */}
        <div className="col-span-8 space-y-6">
          {/* Summary */}
          {resumeData.personalInfo.summary && (
            <div className="space-y-2">
              <h3 className="font-black uppercase text-[12px] tracking-wide text-purple-700 border-b-2 border-purple-100 pb-1">Profile</h3>
              <p className="text-zinc-700 text-justify leading-relaxed">{resumeData.personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.some((e: any) => e.company || e.role) && (
            <div className="space-y-3">
              <h3 className="font-black uppercase text-[12px] tracking-wide text-purple-700 border-b-2 border-purple-100 pb-1">Experience</h3>
              <div className="space-y-4">
                {resumeData.experience.map((exp: any, i: number) => (
                  (exp.company || exp.role) && (
                    <div key={i} className="relative pl-4 border-l-2 border-indigo-200">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500"></div>
                      <div className="flex justify-between items-baseline font-bold text-zinc-900 text-[10px]">
                        <span>{exp.role}</span>
                        <span className="text-indigo-600 text-[8.5px] font-semibold">{exp.startDate} – {exp.endDate}</span>
                      </div>
                      <div className="text-zinc-600 font-medium mb-1">{exp.company} {exp.location && `| ${exp.location}`}</div>
                      {exp.description && (
                        <ul className="list-none space-y-0.5 text-zinc-650 text-justify">
                          {(exp.description || "").split("\n").filter(Boolean).map((bullet: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span>{bullet.replace(/^[•\-\*\s]+/, "")}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resumeData.projects.some((p: any) => p.title) && (
            <div className="space-y-3">
              <h3 className="font-black uppercase text-[12px] tracking-wide text-purple-700 border-b-2 border-purple-100 pb-1">Projects</h3>
              <div className="space-y-3">
                {resumeData.projects.map((proj: any, i: number) => (
                  proj.title && (
                    <div key={i} className="space-y-1 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <div className="flex justify-between items-baseline font-bold text-zinc-900">
                        <span>{proj.title}</span>
                        {proj.link && <span className="text-indigo-600 text-[8px]">{proj.link}</span>}
                      </div>
                      {proj.techStack && <div className="text-indigo-500 font-medium text-[8px]">{proj.techStack}</div>}
                      {proj.description && (
                        <p className="text-zinc-650 text-justify mt-1">
                          {(proj.description || "").replace(/^[•\-\*\s]+/, "")}
                        </p>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Education */}
          {resumeData.education.some((e: any) => e.institution || e.degree) && (
            <div className="space-y-3">
              <h3 className="font-black uppercase text-[12px] tracking-wide text-purple-700 border-b-2 border-purple-100 pb-1">Education</h3>
              <div className="space-y-3">
                {resumeData.education.map((edu: any, i: number) => (
                  (edu.institution || edu.degree) && (
                    <div key={i} className="space-y-0.5">
                      <div className="font-bold text-zinc-900 text-[9.5px]">{edu.degree}</div>
                      <div className="text-zinc-700 font-medium">{edu.fieldOfStudy}</div>
                      <div className="text-zinc-500 text-[8px]">{edu.institution}</div>
                      <div className="text-indigo-500 font-semibold text-[8px]">{edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}</div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.databases || resumeData.skills.tools) && (
            <div className="space-y-3">
              <h3 className="font-black uppercase text-[12px] tracking-wide text-purple-700 border-b-2 border-purple-100 pb-1">Skills</h3>
              <div className="space-y-2">
                {resumeData.skills.languages && (
                  <div>
                    <span className="font-bold text-zinc-800 block mb-0.5 text-[8.5px]">Languages</span>
                    <div className="flex flex-wrap gap-1">
                      {resumeData.skills.languages.split(",").map((s: string, idx: number) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-medium border border-indigo-100">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {resumeData.skills.frameworks && (
                  <div>
                    <span className="font-bold text-zinc-800 block mb-0.5 text-[8.5px]">Frameworks</span>
                    <div className="flex flex-wrap gap-1">
                      {resumeData.skills.frameworks.split(",").map((s: string, idx: number) => (
                        <span key={idx} className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[8px] font-medium border border-purple-100">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {resumeData.skills.databases && (
                  <div>
                    <span className="font-bold text-zinc-800 block mb-0.5 text-[8.5px]">Databases & Tools</span>
                    <div className="flex flex-wrap gap-1">
                      {resumeData.skills.databases.split(",").concat((resumeData.skills.tools || "").split(",")).filter(Boolean).map((s: string, idx: number) => (
                        <span key={idx} className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded text-[8px] font-medium border border-zinc-200">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfessionalTemplate({ resumeData }: { resumeData: any }) {
  return (
    <div className="min-h-full bg-white text-zinc-900 p-10 font-serif text-[9px] leading-relaxed border-t-8 border-slate-800">
      <div className="text-center space-y-1 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
          {resumeData.personalInfo.fullName || "Your Full Name"}
        </h1>
        <div className="text-[8.5px] text-slate-600 tracking-wider">
          {[
            resumeData.personalInfo.location,
            resumeData.personalInfo.phone,
            resumeData.personalInfo.email,
            resumeData.personalInfo.linkedin
          ].filter(Boolean).join(" • ")}
        </div>
      </div>

      {resumeData.personalInfo.summary && (
        <div className="mb-5">
          <p className="text-justify text-slate-800 leading-relaxed italic">{resumeData.personalInfo.summary}</p>
        </div>
      )}

      {resumeData.experience.some((e: any) => e.company || e.role) && (
        <div className="mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Professional Experience</h2>
          <div className="space-y-4">
            {resumeData.experience.map((exp: any, i: number) => (
              (exp.company || exp.role) && (
                <div key={i}>
                  <div className="flex justify-between items-end mb-0.5">
                    <span className="font-bold text-[10px] text-slate-900">{exp.role}</span>
                    <span className="text-[8.5px] font-semibold text-slate-600">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="italic text-slate-700">{exp.company}</span>
                    <span className="text-[8.5px] text-slate-500">{exp.location}</span>
                  </div>
                  {exp.description && (
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-800 text-justify">
                      {(exp.description || "").split("\n").filter(Boolean).map((bullet: string, idx: number) => (
                        <li key={idx}>{bullet.replace(/^[•\-\*\s]+/, "")}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {resumeData.education.some((e: any) => e.institution || e.degree) && (
        <div className="mb-5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Education</h2>
          <div className="space-y-3">
            {resumeData.education.map((edu: any, i: number) => (
              (edu.institution || edu.degree) && (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[10px] text-slate-900">{edu.institution}</div>
                    <div className="italic text-slate-800">{edu.degree} in {edu.fieldOfStudy}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8.5px] font-semibold text-slate-600">{edu.endDate}</div>
                    {edu.gpa && <div className="text-[8px] text-slate-500">GPA: {edu.gpa}</div>}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.databases || resumeData.skills.tools) && (
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3">Additional Skills</h2>
          <div className="grid grid-cols-1 gap-1 text-slate-800">
            {resumeData.skills.languages && <div><span className="font-bold">Languages:</span> {resumeData.skills.languages}</div>}
            {resumeData.skills.frameworks && <div><span className="font-bold">Frameworks:</span> {resumeData.skills.frameworks}</div>}
            {resumeData.skills.databases && <div><span className="font-bold">Databases:</span> {resumeData.skills.databases}</div>}
            {resumeData.skills.tools && <div><span className="font-bold">Tools:</span> {resumeData.skills.tools}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export function TechTemplate({ resumeData }: { resumeData: any }) {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-300 p-10 font-mono text-[9px] leading-relaxed border-l-4 border-emerald-400">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-400 mb-1">
          {resumeData.personalInfo.fullName || "user_name"}
        </h1>
        <h2 className="text-zinc-500 text-[10px]">
          &gt; {resumeData.experience[0]?.role || "software_engineer"}
        </h2>
        
        <div className="mt-4 flex flex-wrap gap-4 text-zinc-400 text-[8px]">
          {resumeData.personalInfo.email && <div><span className="text-emerald-500">email:</span> {resumeData.personalInfo.email}</div>}
          {resumeData.personalInfo.github && <div><span className="text-emerald-500">github:</span> {resumeData.personalInfo.github}</div>}
          {resumeData.personalInfo.linkedin && <div><span className="text-emerald-500">linkedin:</span> {resumeData.personalInfo.linkedin}</div>}
          {resumeData.personalInfo.website && <div><span className="text-emerald-500">website:</span> {resumeData.personalInfo.website}</div>}
        </div>
      </div>

      {resumeData.personalInfo.summary && (
        <div className="mb-6">
          <div className="text-emerald-400 font-bold mb-2">## about_me</div>
          <p className="text-justify border-l-2 border-zinc-800 pl-3 text-zinc-400">{resumeData.personalInfo.summary}</p>
        </div>
      )}

      {/* Skills */}
      {(resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.databases || resumeData.skills.tools) && (
        <div className="mb-6">
          <div className="text-emerald-400 font-bold mb-2">## core_skills</div>
          <div className="grid grid-cols-2 gap-2 text-[8px] text-zinc-400">
            {resumeData.skills.languages && <div><span className="text-emerald-500">['languages'] = </span> [{resumeData.skills.languages.split(',').map((s:string) => `'${s.trim()}'`).join(', ')}]</div>}
            {resumeData.skills.frameworks && <div><span className="text-emerald-500">['frameworks'] = </span> [{resumeData.skills.frameworks.split(',').map((s:string) => `'${s.trim()}'`).join(', ')}]</div>}
            {resumeData.skills.tools && <div><span className="text-emerald-500">['tools'] = </span> [{resumeData.skills.tools.split(',').map((s:string) => `'${s.trim()}'`).join(', ')}]</div>}
          </div>
        </div>
      )}

      {resumeData.experience.some((e: any) => e.company || e.role) && (
        <div className="mb-6">
          <div className="text-emerald-400 font-bold mb-3">## experience</div>
          <div className="space-y-4">
            {resumeData.experience.map((exp: any, i: number) => (
              (exp.company || exp.role) && (
                <div key={i}>
                  <div className="text-emerald-300 font-bold">const {exp.company.replace(/\s+/g, '')} = new Role('{exp.role}');</div>
                  <div className="text-zinc-500 text-[8px] mb-1">// {exp.startDate} – {exp.endDate} | {exp.location}</div>
                  {exp.description && (
                    <ul className="list-none space-y-0.5 text-zinc-400">
                      {(exp.description || "").split("\n").filter(Boolean).map((bullet: string, idx: number) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-zinc-600">-&gt;</span>
                          <span>{bullet.replace(/^[•\-\*\s]+/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {resumeData.projects.some((p: any) => p.title) && (
        <div className="mb-6">
          <div className="text-emerald-400 font-bold mb-3">## projects</div>
          <div className="space-y-3">
            {resumeData.projects.map((proj: any, i: number) => (
              proj.title && (
                <div key={i}>
                  <div className="flex justify-between text-zinc-200 font-bold">
                    <span>{proj.title}</span>
                    {proj.link && <span className="text-emerald-500 text-[8px]">{proj.link}</span>}
                  </div>
                  {proj.techStack && <div className="text-zinc-500 text-[8px] mb-1">[{proj.techStack}]</div>}
                  {proj.description && (
                    <p className="text-zinc-400 border-l border-zinc-800 pl-2">
                      {(proj.description || "").replace(/^[•\-\*\s]+/, "")}
                    </p>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
