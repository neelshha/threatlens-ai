'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import type { Message } from '../types/chat';
import MessageList from './chat/MessageList';
import ChatInput from './chat/ChatInput'; // Ensure the path is correct
import { FiPlusCircle } from 'react-icons/fi'; // You might not need this here anymore

const MAX_HEIGHT = 160;

const generateId = () => Math.random().toString(36).slice(2, 9);

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null); // Match the ref type in ChatInput
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const autoResizeTextarea = useCallback(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
    }
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [inputValue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = useCallback(async () => {
    const messageText = inputValue.trim();
    if (!messageText || isGeneratingResponse) return;

    const messageId = generateId();
    const newUserMessage: Message = { id: `${messageId}-user`, type: 'user', text: messageText };
    const newAiMessage: Message = { id: `${messageId}-ai`, type: 'ai', text: '', status: 'pending' };

    setChatMessages((prevMessages) => [...prevMessages, newUserMessage, newAiMessage]);
    setInputValue('');
    setIsGeneratingResponse(true);

    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 15000);

      const response = await axios.post<{ summary: string; reportId: string }>(
        '/api/parse',
        { content: messageText },
        { signal: abortController.signal }
      );

      clearTimeout(timeoutId);

      const { summary, reportId } = response.data;
      setChatMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === `${messageId}-ai`
            ? { ...msg, text: summary, status: 'complete', reportId }
            : msg
        )
      );
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred.';
      if (axios.isCancel(error)) {
        errorMessage = 'Request timed out after 15 seconds.';
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setChatMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === `${messageId}-ai`
            ? { ...msg, text: `⚠️ Analysis Failed: ${errorMessage}`, status: 'error' }
            : msg
        )
      );
      setInputValue(messageText);
      autoResizeTextarea();
    } finally {
      setIsGeneratingResponse(false);
    }
  }, [inputValue, isGeneratingResponse, autoResizeTextarea]);

  const handleEnterKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setChatMessages([]);
    setInputValue('');
    setIsGeneratingResponse(false);
    autoResizeTextarea();
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <header className="bg-neutral-800 p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold">AI Chat</h1>
        <button
          onClick={startNewChat}
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
        >
          {/* You might want to use the Plus icon from lucide-react here for consistency */}
          <FiPlusCircle className="inline-block mr-2" /> New Chat
        </button>
      </header>
      <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-3xl mx-auto">
        <MessageList messages={chatMessages} isLoading={isGeneratingResponse} messagesEndRef={messagesEndRef} />
      </main>
      <footer className="bg-neutral-800 p-4 sm:p-6 w-full max-w-3xl mx-auto border-t border-neutral-700">
        <ChatInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleEnterKey}
          onSubmit={handleSendMessage}
          onNewChat={startNewChat}
          disabled={isGeneratingResponse}
          textareaRef={inputRef}
          maxHeight={MAX_HEIGHT}
        />
      </footer>
    </div>
  );
}