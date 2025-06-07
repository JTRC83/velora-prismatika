import React from 'react';

export default function InputBar({ value, onChange, onSend }) {
  return (
    <div className="p-4 bg-amber-50 flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
        placeholder="Escribe tu pregunta..."
      />
      <button
        onClick={onSend}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Enviar
      </button>
    </div>
  );
}