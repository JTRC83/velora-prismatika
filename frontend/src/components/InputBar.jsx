import React from 'react';

export default function InputBar({ value, onChange, onSend }) {
  return (
    <div className="input-bar">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Escribe tu pregunta…"
      />
      <button onClick={onSend}>Enviar</button>
    </div>
  );
}