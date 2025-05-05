'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import type { Message } from '../types/chat';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput';

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
    <section className="min-h-screen flex flex-col bg-neutral-950 text-white">
      <div className="flex-grow overflow-y-auto px-4 pt-6 pb-28 w-full max-w-5xl mx-auto relative">
        <MessageList messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
      </div>

      <ChatInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        onNewChat={handleNewChat}
        disabled={isLoading}
        textareaRef={textareaRef}
        maxHeight={MAX_HEIGHT}
      />
    </section>
  );
}