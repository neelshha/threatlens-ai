'use client';

import React, { useEffect } from 'react';
import { Plus, Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onNewChat: () => void;
  disabled: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  maxHeight: number;
  placeholder?: string;
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
  placeholder = 'Paste report content here...',
}) => {
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }
  }, [value, maxHeight, textareaRef]);

  return (
    <div className="w-full px-4 pb-6 sticky bottom-0 bg-[#020a18] z-10">
  <div className="max-w-4xl mx-auto relative border border-[#3942f2] bg-[#0e1629] rounded-[28px] px-4 pt-3 pb-[52px]">

    {/* Textarea that grows */}
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      rows={1}
      className="w-full resize-none bg-transparent text-white placeholder:text-[#8c9eff] border-none focus:outline-none text-base leading-snug max-h-[200px] overflow-y-auto
           scrollbar-thin scrollbar-thumb-[#3942f2]/40 scrollbar-track-transparent hover:scrollbar-thumb-[#3942f2] scrollbar-thumb-rounded-full pr-[30px] pl-[30px]"
      style={{ lineHeight: '1.5' }}
    />

    {/* Button Row — pinned to bottom */}
    <div className="absolute left-0 right-0 bottom-0 px-4 pb-3 flex items-end justify-between">

      {/* + Button with tooltip */}
      <div className="relative group">
        <button
          onClick={onNewChat}
          disabled={disabled}
          aria-label="New Chat"
          className="text-[#a0aaff] hover:text-white transition disabled:opacity-40 w-[32px] h-[32px] flex items-center justify-center"
        >
          <Plus className="w-[18px] h-[18px]" />
        </button>
        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-[#3942f2] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          New Chat
        </div>
      </div>

      {/* Send Button with tooltip */}
      <div className="relative group">
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Send"
          className="text-[#3942f2] hover:text-white transition disabled:opacity-40 w-[32px] h-[32px] flex items-center justify-center"
        >
          <Send className="w-[18px] h-[18px]" />
        </button>
        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-[#3942f2] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          Analyse
        </div>
      </div>

    </div>
  </div>
</div>
  );
};

export default ChatInput;