import React from 'react';
import ChatBubble from './ChatBubble';

export default function ChatWindow({ messages }) {
  return (
    <div className="flex flex-col p-4 overflow-y-auto h-full space-y-2">
      {messages.map((msg, i) => (
        <ChatBubble key={i} text={msg.text} isUser={msg.user} />
      ))}
    </div>
  );
}