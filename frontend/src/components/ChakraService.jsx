import React, { useState, useEffect } from 'react';
import './ChakraService.css';
import VeloraLoader from './VeloraLoader';

export default function ChakraService({ onServiceResult }) {
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
    onServiceResult?.({
      mode: "selected_chakra",
      chakra,
    });
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
      const guide = (data.velora_voice || data.reflejo)
        ? {
            voice: data.velora_voice,
            reflection: data.reflejo
          }
        : null;
      setVeloraGuide(guide);
      onServiceResult?.({
        mode: "diagnosis",
        input: { symptom },
        chakra: data.chakra,
        velora_guide: guide,
        diagnostic_success: data.diagnostico_exitoso,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chakra-container">
      <section className="chakra-panel" aria-labelledby="chakra-title">
        <div className="chakra-card-geometry" aria-hidden="true" />

        <div className="chakra-intro">
          <span className="chakra-kicker">Lectura de chakras</span>
          <h2 id="chakra-title" className="chakra-title">Sistema Energético</h2>
          <p>
            Explora tus centros de luz o describe un síntoma para que Velora sugiera el chakra que pide atención.
          </p>
        </div>

        <div className="chakra-layout">

          {/* COLUMNA IZQ: CUERPO */}
          <div className="body-column" aria-label="Centros energéticos">
            <div className="energy-line"></div>
            {chakras.map((c) => (
              <button
                key={c.id}
                className={`chakra-node ${selectedChakra?.id === c.id ? 'active' : ''}`}
                style={{
                  backgroundColor: c.hex,
                  boxShadow: selectedChakra?.id === c.id
                    ? `0 0 25px ${c.hex}`
                    : '0 8px 14px rgba(45, 26, 0, 0.18)'
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

            {/* DIAGNÓSTICO */}
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
                  {loading ? "Sanando..." : "Sanar"}
                </button>
              </form>

              {loading && (
                <VeloraLoader message="Alineando centros de luz..." compact />
              )}
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
                style={{ '--chakra-active': selectedChakra.hex }}
              >
                <div className="chakra-header">
                  <div
                    className="chakra-icon-large"
                    style={{ background: selectedChakra.hex }}
                  >
                    {selectedChakra.symbol}
                  </div>
                  <div>
                    <span className="chakra-kicker">Centro seleccionado</span>
                    <h3>{selectedChakra.name}</h3>
                    <span className="sanskrit-name">{selectedChakra.sanskrit}</span>
                  </div>
                </div>

                {/* Grid Técnico Limpio */}
                <div className="astro-stats-grid chakra-stats-grid">
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
                      <strong>Visualización sugerida</strong>
                      <p>{selectedChakra.visualization}</p>
                    </div>
                  )}
                </div>

                {/* Mensaje Velora */}
                {veloraGuide && (
                  <div className="velora-chakra-box">
                    <span className="velora-label">
                      Guía de Sanación
                    </span>
                    {veloraGuide.voice.split('\n').map((line, i) => (
                      line.trim() && <p key={i} className="velora-text">{line}</p>
                    ))}
                    {veloraGuide.reflection && (
                      <div className="chakra-reflection">
                        "{veloraGuide.reflection}"
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
