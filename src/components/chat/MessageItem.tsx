'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import ThinkingIndicator from '../upload/ThinkingIndicator';
import ReportLink from '../upload/ReportLink';

export type MessageStatus = 'pending' | 'complete' | 'error';
export interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  status?: MessageStatus;
  reportId?: string;
}

export const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const { type, text, status, reportId } = message;
  const isUser = type === 'user';
  const containerClass = isUser ? 'justify-end' : 'justify-start';
  const bubbleClass = isUser
    ? 'bg-blue-600 text-white'
    : status === 'error'
    ? 'bg-red-800/90 border border-red-600/50 text-red-100'
    : 'bg-neutral-700 text-white';

  return (
    <div className={`mb-5 flex ${containerClass}`}>
      <div className={`rounded-xl py-2 px-3 max-w-[85%] shadow-md relative ${bubbleClass}`}>
        {!isUser && status === 'pending' ? (
          <ThinkingIndicator />
        ) : (
          <>
            <div className="prose prose-sm prose-invert max-w-none [&>p]:my-0 whitespace-pre-wrap break-words">
              <ReactMarkdown>
                {type === 'ai' && status === 'complete'
                  ? `**Analysis Summary:**\n\n${text}`
                  : text}
              </ReactMarkdown>
            </div>
            {reportId && status === 'complete' && <ReportLink reportId={reportId} />}
          </>
        )}
      </div>
    </div>
  );
}; 