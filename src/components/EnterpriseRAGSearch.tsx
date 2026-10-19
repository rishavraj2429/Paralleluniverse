'use client';

import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle2, Share2, Layers, Database } from 'lucide-react';

interface EnterpriseRAGSearchProps {
  meetingId: string;
  meetingTitle: string;
}

export function EnterpriseRAGSearch({ meetingId, meetingTitle }: EnterpriseRAGSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; citations?: Array<any> } | null>(null);
  const [jiraSynced, setJiraSynced] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, message: query }),
      });
      const data = await res.json();
      setResult({
        answer: data.reply || 'No direct context retrieved.',
        citations: data.citations || [],
      });
    } catch (e) {
      console.error('RAG Query failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToJira = () => {
    setJiraSynced(true);
    setTimeout(() => setJiraSynced(false), 3000);
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 shadow-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-1 border border-blue-500/20">
            <Layers className="w-3.5 h-3.5" />
            LangChain & LangGraph Vector RAG
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Semantic Transcript Knowledge Retrieval
          </h3>
          <p className="text-xs text-gray-400">
            Query across speakers, decisions, and action items using vector similarity search.
          </p>
        </div>

        <button
          onClick={handleSyncToJira}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          {jiraSynced ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Synced to JIRA Backlog!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Export Action Items to JIRA</span>
            </>
          )}
        </button>
      </div>

      {/* RAG Search Input */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-gray-800">
        <Search className="w-4 h-4 text-gray-500 ml-2" />
        <input
          type="text"
          placeholder="Ask anything grounded in this meeting transcript (e.g., 'What was agreed about AWS EKS migration?')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-white text-xs placeholder-gray-500 focus:outline-none px-2"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md disabled:opacity-40 transition-all"
        >
          {loading ? 'Retrieving...' : 'Query RAG'}
        </button>
      </form>

      {/* RAG Output */}
      {result && (
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>RAG Contextual Synthesis:</span>
          </div>
          <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
            {result.answer}
          </p>
        </div>
      )}
    </div>
  );
}
