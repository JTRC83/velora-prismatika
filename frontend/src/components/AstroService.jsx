import React, { useState } from 'react';
import './AstroService.css';
import ZodiacOrbit from './ZodiacOrbit';
import './ZodiacOrbit.css';

const zodiacMap = {
  Aries: '♈', Tauro: '♉', Géminis: '♊', Cáncer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Escorpio: '♏',
  Sagitario: '♐', Capricornio: '♑', Acuario: '♒', Piscis: '♓',
};

export default function AstroService() {
  const [formData, setFormData] = useState({
    birthdate: '',
    birthtime: '',
    location: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [horoscope, setHoroscope] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.birthdate) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setHoroscope(null);

   try {
      // Revertimos a rutas relativas para usar el proxy de Vite
      const res = await fetch(`/astro/sun-sign?birthdate=${formData.birthdate}`);
      
      if (!res.ok) {
        const errText = await res.text().catch(() => "Error desconocido");
        throw new Error(errText || `Error ${res.status}`);
      }
      
      const data = await res.json();
      setResult(data);

      const hRes = await fetch(`/astro/horoscope?birthdate=${formData.birthdate}`);
      if (hRes.ok) {
        const hData = await hRes.json();
        setHoroscope(hData.message);
      }
    } catch (err) {
      console.error("Error completo:", err);
      setError("Los astros guardan silencio... (Verifica que el Backend corre en el puerto 8000)");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="astro-service p-6">
    <ZodiacOrbit />
    
    <h2 className="astro-title">🪐 Mecánica Celeste</h2>

    <form onSubmit={handleSubmit} className="astro-form-col">
      {/* Fila 1: Fecha (Ancho completo) */}
      <div className="form-group">
        <label htmlFor="birthdate">Fecha de llegada:</label>
        <input
          id="birthdate"
          name="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={handleChange}
          className="astro-input"
          required
        />
      </div>

      {/* Fila 2: Hora y Lugar */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="birthtime">Hora (Opcional):</label>
          <input
            id="birthtime"
            name="birthtime"
            type="time"
            value={formData.birthtime}
            onChange={handleChange}
            className="astro-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Lugar (Ciudad):</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Ej. Madrid"
            value={formData.location}
            onChange={handleChange}
            className="astro-input"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="astro-btn">
        {loading ? '✨ Consultando los astros...' : 'Revelar mi Carta'}
      </button>
    </form>

    {error && <p className="astro-error">❗ {error}</p>}

    <div className="astro-card-container">
      {result && (
        <div className="astro-card visible">
          {/* Cabecera Icónica */}
          <div className="zodiac-header-center">
            <span className="zodiac-symbol-char">
              {zodiacMap[result.sun_sign]}
            </span>
            <span className="zodiac-name">{result.sun_sign}</span>
          </div>

          {/* Grid de Datos Estilo Alquimia */}
          <div className="astro-stats-grid">
            
            {/* Elemento */}
            <div className="stat-box">
              <span className="stat-icon">🜁</span> {/* Símbolo alquímico aire/triángulo */}
              <span className="stat-label">Elemento</span>
              <span className="stat-value">
                {result.element.split(',')[0]} {/* Muestra "Aire" en grande */}
                <small>{result.element.split(',').slice(1).join(',')}</small>
              </span>
            </div>

            {/* Cualidad */}
            <div className="stat-box">
              <span className="stat-icon">⚡</span>
              <span className="stat-label">Cualidad</span>
              <span className="stat-value">
                {/* Truco visual: Separa "Cardinal" del resto del texto */}
                {result.quality.split('.')[0]} 
                <small>{result.quality.split('.').slice(1).join('.')}</small>
              </span>
            </div>

            {/* Regente */}
            <div className="stat-box">
              <span className="stat-icon">🪐</span>
              <span className="stat-label">Regente</span>
              <span className="stat-value">{result.ruling_planet}</span>
            </div>

          </div>

          {/* Descripción Narrativa */}
          {result.description && (
            <div className="astro-desc">
              {result.description.map((line, index) => (
                <p key={index} style={{ marginBottom: '0.8rem' }}>{line}</p>
              ))}
            </div>
          )}

          {/* Sección Velora (Reflejo) */}
          {horoscope && (
            <div className="astro-horoscope">
              <span className="velora-label">✦ El Reflejo de Hoy ✦</span>
              <p className="velora-text">"{horoscope}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
}