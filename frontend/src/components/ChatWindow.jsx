import React from 'react';

export default function ChatWindow({ messages }) {
  return (
    <div className="chat-window">
      {messages.map((m,i) => (
        <div key={i}
             className={`chat-bubble ${m.user ? 'user' : 'bot'}`}>
          <div className="chat-text">{m.text}</div>
          {!m.user && m.serviceContextUsed && (
            <div className="chat-context-note">
              Lectura usada: {m.currentService || "servicio activo"}
            </div>
          )}
          {!m.user && m.reflejo && (
            <div className="chat-reflection">{m.reflejo}</div>
          )}
          {!m.user && m.error && (
            <div className="chat-error">{m.error}</div>
          )}
        </div>
      ))}
    </div>
  );
}
