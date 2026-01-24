import React, { useState } from 'react';
import './RunesService.css';

export default function RunesService() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Función para lanzar las piedras llamando al Backend
  const castRunes = async (type) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Conexión con el cerebro de Velora
      const res = await fetch('http://localhost:8000/runes/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: type }),
      });

      if (!res.ok) throw new Error("Las piedras se niegan a hablar hoy.");

      const data = await res.json();
      
      // Pequeño retardo para simular el "sacudido" de la bolsa
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("El viento del norte ha dispersado la conexión.");
      setLoading(false);
    }
  };

  return (
    <div className="runes-container">
      <h2 className="runes-title">ᚠ El Oráculo del Norte</h2>
      <p className="runes-subtitle">Consulta a las Nornas sobre tu destino</p>
      
      {/* MENÚ DE SELECCIÓN (Solo si no hay resultado) */}
      {!result && !loading && (
        <div className="runes-menu fade-in">
          
          <div className="runes-options">
            <button className="rune-btn" onClick={() => castRunes('one')}>
              <span className="btn-icon">ᚨ</span>
              <div className="btn-text">
                <strong>Consejo de Odín</strong>
                <small>Una sola runa para guía inmediata.</small>
              </div>
            </button>

            <button className="rune-btn" onClick={() => castRunes('three')}>
              <span className="btn-icon">ᛜ</span>
              <div className="btn-text">
                <strong>Las Tres Nornas</strong>
                <small>Pasado, Presente y Futuro.</small>
              </div>
            </button>

            <button className="rune-btn" onClick={() => castRunes('five')}>
              <span className="btn-icon">ᛉ</span>
              <div className="btn-text">
                <strong>La Cruz de Thor</strong>
                <small>Panorama completo de la situación.</small>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* PANTALLA DE CARGA (ANIMACIÓN) */}
      {loading && (
        <div className="runes-loading">
          <div className="stone-spinner">ᛃ</div>
          <p>Agitando el saco de piel...</p>
        </div>
      )}

      {/* RESULTADOS DE LA TIRADA */}
      {result && (
        <div className="runes-result fade-in-up">
          
          {/* MESA DE PIEDRAS */}
          <div className="stones-grid">
            {result.visual_data.map((rune, index) => (
              <div key={index} className="rune-card">
                {/* La Piedra Física */}
                <div className={`rune-stone ${rune.inverted ? 'inverted' : ''}`}>
                  <span className="rune-symbol-text">{rune.symbol}</span>
                </div>
                
                {/* La Etiqueta Explicativa */}
                <div className="rune-info">
                  <span className="rune-pos">{rune.position_desc}</span>
                  <span className="rune-name">
                    {rune.name} {rune.inverted && <small>(Inv.)</small>}
                  </span>
                  <span className="rune-meaning">
                    {rune.meaning_text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* INTERPRETACIÓN DE VELORA (La Vidente) */}
          <div className="velora-runic-box">
            <h4>La Voz de la Vidente</h4>
            {/* Parseamos el texto para respetar párrafos */}
            {result.velora_voice && result.velora_voice.split('\n').map((line, i) => (
              line.trim() && <p key={i}>{line}</p>
            ))}
            
            <div className="runic-reflection">
              ❄ "{result.reflejo}"
            </div>
          </div>

          <button className="reset-runes-btn" onClick={() => setResult(null)}>
            Consultar de nuevo
          </button>
        </div>
      )}

      {error && <p className="runes-error">⚠️ {error}</p>}
    </div>
  );
}