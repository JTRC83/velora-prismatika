import React, { useState } from 'react';
import './AstroService.css';
import ZodiacOrbit from './ZodiacOrbit';
import './ZodiacOrbit.css';

// El código \uFE0E fuerza al navegador a usar la versión "Texto" (Blanco y negro)
// en lugar de la versión "Emoji" (Color/Botón lila)
const zodiacMap = {
  Aries: '♈\uFE0E', 
  Tauro: '♉\uFE0E', 
  Géminis: '♊\uFE0E', 
  Cáncer: '♋\uFE0E',
  Leo: '♌\uFE0E', 
  Virgo: '♍\uFE0E', 
  Libra: '♎\uFE0E', 
  Escorpio: '♏\uFE0E',
  Sagitario: '♐\uFE0E', 
  Capricornio: '♑\uFE0E', 
  Acuario: '♒\uFE0E', 
  Piscis: '♓\uFE0E',
};

export default function AstroService() {
  const [formData, setFormData] = useState({
    birthdate: '',
    birthtime: '',
    location: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // En 'result' guardaremos toda la respuesta unificada del nuevo backend
  const [result, setResult] = useState(null);

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

    try {
      // 1. LLAMADA AL NUEVO ENDPOINT UNIFICADO (POST)
      const res = await fetch('http://localhost:8000/astro/carta-natal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            fecha_nacimiento: formData.birthdate,
            nombre: "Consultante", // Opcional, pero útil si el backend lo usa
            lugar: formData.location || "Un lugar lejano"
        })
      });
      
      if (!res.ok) {
        throw new Error(`Error en la conexión estelar (${res.status})`);
      }
      
      const data = await res.json();
      
      // Simulamos un pequeño tiempo de "cálculo" para la dramaturgia
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error("Error completo:", err);
      setError("Los astros guardan silencio... (Verifica que el Backend corre en el puerto 8000)");
      setLoading(false);
    }
  };

  // Helper para extraer datos de forma segura (por si el backend varía ligeramente)
  const datos = result?.datos_tecnicos || {};

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
          <div className="astro-card visible fade-in-up">
            {/* Cabecera Icónica */}
            <div className="zodiac-header-center">
              {/* Hemos quitado estilos inline y dependemos de la clase CSS */}
              <span className="zodiac-symbol-char">
                {zodiacMap[datos.signo]}
              </span>
              <span className="zodiac-name">{datos.signo}</span>
            </div>

            {/* Grid de Datos Estilo Alquimia */}
            <div className="astro-stats-grid">
              
              {/* Elemento */}
              <div className="stat-box">
                <span className="stat-icon">🜁</span>
                <span className="stat-label">Elemento</span>
                <span className="stat-value">
                  {datos.elemento?.split(',')[0]} 
                </span>
              </div>

              {/* Cualidad - CORREGIDO PARA QUE OCUPE MENOS */}
              <div className="stat-box">
                <span className="stat-icon">⚡</span>
                <span className="stat-label">Cualidad</span>
                <span className="stat-value">
                   {/* Tomamos solo la primera palabra antes de los dos puntos o punto */}
                   {datos.cualidad?.split(/[:.]/)[0]}
                </span>
              </div>

              {/* Regente */}
              <div className="stat-box">
                <span className="stat-icon">🪐</span>
                <span className="stat-label">Regente</span>
                <span className="stat-value">{datos.planeta_regente}</span>
              </div>

              {/* Día de Nacimiento */}
              <div className="stat-box">
                <span className="stat-icon">📅</span>
                <span className="stat-label">{datos.dia_nacimiento}</span>
                <span className="stat-value">
                  {datos.regente_dia}
                </span>
              </div>
              
              {/* Lugar */}
              <div className="stat-box">
                <span className="stat-icon">📍</span>
                <span className="stat-label">Origen</span>
                <span className="stat-value">
                  {datos.lugar}
                </span>
              </div>

            </div>

            {/* Sección Velora: LA MAGIA (Sustituye a la descripción estática) */}
            <div className="astro-desc">
              <h4 className="velora-subtitle">La Interpretación de Velora</h4>
              {/* Parseamos el texto largo de la IA para respetar párrafos */}
              {result.velora_voice && result.velora_voice.split('\n').map((line, index) => (
                 line.trim() && <p key={index} style={{ marginBottom: '0.8rem' }}>{line}</p>
              ))}
            </div>

            {/* Reflejo / Aforismo Final */}
            {result.reflejo && (
              <div className="astro-horoscope">
                <span className="velora-label">✦ El Reflejo de Hoy ✦</span>
                <p className="velora-text">"{result.reflejo}"</p>
                {/* Mostramos el tránsito activo discreto abajo */}
                <small className="transit-note">Tránsito: {datos.transito_activo}</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}