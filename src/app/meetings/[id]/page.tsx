'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Meeting, ActionItem } from '@/types/meeting';
import { PlatformBadge } from '@/components/PlatformBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { AIChatbotWidget } from '@/components/AIChatbotWidget';
import {
  ArrowLeft,
  Bot,
  CheckSquare,
  FileText,
  ListOrdered,
  Sparkles,
  Terminal,
  Clock,
  UserCheck,
  Video,
  Play,
  Mail,
  Copy,
  Check,
  Search,
  Activity,
  Maximize2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'copilot' | 'logs'>('summary');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`);
      const data = await res.json();
      if (data.success) {
        setMeeting(data.meeting);
        if (data.meeting.summary?.actionItems) {
          setActionItems(data.meeting.summary.actionItems);
        }
      }
    } catch (e) {
      console.error('Error fetching meeting:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
    const interval = setInterval(fetchMeeting, 3000);
    return () => clearInterval(interval);
  }, [meetingId]);

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCopyEmail = () => {
    if (!meeting) return;
    const summaryText = meeting.summary?.executiveSummary || 'Meeting review and action items.';
    const decisions = meeting.summary?.keyDecisions.map((d) => `• ${d}`).join('\n') || '';

    const emailDraft = `Subject: Recap: ${meeting.title}\n\nHi Team,\n\nHere is the executive briefing from our meeting:\n\n${summaryText}\n\nKey Decisions:\n${decisions}\n\nBest regards,\n${meeting.personaName}`;

    navigator.clipboard.writeText(emailDraft);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-400 space-y-3">
        <Bot className="w-10 h-10 animate-bounce mx-auto text-indigo-400" />
        <p className="text-sm font-medium">Loading AI Meeting Intelligence Workspace...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-16 text-center text-gray-400 space-y-3">
        <p className="text-base">Meeting session not found.</p>
        <Link href="/" className="text-indigo-400 underline text-sm inline-block">
          Return to Control Center
        </Link>
      </div>
    );
  }

  const filteredTranscript = meeting.transcript?.filter(
    (u) =>
      u.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Meeting Header */}
      <div className="glass-card p-7 rounded-3xl border border-indigo-500/20 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{meeting.title}</h1>
              <PlatformBadge platform={meeting.platform} />
              <StatusBadge status={meeting.status} />
            </div>
            <p className="text-xs font-mono text-indigo-300/80">{meeting.meetingUrl}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all shadow-md"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Email Copied!</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Copy Follow-up Email
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block">Bot Persona</span>
            <span className="text-gray-200 font-semibold text-sm flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              {meeting.personaName}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block">Scheduled Time</span>
            <span className="text-gray-200 font-semibold text-sm flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-blue-400" />
              {new Date(meeting.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block">Passcode</span>
            <span className="text-gray-200 font-mono text-sm mt-0.5 block">{meeting.passcode || 'None'}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-gray-800">
            <span className="text-gray-500 block">Audio Stream</span>
            <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5 mt-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              Live Recorded Stream
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'summary'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Intelligence Summary
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'transcript'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Transcript ({meeting.transcript?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'copilot'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-400" />
          Ask Meeting AI Copilot
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'logs'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Playwright Console Logs ({meeting.logs.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {meeting.summary ? (
            <>
              {/* Executive Briefing Card */}
              <div className="glass-card p-7 rounded-3xl border border-indigo-500/20 space-y-3 shadow-xl">
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Executive Briefing
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-normal">
                  {meeting.summary.executiveSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Action Items */}
                <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    Action Items & Deliverables
                  </h3>
                  <div className="space-y-3">
                    {actionItems.map((item) => (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        key={item.id}
                        onClick={() => toggleActionItem(item.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          item.completed
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-gray-400 line-through'
                            : 'bg-slate-950/70 border-gray-800 text-gray-200 hover:border-indigo-500/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-gray-700 bg-slate-950 text-emerald-500 focus:ring-emerald-400"
                        />
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-sm">{item.task}</p>
                          {item.assignee && (
                            <span className="text-gray-400 block mt-1">
                              Owner: <strong className="text-indigo-300">{item.assignee}</strong>
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Key Decisions */}
                <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-indigo-400" />
                    Key Decisions & Agreements
                  </h3>
                  <ul className="space-y-2.5 text-sm text-gray-300">
                    {meeting.summary.keyDecisions.map((decision, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-gray-800">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Topics Timeline */}
              <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Meeting Agenda & Timeline
                </h3>
                <div className="space-y-3">
                  {meeting.summary.topics.map((t, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/60 border border-gray-800">
                      <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-400 font-mono text-xs font-bold shrink-0">
                        {t.timeOffset}
                      </span>
                      <div>
                        <h4 className="font-semibold text-sm text-white">{t.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-16 text-center text-gray-400 rounded-3xl border border-gray-800 space-y-2">
              <Sparkles className="w-10 h-10 mx-auto text-indigo-400 animate-pulse" />
              <p className="text-base font-semibold text-white">AI Intelligence Processing...</p>
              <p className="text-xs text-gray-500">Generating transcript, action items, and executive summary.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transcript' && (
        <div className="glass-card p-7 rounded-3xl border border-gray-800 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Synchronized Speech-To-Text Transcript
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {filteredTranscript?.length === 0 ? (
            <p className="text-sm text-gray-500 italic py-6">No matching transcript items found.</p>
          ) : (
            <div className="space-y-3">
              {filteredTranscript?.map((u) => (
                <div key={u.id} className="p-4 rounded-2xl bg-slate-950/70 border border-gray-800/80 flex items-start gap-4 hover:border-indigo-500/30 transition-colors">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-gray-400 font-mono text-xs shrink-0 font-medium">
                    {u.timestamp}
                  </span>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-400 block">{u.speaker}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{u.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'copilot' && (
        <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 shadow-2xl space-y-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            Interactive AI Copilot (Contextual Session Q&A)
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Ask AI anything about **{meeting.title}** — extract key takeaways, generate custom emails, or filter speaker responses!
          </p>
          <AIChatbotWidget meetingId={meeting.id} embedded={true} />
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass-card p-7 rounded-3xl border border-gray-800 space-y-4 shadow-2xl">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Playwright & Chromium Real-time Console Log
          </h3>

          <div className="bg-slate-950 p-5 rounded-2xl font-mono text-xs text-emerald-400 space-y-2 border border-gray-800 max-h-96 overflow-y-auto">
            {meeting.logs.map((logLine, idx) => (
              <div key={idx} className="leading-relaxed">
                {logLine}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
