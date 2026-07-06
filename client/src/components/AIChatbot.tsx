"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIChatbot() {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', content: "Hi there! I am your AI Twin. Ask me anything about your placements, mock interviews, or resume improvement tips." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const openChat = () => setIsChatOpen(true);
    window.addEventListener('openAITwin', openChat);
    return () => {
      window.removeEventListener('openAITwin', openChat);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending) return;

    const userMessage: Message = { role: 'user', content: inputVal };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setInputVal("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, uid: user?.uid }),
      });
      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', content: "Failed to connect to the backend server." }]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isChatOpen) return null;

  if (typeof document === 'undefined') return null;

  return require('react-dom').createPortal(
    <>
      <div onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[100]" />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-[101] flex flex-col shadow-2xl animate-in slide-in-from-right duration-350">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
              <i className="fa-solid fa-terminal w-4 h-4 text-zinc-700 dark:text-zinc-300"></i>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                CareerPilot AI Assistant
              </h3>
              <p className="text-xs text-zinc-500">Placement & Academic Guidance</p>
            </div>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md text-zinc-500 transition-colors">
            <i className="fa-solid fa-xmark w-4 h-4"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-50 border border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200'}`}>
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg px-4 py-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex gap-2">
          <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="Type a command or question..." className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-white" />
          <button type="submit" disabled={!inputVal.trim() || isSending} className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-md disabled:opacity-50 transition-colors">
            Send
          </button>
        </form>
      </div>
    </>,
    document.body
  );
}
