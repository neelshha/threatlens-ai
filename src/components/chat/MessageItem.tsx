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

  return (
    <div className={`w-full flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative px-4 py-2 max-w-[80%] text-sm rounded-2xl shadow ${
          isUser
            ? 'bg-[#3942f2] text-white rounded-br-none'
            : status === 'error'
            ? 'bg-red-800/90 text-red-100 border border-red-600/50 rounded-bl-none'
            : 'bg-neutral-700 text-white rounded-bl-none'
        }`}
      >
        {!isUser && status === 'pending' ? (
          <ThinkingIndicator />
        ) : (
          <>
            <div className="whitespace-pre-wrap break-words">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="my-1" {...props} />,
                }}
              >
                {type === 'ai' && status === 'complete'
                  ? `**Analysis Summary:**\n\n${text}`
                  : text}
              </ReactMarkdown>
            </div>
            {reportId && status === 'complete' && (
              <div className="mt-2">
                <ReportLink reportId={reportId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};