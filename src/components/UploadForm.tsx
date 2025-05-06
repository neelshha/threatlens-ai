'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import type { Message } from '../types/chat';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';
import { FiSend, FiPlusCircle } from 'react-icons/fi'; // Import icons

const MAX_HEIGHT = 160;

const generateId = () => Math.random().toString(36).substring(2, 9);

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

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const id = generateId();
    setMessages([
      { id: `${id}-user`, type: 'user', text: trimmed },
      { id: `${id}-ai`, type: 'ai', text: '', status: 'pending' }
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await axios.post<{ summary: string; reportId: string }>(
        '/api/parse',
        { content: trimmed },
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
    } catch (err: any) {
      let message = 'Unknown error.';
      if (axios.isCancel(err)) {
        message = 'Timed out after 15 seconds.';
      } else if (axios.isAxiosError(err)) {
        message = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === `${id}-ai`
            ? { ...m, text: `⚠️ Analysis Failed: ${message}`, status: 'error' }
            : m
        )
      );
      setInput(trimmed);
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
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <header className="bg-neutral-800 p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <button
          onClick={handleNewChat}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
        >
          <FiPlusCircle className="inline-block mr-2" /> New Chat
        </button>
      </header>
      <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-3xl mx-auto">
        <MessageList messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
      </main>
      <footer className="bg-neutral-800 p-4 sm:p-6 w-full max-w-3xl mx-auto border-t border-neutral-700">
        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="w-full bg-neutral-700 text-neutral-100 rounded-lg py-2 px-3 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none overflow-hidden"
            style={{ maxHeight: `${MAX_HEIGHT}px` }}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 transition-colors duration-200"
          >
            <FiSend className="text-lg" />
          </button>
        </div>
      </footer>
    </div>
  );
}