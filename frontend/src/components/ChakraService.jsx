import React, { useState, useEffect } from 'react';
import './ChakraService.css';

// Configuración de colores (sin cambios en hex, solo presentación)
const CHAKRA_COLORS = [
  { id: 7, hex: "#9932CC", label: "Corona", symbol: "ॐ" },
  { id: 6, hex: "#483D8B", label: "Tercer Ojo", symbol: "om" },
  { id: 5, hex: "#5F9EA0", label: "Garganta", symbol: "हं" },
  { id: 4, hex: "#556B2F", label: "Corazón", symbol: "यं" },
  { id: 3, hex: "#DAA520", label: "Plexo Solar", symbol: "रं" },
  { id: 2, hex: "#CD853F", label: "Sacro", symbol: "वं" },
  { id: 1, hex: "#8B0000", label: "Raíz", symbol: "लं" }
];

export default function ChakraService() {
  const [chakras, setChakras] = useState([]);
  const [selectedChakra, setSelectedChakra] = useState(null);
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [veloraGuide, setVeloraGuide] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/chakra/list')
      .then(res => res.json())
      .then(data => {
        setChakras(data.sort((a, b) => a.id - b.id));
      })
      .catch(err => console.error("Error cargando chakras:", err));
  }, []);

  const handleSelect = (chakra) => {
    setSelectedChakra(chakra);
    setVeloraGuide(null);
    setSymptom("");
  };

  const handleDiagnosis = async (e) => {
    e.preventDefault();
    if (!symptom.trim()) return;

    setLoading(true);
    setVeloraGuide(null);

    try {
      const res = await fetch('http://localhost:8000/chakra/align', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptom: symptom })
      });

      if (!res.ok) throw new Error("Error en la alineación");

      const data = await res.json();
      setSelectedChakra(data.chakra);
      setVeloraGuide({
        voice: data.velora_voice,
        reflection: data.reflejo
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chakra-container">
      {/* Título limpio sin emojis */}
      <h2 className="chakra-title">Sistema Energético</h2>

      <div className="chakra-layout">
        
        {/* COLUMNA IZQ: CUERPO */}
        <div className="body-column">
          <div className="energy-line"></div>
          {chakras.map((c) => (
            <button
              key={c.id}
              className={`chakra-node ${selectedChakra?.id === c.id ? 'active' : ''}`}
              style={{ 
                backgroundColor: c.hex,
                boxShadow: selectedChakra?.id === c.id 
                  ? `0 0 25px ${c.hex}` 
                  : '0 4px 8px rgba(0,0,0,0.2)'
              }}
              onClick={() => handleSelect(c)}
              title={c.name}
            >
              <span className="node-symbol">{c.symbol}</span>
            </button>
          ))}
        </div>

        {/* COLUMNA DER: CONTENIDO */}
        <div className="info-column">
          
          {/* DIAGNÓSTICO (Texto legible) */}
          <div className="diagnosis-box">
            <h4>¿Cómo te sientes?</h4>
            <form onSubmit={handleDiagnosis} className="diagnosis-input-group">
              <input 
                type="text" 
                className="diagnosis-input"
                placeholder="Describe tu síntoma físico o emocional..."
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
              />
              <button type="submit" className="diagnosis-btn" disabled={loading}>
                {loading ? "..." : "Sanar"}
              </button>
            </form>
          </div>

          {/* TARJETA */}
          {!selectedChakra ? (
            <div className="placeholder-msg">
              <p>Selecciona un punto de luz o describe tu síntoma para comenzar.</p>
            </div>
          ) : (
            <div 
              key={selectedChakra.id} 
              className="chakra-card"
              style={{ borderTop: `6px solid ${selectedChakra.hex}` }}
            >
              <div className="chakra-header">
                <div 
                  className="chakra-icon-large" 
                  style={{ background: selectedChakra.hex }}
                >
                  {selectedChakra.symbol}
                </div>
                <div>
                  <h3>{selectedChakra.name}</h3>
                  <span className="sanskrit-name">{selectedChakra.sanskrit}</span>
                </div>
              </div>

              {/* Grid Técnico Limpio */}
              <div className="astro-stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Mantra</span>
                  <span className="stat-value">{selectedChakra.mantra}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Elemento</span>
                  <span className="stat-value">{selectedChakra.element}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Frecuencia</span>
                  <span className="stat-value">{selectedChakra.frequency} Hz</span>
                </div>
              </div>

              {/* Detalles sin emojis */}
              <div className="chakra-details">
                <p><strong>Cristales:</strong> {selectedChakra.crystals.join(", ")}</p>
                <p><strong>Bloqueos:</strong> {selectedChakra.imbalance.join(", ")}</p>
                
                {!veloraGuide && (
                  <div className="visualization-box">
                    <strong>Visualización Sugerida:</strong>
                    <p>{selectedChakra.visualization}</p>
                  </div>
                )}
              </div>

              {/* Mensaje Velora */}
              {veloraGuide && (
                <div className="velora-chakra-box">
                  <span className="velora-label" style={{color: selectedChakra.hex}}>
                    Guía de Sanación
                  </span>
                  {veloraGuide.voice.split('\n').map((line, i) => (
                    line.trim() && <p key={i} className="velora-text">{line}</p>
                  ))}
                  <div className="moon-reflection" style={{marginTop: '1.5rem', color: '#555', textAlign: 'center', fontStyle: 'italic'}}>
                    "{veloraGuide.reflection}"
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}