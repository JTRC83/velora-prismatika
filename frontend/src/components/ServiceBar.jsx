import React from 'react';

// Todos tus servicios, organizados en dos grupos de 6 cada uno
const LEFT_SERVICES = [
  { key: 'natal',       label: 'Astrología Natal' },
  { key: 'horoscope',   label: 'Horóscopo Diario' },
  { key: 'numerology',  label: 'Numerología' },
  { key: 'moon_phases', label: 'Fases Lunares' },
  { key: 'compatibility', label: 'Compatibilidad' },
  { key: 'rituals',     label: 'Rituales' },
  { key: 'chakras',     label: 'Chakras' },
];

const RIGHT_SERVICES = [
  { key: 'tarot',       label: 'Tarot 3 Cartas' },
  { key: 'runes',       label: 'Runas' },
  { key: 'kabbalah',    label: 'Cábala' },
  { key: 'transits',    label: 'Tránsitos' },
  { key: 'crystalball', label: 'Bola de Cristal' },
  { key: 'iching',      label: 'I Ching' },
];

export default function ServiceBar({ onSelectService, selected }) {
  return (
    <div className="service-bar">
      <div className="service-group">
        {LEFT_SERVICES.map(s => (
          <button
            key={s.key}
            onClick={() => onSelectService(s.key)}
            className={`service-btn ${selected === s.key ? 'selected' : ''}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="logo-container">
        <img
          src="/assets/velora-logo.png"
          alt="Velora Prismätika"
          className="logo"
        />
      </div>

      <div className="service-group">
        {RIGHT_SERVICES.map(s => (
          <button
            key={s.key}
            onClick={() => onSelectService(s.key)}
            className={`service-btn ${selected === s.key ? 'selected' : ''}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}