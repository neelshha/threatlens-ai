'use client';

import React from 'react';
import WelcomeMessage from '../upload/WelcomeMessage';
import { MessageItem } from './MessageItem';
import type { Message } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, messagesEndRef }) => {
  if (messages.length === 0 && !isLoading) {
    return <WelcomeMessage />;
  }
  return (
    <>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};

export default MessageList; 