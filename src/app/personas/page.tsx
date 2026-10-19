'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BotPersona } from '@/types/meeting';
import {
  Users,
  Plus,
  Video,
  Mic,
  MicOff,
  VideoOff,
  UserCheck,
  Bot,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<BotPersona[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [videoFeedUrl, setVideoFeedUrl] = useState('');
  const [audioFeedUrl, setAudioFeedUrl] = useState('');
  const [muteOnJoin, setMuteOnJoin] = useState(false);
  const [hideVideoOnJoin, setHideVideoOnJoin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPersonas = async () => {
    try {
      const res = await fetch('/api/personas');
      const data = await res.json();
      if (data.success) setPersonas(data.personas);
    } catch (e) {
      console.error('Error loading personas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleCreatePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          videoFeedUrl,
          audioFeedUrl,
          muteOnJoin,
          hideVideoOnJoin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setVideoFeedUrl('');
        setAudioFeedUrl('');
        fetchPersonas();
      }
    } catch (err) {
      console.error('Submit persona error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-8 rounded-3xl border border-indigo-500/20 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Virtual Identity Manager
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Bot Identities & <span className="text-gradient">Virtual Webcam Feeds</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Configure how your autonomous bot presents itself in Zoom, Google Meet, and MS Teams calls. Upload prerecorded MP4/Y4M video loops to stream as virtual camera feeds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Virtual Persona
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((p) => (
          <motion.div
            whileHover={{ y: -4 }}
            key={p.id}
            className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4 shadow-xl hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                {p.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{p.name}</h3>
                <p className="text-xs text-gray-400">{p.email || 'No email associated'}</p>
              </div>
            </div>

            <div className="border-t border-gray-800/80 pt-4 space-y-2.5 text-xs text-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Microphone Default:</span>
                <span className="flex items-center gap-1 font-semibold text-gray-200">
                  {p.muteOnJoin ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      Muted on Join
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      Unmuted (Live Audio)
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Camera Stream:</span>
                <span className="flex items-center gap-1 font-semibold text-gray-200">
                  {p.hideVideoOnJoin ? (
                    <>
                      <VideoOff className="w-3.5 h-3.5 text-amber-400" />
                      Video Off
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      Active Video Feed
                    </>
                  )}
                </span>
              </div>

              {p.videoFeedUrl && (
                <div className="pt-2 bg-slate-950/60 p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Video Stream File:</span>
                  <span className="font-mono text-indigo-300 block truncate mt-0.5 text-xs">{p.videoFeedUrl}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Persona Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl border border-indigo-500/20 p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                Create Virtual Persona
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePersona} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Display Name in Meeting
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peter Solimine (Eulr Bot)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Associated Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="peter@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">
                  Prerecorded Webcam Loop Path / Y4M File
                </label>
                <input
                  type="text"
                  placeholder="e.g. /media/video_loop.y4m"
                  value={videoFeedUrl}
                  onChange={(e) => setVideoFeedUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={muteOnJoin}
                    onChange={(e) => setMuteOnJoin(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  Mute microphone automatically on join
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideVideoOnJoin}
                    onChange={(e) => setHideVideoOnJoin(e.target.checked)}
                    className="rounded border-gray-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  Turn off camera feed on join
                </label>
              </div>

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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
                >
                  {submitting ? 'Saving...' : 'Create Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
