import React from 'react';
import Link from 'next/link';
import { Bot, Users, Cpu, Sparkles, Activity } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 glass-card border-b border-indigo-500/10 px-6 py-3.5 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-gradient">EULR</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                CLOUD BOT 2.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Autonomous WebRTC Engine & AI Assistant</p>
          </div>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="text-gray-300 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-800/40 transition-all"
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            Dashboard
          </Link>

          <Link
            href="/personas"
            className="text-gray-400 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-800/40 transition-all"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Bot Personas
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            Workers Online
          </div>
        </div>
      </div>
    </nav>
  );
}
