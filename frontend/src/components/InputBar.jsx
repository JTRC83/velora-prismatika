import React from 'react';

export default function InputBar({ value, onChange, onSend, disabled = false }) {
  return (
    <div className="input-bar">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSend();
        }}
        placeholder="Escribe tu pregunta…"
        disabled={disabled}
      />
      <button onClick={onSend} disabled={disabled}>
        {disabled ? "Abriendo…" : "Enviar"}
      </button>
    </div>
  );
}
