import React, { useState } from 'react';
import './AstroService.css'; // Estilos base
import './ChakraService.css'; // Estilos nuevos

// PALETA DE GEMAS VELORA + SÍMBOLOS SÁNSCRITOS
const CHAKRA_COLORS = [
  { id: 7, hex: "#9932CC", label: "Corona", symbol: "ॐ" },      // Amatista Oscura
  { id: 6, hex: "#483D8B", label: "Tercer Ojo", symbol: "om" }, // Lapis Lázuli (Indigo)
  { id: 5, hex: "#5F9EA0", label: "Garganta", symbol: "हं" },   // Turquesa apagado
  { id: 4, hex: "#556B2F", label: "Corazón", symbol: "यं" },    // Verde Oliva/Musgo
  { id: 3, hex: "#DAA520", label: "Plexo Solar", symbol: "रं" },// Oro Viejo
  { id: 2, hex: "#CD853F", label: "Sacro", symbol: "वं" },      // Cobre/Ámbar
  { id: 1, hex: "#8B0000", label: "Raíz", symbol: "लं" }        // Granate/Rubí
];

export default function ChakraService() {
  const [selectedId, setSelectedId] = useState(null);
  const [chakraData, setChakraData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchChakra = async (id) => {
    setSelectedId(id);
    setLoading(true);
    setChakraData(null);
    try {
      const res = await fetch(`/chakra/${id}`);
      const data = await res.json();
      setChakraData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="astro-service p-6 chakra-container">
      <h2 className="astro-title" style={{color: '#5a4a42'}}>🧘 Alineación Energética</h2>

      <div className="chakra-layout">
        
        {/* COLUMNA IZQUIERDA: EL CUERPO DE LUZ */}
        <div className="body-column">
          <div className="energy-line"></div>
          {CHAKRA_COLORS.map((c) => (
            <button
              key={c.id}
              className={`chakra-node ${selectedId === c.id ? 'active' : ''}`}
              style={{ 
                backgroundColor: c.hex,
                // Si está activo, brillamos con su color, si no, sombra sutil
                boxShadow: selectedId === c.id 
                  ? `0 0 25px ${c.hex}` 
                  : '0 4px 6px rgba(0,0,0,0.3)'
              }}
              onClick={() => fetchChakra(c.id)}
              title={c.label}
            >
              {/* Símbolo Sánscrito dentro del botón */}
              <span className="node-symbol">{c.symbol}</span>
              
              <span className="node-tooltip">{c.label}</span>
            </button>
          ))}
        </div>

        {/* COLUMNA DERECHA: LA INFO */}
        <div className="info-column">
         {!chakraData ? (
            <div className="placeholder-msg">
              <p>Selecciona un centro de energía (Gemas) para leer su vibración.</p>
            </div>
          ) : (
            <div 
              /* 👇 ¡ESTO ES LO IMPORTANTE! Añadimos key para forzar la animación */
              key={chakraData.id}
              className="astro-card visible chakra-card"
              style={{ borderTop: `4px solid ${chakraData.hex}` }}
            >
              {/* Cabecera */}
              <div className="chakra-header">
                <div 
                  className="chakra-icon-large" 
                  style={{ background: chakraData.hex }}
                >
                  {/* Aquí mostramos la inicial del sánscrito o el número */}
                  {chakraData.sanskrit.charAt(0)}
                </div>
                <div>
                  <h3>{chakraData.name}</h3>
                  <span className="sanskrit-name">{chakraData.sanskrit}</span>
                </div>
              </div>

              {/* Grid de Datos con Explicaciones */}
              <div className="astro-stats-grid">
                
                <div className="stat-box">
                  <span className="stat-label">Mantra</span>
                  <span className="stat-value">{chakraData.mantra}</span>
                  <span className="stat-explanation">Sonido Semilla</span>
                </div>

                <div className="stat-box">
                  <span className="stat-label">Elemento</span>
                  <span className="stat-value">{chakraData.element}</span>
                  <span className="stat-explanation">Energía Base</span>
                </div>

                <div className="stat-box">
                  <span className="stat-label">Frecuencia</span>
                  <span className="stat-value">{chakraData.frequency} Hz</span>
                  <span className="stat-explanation">Vibración</span>
                </div>
                
              </div>

              {/* Contenido Rico */}
              <div className="chakra-details">
                <p><strong>💎 Cristales:</strong> {chakraData.crystals.join(", ")}</p>
                <p><strong>⚠️ Bloqueos:</strong> {chakraData.imbalance.join(", ")}</p>
                
                <div className="visualization-box">
                  <strong>👁️ Visualización:</strong>
                  <p>{chakraData.visualization}</p>
                </div>
              </div>

              {/* Mensaje Velora */}
              <div className="astro-horoscope mt-4">
                <span className="velora-label" style={{color: chakraData.hex}}>✦ Equilibrio Elemental ✦</span>
                <p className="velora-text">"{chakraData.velora_message}"</p>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}