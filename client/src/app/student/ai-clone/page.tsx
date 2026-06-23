"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIClonePage() {
  const { user } = useAuth();
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

  // Test Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchCloneData();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchCloneData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/clone/${user?.uid}`);
      const data = await res.json();
      if (data.success && data.data) {
        setKnowledgeBase(data.data.knowledgeBase || "");
        setIsActive(data.data.isActive || false);
      }
    } catch (err) {
      console.error("Failed to fetch clone data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/clone/train/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knowledgeBase, isActive })
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage("AI Clone trained successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to train clone.");
      }
    } catch (err) {
      setSaveMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", user.uid);

    try {
      const res = await fetch(`${API_BASE_URL}/api/resume/parse-enhancer`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.data) {
        const pd = data.data;
        const formatted = `Personal Info:
Name: ${pd.personalInfo?.fullName || ''}
Summary: ${pd.personalInfo?.summary || ''}

Experience:
${pd.experience?.map((exp: any) => `- ${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n  ${exp.description}`).join('\n') || ''}

Projects:
${pd.projects?.map((p: any) => `- ${p.title} (${p.techStack})\n  ${p.description}`).join('\n') || ''}

Education:
${pd.education?.map((ed: any) => `- ${ed.degree} in ${ed.fieldOfStudy} at ${ed.institution}`).join('\n') || ''}

Skills:
${[...(pd.skills?.languages || []), ...(pd.skills?.frameworks || []), ...(pd.skills?.databases || []), ...(pd.skills?.tools || [])].join(', ')}
`;
        setKnowledgeBase(prev => prev + (prev ? '\n\n---\n\n' : '') + formatted.trim());
      }
    } catch (err) {
      console.error(err);
      alert("Failed to parse resume.");
    } finally {
      setUploadingResume(false);
      e.target.value = "";
    }
  };

  const handleTestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setChatLoading(true);

    try {
      // We'll reuse the recruiter endpoint for testing, but pass our own studentId
      const res = await fetch(`${API_BASE_URL}/api/recruiter/clone-chat/${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          knowledgeBaseOverride: knowledgeBase,
          isActiveOverride: isActive
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'model', content: data.reply || data.error }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: "Failed to connect to clone." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading your clone data...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <i className="fa-solid fa-robot text-indigo-500"></i> AI Student Clone
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Train your personalized AI clone. Recruiters can interact with this clone to evaluate your skills, experience, and cultural fit even when you're offline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Training Data */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-[700px]">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Training Knowledge Base</h2>
          <p className="text-xs text-zinc-500 mb-4">
            Paste your resume, project details, behavioral examples, and technical skills here. The AI will use ONLY this information to answer recruiter questions.
          </p>

          <textarea
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
            placeholder="E.g., I am a Software Engineering student at XYZ University. I have built a React dashboard..."
            className="flex-1 w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar"
          />

          <div className="flex items-center justify-between mt-3 mb-4">
            <span className="text-xs text-zinc-500 font-medium">Or auto-fill from your resume:</span>
            <label className={`cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${uploadingResume ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingResume ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-arrow-up"></i>}
              {uploadingResume ? "Parsing..." : "Upload PDF/DOCX"}
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} disabled={uploadingResume} />
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500"></div>
                <span className="ml-3 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  {isActive ? 'Clone Active (Visible to Recruiters)' : 'Clone Paused'}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              {saveMessage && <span className="text-xs font-medium text-emerald-500 animate-pulse">{saveMessage}</span>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
              >
                {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-brain"></i>}
                Train Clone
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Test Chat */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col h-[700px]">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
            <i className="fa-regular fa-comment-dots"></i> Test Your Clone
          </h2>
          <p className="text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            Chat with your clone to see how it responds to recruiters based on the training data.
          </p>

          <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm">
                <i className="fa-solid fa-robot text-3xl mb-3 opacity-50"></i>
                <p>No messages yet. Say hello to your clone!</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/20' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-tl-sm border border-zinc-200 dark:border-zinc-700'
                  }`}>
                    <div className="[&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>li]:mb-1 [&>h3]:font-bold [&>h3]:mb-2 [&>strong]:font-bold [&>em]:italic break-words">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-zinc-200 dark:border-zinc-700">
                  <i className="fa-solid fa-ellipsis fa-fade text-zinc-500"></i>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleTestChat} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your clone a question..."
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={chatLoading || !isActive}
            />
            <button 
              type="submit" 
              disabled={chatLoading || !isActive}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
          {!isActive && (
            <p className="text-[10px] text-rose-500 mt-2 text-center">Activate your clone to test it.</p>
          )}
        </div>
      </div>
    </div>
  );
}
