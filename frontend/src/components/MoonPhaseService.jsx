import React, { useState, useEffect } from 'react';
import './AstroService.css'; // Estilos base
import './MoonPhaseService.css'; // Estilos lunares

export default function MoonPhaseService() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMoonData();
  }, []);

  const fetchMoonData = async () => {
    setLoading(true);
    setError(null);
    try {
      // CORRECCIÓN: Usamos la URL completa del backend
      const res = await fetch('http://localhost:8000/moon-phase/current'); 
      
      if (!res.ok) throw new Error('La luna se oculta tras las nubes...');
      
      const jsonData = await res.json();
      
      // Pequeño delay artificial para disfrutar la animación de carga
      setTimeout(() => {
        setData(jsonData);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError("No se pudo conectar con el cielo nocturno.");
      setLoading(false);
    }
  };

  return (
    <div className="astro-service p-6">
      
     <h2 className="moon-title">
        🌑 Espejo de Plata
     </h2>

      {/* Botón de recarga */}
      {!data && !loading && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={fetchMoonData} className="astro-btn moon-btn">
            Intentar Conexión
          </button>
        </div>
      )}

      {/* Loading Místico */}
      {loading && (
        <div className="moon-loading">
            <span className="moon-spinner">🌕</span>
            <p>Sintonizando mareas...</p>
        </div>
      )}

      {error && <p className="astro-error">{error}</p>}

      <div className="astro-card-container">
        {data && !loading && (
          <div className="astro-card visible moon-card">
            
            {/* Cabecera: La Luna Visual */}
            <div className="zodiac-header-center">
              <span className="moon-emoji-display">
                {data.icon}
              </span>
              <span className="zodiac-name moon-phase-name">
                {data.phase_name}
              </span>
              <span className="moon-date">{data.date}</span>
            </div>

            {/* Grid de Datos */}
            <div className="astro-stats-grid moon-grid">
              
              {/* Iluminación */}
              <div className="stat-box">
                <span className="stat-icon">💡</span>
                <span className="stat-label">Luz</span>
                <span className="stat-value">{data.illumination}%</span>
              </div>

              {/* Signo Lunar */}
              <div className="stat-box">
                <span className="stat-icon">✨</span>
                <span className="stat-label">Tránsito</span>
                <span className="stat-value">{data.zodiac_sign}</span>
              </div>

              {/* Elemento (Decorativo) */}
              <div className="stat-box">
                <span className="stat-icon">🌊</span>
                <span className="stat-label">Ciclo</span>
                <span className="stat-value">
                    {data.illumination > 50 ? "Plenitud" : "Gestación"}
                </span>
              </div>

            </div>

            {/* Sección Velora (Reflejo) */}
            <div className="astro-horoscope moon-message">
              <span className="velora-label-moon">✦ Susurro Lunar ✦</span>
              <p className="velora-text-moon">
                "{data.velora_message}"
              </p>
              <div className="moon-reflection">
                {data.velora_reflection}
              </div>
            </div>
            
            <button onClick={fetchMoonData} className="moon-refresh-btn">
              Actualizar Cielo
            </button>

          </div>
        )}
      </div>
    </div>
  );
}