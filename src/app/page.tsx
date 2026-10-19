'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Meeting, BotPersona } from '@/types/meeting';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { AIChatbotWidget } from '@/components/AIChatbotWidget';
import {
  Play,
  Calendar,
  Clock,
  Plus,
  Video,
  Bot,
  Sparkles,
  FileText,
  RefreshCw,
  ExternalLink,
  Send,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [personas, setPersonas] = useState<BotPersona[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Dispatch Bar State
  const [quickUrl, setQuickUrl] = useState('');
  const [quickDispatching, setQuickDispatching] = useState(false);

  // Dispatch Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [instantLaunch, setInstantLaunch] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        fetch('/api/meetings'),
        fetch('/api/personas'),
      ]);
      const mData = await mRes.json();
      const pData = await pRes.json();

      if (mData.success) setMeetings(mData.meetings);
      if (pData.success) {
        setPersonas(pData.personas);
        if (pData.personas.length > 0 && !selectedPersonaId) {
          setSelectedPersonaId(pData.personas[0].id);
        }
      }
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;

    setQuickDispatching(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Quick Dispatch Session',
          meetingUrl: quickUrl,
          personaId: selectedPersonaId || (personas[0]?.id),
          instantLaunch: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQuickUrl('');
        fetchData();
      }
    } catch (err) {
      console.error('Quick dispatch error:', err);
    } finally {
      setQuickDispatching(false);
    }
  };

  const handleScheduleOrDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingUrl) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Scheduled Meeting Bot',
          meetingUrl,
          passcode,
          personaId: selectedPersonaId,
          scheduledTime: instantLaunch ? new Date().toISOString() : scheduledTime,
          instantLaunch,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setTitle('');
        setMeetingUrl('');
        setPasscode('');
        fetchData();
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualDispatch = async (meetingId: string) => {
    try {
      await fetch('/api/bot/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId }),
      });
      fetchData();
    } catch (e) {
      console.error('Manual dispatch error:', e);
    }
  };

  const activeCount = meetings.filter((m) =>
    ['joining', 'in_meeting', 'recording', 'processing'].includes(m.status)
  ).length;
  const completedCount = meetings.filter((m) => m.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Dispatch Bar */}
      <div className="relative glass-card p-8 rounded-3xl border border-indigo-500/20 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Eulr Autonomous Cloud Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Send AI Bots into <span className="text-gradient">Zoom, Meet & Teams</span>
              </h1>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">
                Dispatch virtual personas into meetings to stream pre-recorded video loops, take real-time notes, record audio, and generate AI action items.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] shrink-0"
            >
              <Plus className="w-4 h-4" />
              Schedule Bot Session
            </button>
          </div>

          {/* Quick URL Input Bar */}
          <form onSubmit={handleQuickDispatch} className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-2xl border border-indigo-500/30">
            <div className="pl-3 text-indigo-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <input
              type="url"
              placeholder="Paste Google Meet, Zoom, or Teams URL for instant bot dispatch..."
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none px-2"
              required
            />
            <button
              type="submit"
              disabled={quickDispatching || !quickUrl.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              {quickDispatching ? 'Dispatching...' : 'Instant Dispatch'}
            </button>
          </form>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 rounded-2xl border border-gray-800/80 glow-blue">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Bot Workers</span>
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{activeCount}</div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live WebRTC Bot Containers
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 rounded-2xl border border-gray-800/80">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Meetings</span>
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{meetings.length}</div>
          <p className="text-xs text-gray-400 mt-1">Scheduled or completed</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 rounded-2xl border border-gray-800/80 glow-purple">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Summaries Ready</span>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{completedCount}</div>
          <p className="text-xs text-purple-400 mt-1">Action Items & Transcripts</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 rounded-2xl border border-gray-800/80">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Virtual Personas</span>
            <Video className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{personas.length}</div>
          <p className="text-xs text-gray-400 mt-1">Camera/Mic Personas</p>
        </motion.div>
      </div>

      {/* Meetings Queue Table Section */}
      <div className="glass-card rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-800/80 flex items-center justify-between bg-slate-900/40">
          <h2 className="font-bold text-lg text-white flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            Meeting Session Queue
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 text-gray-300 transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 font-mono">Auto-sync active</span>
          </div>
        </div>

        {meetings.length === 0 ? (
          <div className="p-16 text-center text-gray-400 space-y-3">
            <Bot className="w-14 h-14 mx-auto text-indigo-400/50" />
            <p className="text-base font-medium text-gray-200">No meeting sessions active yet.</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Paste a Google Meet, Zoom, or Teams URL into the quick bar above to dispatch your first bot!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Meeting Session</th>
                  <th className="px-6 py-4">Bot Persona</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-base">{m.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <PlatformBadge platform={m.platform} />
                        <span className="text-xs font-mono text-gray-400 truncate max-w-xs">{m.meetingUrl}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200">{m.personaName}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {new Date(m.scheduledTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {['scheduled', 'failed'].includes(m.status) && (
                          <button
                            onClick={() => handleManualDispatch(m.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-medium transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Dispatch Now
                          </button>
                        )}

                        <Link
                          href={`/meetings/${m.id}`}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium transition-colors"
                        >
                          View Details & AI
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating AI Assistant Chatbot Widget */}
      <AIChatbotWidget />

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl border border-indigo-500/20 p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                Dispatch Cloud Meeting Bot
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleOrDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product Demo & Investor Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Meeting Join Link (Google Meet, Zoom, or Teams)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/... or https://zoom.us/j/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Passcode (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Select Virtual Persona
                  </label>
                  <select
                    value={selectedPersonaId}
                    onChange={(e) => setSelectedPersonaId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    {personas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={instantLaunch}
                    onChange={(e) => setInstantLaunch(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  Instant Launch (Dispatch Now)
                </label>
              </div>

              {!instantLaunch && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                    Scheduled Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
                >
                  {submitting ? 'Dispatching...' : instantLaunch ? 'Launch Bot Now' : 'Schedule Bot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
