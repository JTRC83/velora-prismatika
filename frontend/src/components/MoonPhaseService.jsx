import React, { useState, useEffect } from 'react';
import './AstroService.css'; // Estilos base
import './MoonPhaseService.css'; // Estilos lunares
import VeloraLoader from './VeloraLoader';

export default function MoonPhaseService({ onServiceResult }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMoonData = React.useCallback(async () => {
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
        onServiceResult?.(jsonData);
        setLoading(false);
      }, 1000);

    } catch {
      setError("No se pudo conectar con el cielo nocturno.");
      setLoading(false);
    }
  }, [onServiceResult]);

  useEffect(() => {
    fetchMoonData();
  }, [fetchMoonData]);

  return (
    <div className="astro-service moon-service p-6">
      
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
        <VeloraLoader message="Sintonizando mareas..." />
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

            {(data.velora_message || data.velora_reflection) && (
              <div className="astro-horoscope moon-message">
                <span className="velora-label-moon">✦ Susurro Lunar ✦</span>
                {data.velora_message && (
                  <p className="velora-text-moon">
                    "{data.velora_message}"
                  </p>
                )}
                {data.velora_reflection && (
                  <div className="moon-reflection">
                    {data.velora_reflection}
                  </div>
                )}
              </div>
            )}
            
            <button onClick={fetchMoonData} className="moon-refresh-btn">
              Actualizar Cielo
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
