'use client';

import React from 'react';
import { Plus, Command, CornerDownLeft, Loader2, Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onNewChat: () => void;
  disabled: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  maxHeight: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onKeyDown,
  onSubmit,
  onNewChat,
  disabled,
  textareaRef,
  maxHeight,
}) => (
  <div className="w-full px-4 pb-4 sticky bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent z-10">
    <div className="w-full max-w-5xl mx-auto flex items-end gap-2 p-2 bg-neutral-800 rounded-xl shadow-lg border border-neutral-700/50">
      <textarea
        ref={textareaRef}
        className="flex-grow bg-transparent text-neutral-200 placeholder:text-neutral-500 resize-none border-none focus:outline-none text-sm px-3 py-2 min-h-[40px]"
        placeholder="Paste report content here..."
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        style={{ maxHeight: `${maxHeight}px` }}
        disabled={disabled}
      />
      <button
        onClick={onNewChat}
        className="p-2 rounded-lg text-neutral-400 bg-neutral-700/60 hover:bg-neutral-700 hover:text-neutral-300 disabled:opacity-50"
        disabled={disabled}
        aria-label="New Chat"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-neutral-200 bg-neutral-700/80 hover:bg-neutral-700 disabled:opacity-50"
        aria-label="Send"
      >
        {disabled ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : value.trim() ? (
          <>
            Run <Command className="w-4 h-4 opacity-80" /> <CornerDownLeft className="w-4 h-4 opacity-80" />
          </>
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  </div>
);

export default ChatInput; 