"use client";

import { useState } from "react";


export default function AdminAiUsage() {
  const [totalTokens] = useState("12.4M");
  const [averageResponseTime] = useState("840ms");
  const [activeModel] = useState("GPT-4o Mini (Default)");
  const [activeAgents] = useState(14);

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Hub Usage & Telemetry</h1>
        <p className="text-zinc-555 dark:text-zinc-400 mt-1">Audit token billing pools, coordinate active LLM gateway routers, and trace response latency.</p>
      </header>

      {/* Grid of basic usage stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Tokens Billed</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{totalTokens}</span>
            <span className="text-xs font-bold text-emerald-500">Normal</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avg Gateway Latency</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{averageResponseTime}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Optimal</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Core Routing Model</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white truncate max-w-full block">{activeModel}</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Agent Threads</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{activeAgents}</span>
            <span className="text-xs font-bold text-rose-500 animate-pulse">Running</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Model distribution */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-chart-column w-5 h-5 text-rose-555" ></i>
              Gateway Router Traffic Share (By Core Models)
            </h3>
            <span className="text-xs text-zinc-400 font-bold uppercase">Token based</span>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-350">GPT-4o Mini (Speed Optimized)</span>
                <span className="text-rose-500 font-black">68%</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-rose-550 to-red-500 h-full rounded-full" style={{ width: "68%" }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-355">Claude 3.5 Sonnet (Logic Heavy)</span>
                <span className="text-orange-500 font-black">22%</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" style={{ width: "22%" }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-700 dark:text-zinc-355">Llama-3-70b-Instruct (Self Hosted Fallback)</span>
                <span className="text-amber-500 font-black">10%</span>
              </div>
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-full" style={{ width: "10%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Specs */}
        <div className="lg:col-span-4 glass-panel p-8 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-microchip w-5 h-5 text-rose-550" ></i>
            Infrastructure Info
          </h3>

          <div className="space-y-4 text-xs font-semibold text-zinc-550 dark:text-zinc-400">
            <div className="flex justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-2.5">
              <span>Pinecone Index Status</span>
              <span className="text-emerald-500">Ready</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-2.5">
              <span>Embedding Vector Dimension</span>
              <span className="text-zinc-900 dark:text-white">1536</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-2.5">
              <span>LLM Timeout Window</span>
              <span className="text-zinc-900 dark:text-white">30s limit</span>
            </div>
            <div className="flex justify-between">
              <span>Active RAG Cache Hit Rate</span>
              <span className="text-emerald-500">89.4%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
