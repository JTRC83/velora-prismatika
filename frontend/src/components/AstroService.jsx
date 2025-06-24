import React, { useState } from 'react';
import './AstroService.css';
import ZodiacOrbit from './ZodiacOrbit';
import './ZodiacOrbit.css';

export default function AstroService() {
  const [birthdate, setBirthdate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [result,  setResult]  = useState(null);
  const [horoscope, setHoroscope] = useState(null);

const handleSubmit = async e => {
  e.preventDefault();
  if (!birthdate) return;
  setLoading(true);
  setError(null);
  setResult(null);
  setHoroscope(null);

  try {
    const res = await fetch(`/astro/sun-sign?birthdate=${birthdate}`);
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setResult(data);

    // ahora pide el horóscopo
    const hRes = await fetch(`/astro/horoscope?birthdate=${birthdate}`);
    if (hRes.ok) {
      const hData = await hRes.json();
      setHoroscope(hData.message);
    }

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="astro-service p-6" style={{ position: 'relative' }}>
        <ZodiacOrbit />
      <h2 className="astro-title">🪐 Astrología Natal</h2>

      <form onSubmit={handleSubmit} className="astro-form">
        <label htmlFor="birthdate">Fecha de nacimiento:</label>
        <input
          id="birthdate"
          type="date"
          value={birthdate}
          onChange={e => setBirthdate(e.target.value)}
          className="astro-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="astro-btn"
        >
          {loading ? '…calculando' : 'Calcular mi signo'}
        </button>
      </form>

      {error && <p className="astro-error">❗ {error}</p>}

      {result && (
        <div className="astro-card">
            <div className="astro-card-header">
            <img
                src={`/assets/signos/${result.sun_sign.toLowerCase()}.png`}
                alt={result.sun_sign}
                className="astro-signo-img"
            />
            <h3 className="text-2xl font-bold text-center">
            ♊ {result.sun_sign}
            </h3>
            </div>
            <ul className="astro-details">
            <li><strong>Elemento:</strong> {result.element}</li>
            <li><strong>Modalidad:</strong> {result.quality}</li>
            <li><strong>Planeta:</strong> {result.ruling_planet}</li>
            </ul>
            <p className="astro-desc">{result.description}</p>
            <br></br>
            {horoscope && (
            <div className="astro-horoscope mt-4 italic text-center text-yellow-900">
                ✨ <strong>Predicción de hoy:</strong> {horoscope}
            </div>
            )}
        </div>
        )}
    </div>
  );
}