import React from 'react';

export default function ChatWindow({ messages }) {
  return (
    <div className="chat-window">
      {messages.map((m,i) => (
        <div key={i}
             className={`chat-bubble ${m.user ? 'user' : 'bot'}`}>
          {m.text}
        </div>
      ))}
    </div>
  );
}