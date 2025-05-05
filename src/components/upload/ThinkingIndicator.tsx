'use client';

import React from 'react';

const ThinkingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1.5 p-1">
    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
  </div>
);

export default ThinkingIndicator; 