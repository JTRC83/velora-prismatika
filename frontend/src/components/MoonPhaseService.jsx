import React, { useState, useEffect } from 'react';
import './AstroService.css'; // Reusamos los estilos base (variables, botones, tarjetas)
import './MoonPhaseService.css'; // Estilos específicos para la luna

export default function MoonPhaseService() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos al montar el componente (no requiere input del usuario)
  useEffect(() => {
    fetchMoonData();
  }, []);

  const fetchMoonData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/moon-phase/current'); // Usa el proxy configurado
      if (!res.ok) throw new Error('La luna se oculta tras las nubes...');
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err) {
      setError("No se pudo conectar con el cielo nocturno.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="astro-service p-6">
      
     <h2 className="astro-title" style={{ color: '#2c3e50', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
  🌑 Espejo de Plata
    </h2>

      {/* Botón de recarga manual */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button onClick={fetchMoonData} disabled={loading} className="astro-btn moon-btn">
          {loading ? 'Consultando marea...' : 'Actualizar Fase Lunar'}
        </button>
      </div>

      {error && <p className="astro-error">{error}</p>}

      <div className="astro-card-container">
        {data && (
          <div className="astro-card visible moon-card">
            
            {/* Cabecera: La Luna Visual */}
            <div className="zodiac-header-center">
              <span className="moon-emoji-display">
                {data.icon}
              </span>
              <span className="zodiac-name moon-phase-name">
                {data.phase_name}
              </span>
            </div>

            {/* Grid de Datos Estilo Alquimia (Reusado) */}
            <div className="astro-stats-grid moon-grid">
              
              {/* Iluminación */}
              <div className="stat-box">
                <span className="stat-icon">💡</span>
                <span className="stat-label">Luz</span>
                <span className="stat-value">{data.illumination}</span>
              </div>

              {/* Signo Lunar */}
              <div className="stat-box">
                <span className="stat-icon">♓</span> {/* Icono genérico o dinámico si quieres */}
                <span className="stat-label">Tránsito</span>
                <span className="stat-value">{data.zodiac_sign}</span>
              </div>

              {/* Elemento (Hardcodeado o calculado si quieres complicarlo) */}
              <div className="stat-box">
                <span className="stat-icon">🌊</span>
                <span className="stat-label">Marea</span>
                <span className="stat-value">Alta</span>
              </div>

            </div>

            {/* Sección Velora (Reflejo) */}
            <div className="astro-horoscope moon-message">
              <span className="velora-label" style={{ color: '#8aa' }}>✦ Susurro Lunar ✦</span>
              <p className="velora-text" style={{ color: '#223' }}>
                "{data.velora_message}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}