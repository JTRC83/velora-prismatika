import React from 'react';

export default function ChatBubble({ text, isUser }) {
  return (
    <div className={`max-w-xs p-3 my-2 rounded-xl ${
      isUser ? 'bg-green-200 self-end' : 'bg-amber-200 self-start'
    }`}>
      <p className="text-sm">{text}</p>
    </div>
  );
}