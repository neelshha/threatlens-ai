'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Plus, Command, CornerDownLeft, Loader2, ExternalLink, Send, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

const MAX_HEIGHT = 160;
type MessageStatus = 'pending' | 'complete' | 'error';
interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  status?: MessageStatus;
  reportId?: string;
}
const generateId = () => Math.random().toString(36).substring(2, 9);

const ThinkingIndicator = () => (
  <div className="flex items-center space-x-1.5 p-1">
    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
  </div>
);

const WelcomeMessage = () => (
  <div className="text-center py-10 px-4 text-neutral-500 flex flex-col items-center">
    <FileText className="w-12 h-12 text-neutral-600 mb-4" />
    <p className="text-lg font-medium text-neutral-300 mb-2">Ready to Analyze</p>
    <p className="text-sm max-w-md">
      Paste the content of a threat intelligence report below. I'll extract the title, summary, IOCs, and MITRE ATT&CK techniques.
    </p>
    <p className="text-xs mt-4">Use Run (⌘+⏎) to start the analysis.</p>
  </div>
);

const ReportLink = ({ reportId }: { reportId: string }) => (
  <Link
    href={`/dashboard/${reportId}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline mt-3 font-medium group"
  >
    View Full Report
    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
  </Link>
);

export default function UploadForm() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
    }
  }, []);

  useEffect(() => resizeTextarea(), [input]);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleSubmit = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const id = generateId();
    setMessages([
      { id: `${id}-user`, type: 'user', text: trimmedInput },
      { id: `${id}-ai`, type: 'ai', text: '', status: 'pending' }
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await axios.post<{ summary: string; reportId: string }>(
        '/api/parse',
        { content: trimmedInput },
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      const { summary, reportId } = res.data;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === `${id}-ai`
            ? { ...m, text: summary, status: 'complete', reportId }
            : m
        )
      );
    } catch (error) {
      let errorText = 'Unknown error.';
      if (axios.isCancel(error)) {
        errorText = 'Timed out after 15 seconds.';
      } else if (axios.isAxiosError(error)) {
        errorText = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorText = error.message;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === `${id}-ai`
            ? { ...m, text: `⚠️ Analysis Failed: ${errorText}`, status: 'error' }
            : m
        )
      );
      setInput(trimmedInput);
      resizeTextarea();
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, resizeTextarea]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
    resizeTextarea();
  };

  return (
    <section className="min-h-screen flex flex-col bg-neutral-950 text-white">
      <div className="flex-grow overflow-y-auto px-4 pt-6 pb-28 w-full max-w-5xl mx-auto relative">
        {messages.length === 0 && !isLoading ? (
          <WelcomeMessage />
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`mb-5 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-xl py-2 px-3 max-w-[85%] shadow-md relative ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.status === 'error'
                    ? 'bg-red-800/90 border border-red-600/50 text-red-100'
                    : 'bg-neutral-700 text-white'
                }`}
              >
                {msg.type === 'ai' && msg.status === 'pending' ? (
                  <ThinkingIndicator />
                ) : (
                  <>
                    <ReactMarkdown
  {...{
    children:
      msg.type === 'ai' && msg.status === 'complete'
        ? `**Analysis Summary:**\n\n${msg.text}`
        : msg.text,
    className: "prose prose-sm prose-invert max-w-none [&>p]:my-0 whitespace-pre-wrap break-words"
  }}
/>
                    {msg.reportId && msg.status === 'complete' && <ReportLink reportId={msg.reportId} />}
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full px-4 pb-4 sticky bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent z-10">
        <div className="w-full max-w-5xl mx-auto flex items-end gap-2 p-2 bg-neutral-800 rounded-xl shadow-lg border border-neutral-700/50">
          <textarea
            ref={textareaRef}
            className="flex-grow bg-transparent text-neutral-200 placeholder:text-neutral-500 resize-none border-none focus:outline-none text-sm px-3 py-2 min-h-[40px]"
            placeholder="Paste report content here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
            disabled={isLoading}
          />
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg text-neutral-400 bg-neutral-700/60 hover:bg-neutral-700 hover:text-neutral-300 disabled:opacity-50"
            disabled={isLoading}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-neutral-200 bg-neutral-700/80 hover:bg-neutral-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : input.trim() ? (
              <>
                Run <Command className="w-4 h-4 opacity-80" /> <CornerDownLeft className="w-4 h-4 opacity-80" />
              </>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}