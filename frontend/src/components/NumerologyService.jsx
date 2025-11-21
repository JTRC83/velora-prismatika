// src/components/NumerologyService.jsx

import React, { useState } from 'react';
import "./NumerologyService.css";

export default function NumerologyService() {
  const [birthdate, setBirthdate] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!birthdate) return;

    try {
      const formatted = new Date(birthdate).toISOString().split('T')[0];
      const res = await fetch(`/numerology/life-path?birthdate=${formatted}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="numerology-service p-6">
      <h2 className="numerology-title">🔢 Sendero de Vida</h2>
      <form onSubmit={handleSubmit} className="numerology-form">
        <label htmlFor="birthdate">Fecha de nacimiento:</label>
        <input
          id="birthdate"
          type="date"
          value={birthdate}
          onChange={e => setBirthdate(e.target.value)}
          className="numerology-input"
        />
        <button type="submit" className="numerology-btn">Calcular</button>
      </form>

      {error && <p className="numerology-error">❗ {error}</p>}
      {result && (
        <div className="numerology-result">
          <p><strong>Fecha:</strong> {result.birthdate}</p>
          <p><strong>Número de Vida:</strong> {result.life_path}</p>
          <p className="numerology-meaning">{result.meaning}</p>
        </div>
      )}
    </div>
  );
}