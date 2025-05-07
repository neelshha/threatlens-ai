'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import type { Message } from '../types/chat';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';
import Image from 'next/image';
import tLogo from '/public/tLens.jpg';

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
    <div className="min-h-screen flex flex-col bg-[#020a18] text-[#ffffff]">
      <div className="flex-grow overflow-y-auto px-4 pt-16 pb-10 w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
        {messages.length === 0 ? (
          <div className="mb-12">
            <Image
              src={tLogo}
              alt="ThreatLens AI Logo"
              width={96}
              height={96}
              className="mx-auto mb-6 rounded-lg"
            />
            <h1 className="text-3xl font-bold mb-4 text-[#ffffff]">ThreatLens AI</h1>
            <h2 className="text-xl text-[#a0a0ff] mb-6">Ready to Analyze Threat Intelligence Reports</h2>
            <p className="text-lg text-[#c0c0ff] mb-8">
              Paste the content of a threat intelligence report below to extract valuable insights.
            </p>
            <p className="text-sm text-[#7681f7]">
              Use <kbd className="font-mono bg-[#3942f2] text-white px-1 rounded">Ctrl</kbd> + <kbd className="font-mono bg-[#3942f2] text-white px-1 rounded">Enter</kbd> to analyze.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <MessageList messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-[#020a18] p-4">
        <div className="max-w-[90%] mx-auto flex items-center">
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            onNewChat={handleNewChat}
            disabled={isLoading}
            textareaRef={textareaRef}
            maxHeight={MAX_HEIGHT}
            placeholder="Paste report content here..."
          />
        </div>
        <p className="mt-2 text-xs text-[#7681f7] text-center">
          Made by <a href="https://neelshha.com" target="_blank" rel="noopener noreferrer" className="text-[#a0a0ff] hover:underline">Neel Shah</a>
        </p>
      </div>
    </div>
  );
}