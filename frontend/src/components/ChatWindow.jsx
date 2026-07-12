import React from 'react';

export default function ChatWindow({ messages }) {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-window" ref={scrollRef}>
      {messages.map(m => (
        <div key={m.id}
             className={`chat-bubble ${m.user ? 'user' : 'bot'} ${m.incidencia ? 'chat-bubble--incidencia' : ''}`}>
          <div className="chat-text">{m.text}</div>
          {!m.user && m.serviceContextUsed && (
            <div className="chat-context-note">
              Lectura usada: {m.currentService || "servicio activo"}
            </div>
          )}
          {!m.user && m.reflejo && (
            <div className="chat-reflection">{m.reflejo}</div>
          )}
          {!m.user && m.incidencia && (
            <div className="chat-incidencia">
              <small>Tipo: {m.incidencia.tipo}</small>
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