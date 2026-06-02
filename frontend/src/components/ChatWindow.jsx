import React from 'react';

export default function ChatWindow({ messages }) {
  return (
    <div className="chat-window">
      {messages.map((m,i) => (
        <div key={i}
             className={`chat-bubble ${m.user ? 'user' : 'bot'}`}>
          <div className="chat-text">{m.text}</div>
          {!m.user && m.reflejo && (
            <div className="chat-reflection">{m.reflejo}</div>
          )}
          {!m.user && m.sources?.length > 0 && (
            <div className="chat-sources">
              Fuentes: {m.sources.map(source => source.relative_path).join(", ")}
            </div>
          )}
          {!m.user && m.error && (
            <div className="chat-error">{m.error}</div>
          )}
        </div>
      ))}
    </div>
  );
}
