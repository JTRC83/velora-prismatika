// src/components/AvatarSelector.jsx
import React from 'react';

export default function AvatarSelector({ avatars, onSelect, selected }) {
  return (
    <div className="bg-amber-50 flex-shrink-0 h-12 px-2 flex items-center overflow-x-auto gap-2">
      {avatars.map(({ id, name }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`
            flex-shrink-0 rounded border-2 
            ${selected === id ? 'border-green-600' : 'border-transparent'}
          `}
        >
          <img
            src={`/assets/avatars/${id}.png`}
            alt={name}
            className="w-4 h-6 object-cover"
          />
        </button>
      ))}
    </div>
  );
}