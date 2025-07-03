import React, { useState } from 'react';
import './AstroService.css';
import ZodiacOrbit from './ZodiacOrbit';
import './ZodiacOrbit.css';


const zodiacMap = {
  Aries: '♈',
  Tauro: '♉',
  Géminis: '♊',
  Cáncer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Escorpio: '♏',
  Sagitario: '♐',
  Capricornio: '♑',
  Acuario: '♒',
  Piscis: '♓',
};

export default function AstroService() {
  const [birthdate, setBirthdate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
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
      <button type="submit" disabled={loading} className="astro-btn">
        {loading ? '…calculando' : 'Calcular mi signo'}
      </button>
    </form>

    {error && <p className="astro-error">❗ {error}</p>}

    {/* 👇 Contenedor que siempre está presente */}
    <div className="astro-card-container">
      {result && (
        <div className="astro-card visible">
          <div className="astro-card-header zodiac-header-center">
            <span className="zodiac-symbol-char">
              {zodiacMap[result.sun_sign]}
            </span>
            <span className="zodiac-name">{result.sun_sign}</span>
          </div>
          <ul className="astro-details">
            <li><strong>Elemento:</strong> {result.element}</li>
            <li><strong>Modalidad:</strong> {result.quality}</li>
            <li><strong>Planeta:</strong> {result.ruling_planet}</li>
            <hr className="astro-separator" />
          </ul>
          {result.description && (
            <div className="astro-desc">
              {result.description.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
          <br />
          {horoscope && (
            <div className="astro-horoscope mt-4 italic text-center text-yellow-900">
              ✨ <strong>Predicción diaria:</strong><br />
              {horoscope}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
}