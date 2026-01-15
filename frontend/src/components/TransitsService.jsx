import React, { useState, useEffect } from 'react';
import './TransitsService.css';

// ... (MANTÉN TUS CONSTANTES DE GLIFOS AQUÍ IGUAL QUE ANTES) ...
const PLANET_GLYPHS = {
  "Sun": "☉", "Moon": "☽", "Mercury": "☿", "Venus": "♀",
  "Mars": "♂", "Jupiter": "♃", "Saturn": "♄", "Uranus": "♅",
  "Neptune": "♆", "Pluto": "♇"
};

const ZODIAC_GLYPHS = {
  "Aries": "♈︎", "Tauro": "♉︎", "Géminis": "♊︎", "Cáncer": "♋︎",
  "Leo": "♌︎", "Virgo": "♍︎", "Libra": "♎︎", "Escorpio": "♏︎",
  "Sagitario": "♐︎", "Capricornio": "♑︎", "Acuario": "♒︎", "Piscis": "♓︎"
};

const MOCK_TRANSITS = {
  date: new Date().toISOString().split('T')[0],
  retrograde_alert: ["Mercurio", "Plutón"],
  zodiac_positions: [
    { id: "Sun", name: "Sol", sign: "Tauro", degree: 15, minute: 30, retrograde: false, archetype: "El Rey" },
    { id: "Moon", name: "Luna", sign: "Escorpio", degree: 4, minute: 12, retrograde: false, archetype: "La Madre" },
    { id: "Mercury", name: "Mercurio", sign: "Géminis", degree: 22, minute: 45, retrograde: true, archetype: "El Mensajero" },
    { id: "Venus", name: "Venus", sign: "Cáncer", degree: 10, minute: 0, retrograde: false, archetype: "La Amante" },
    { id: "Mars", name: "Marte", sign: "Leo", degree: 5, minute: 55, retrograde: false, archetype: "El Guerrero" },
    { id: "Jupiter", name: "Júpiter", sign: "Tauro", degree: 29, minute: 10, retrograde: false, archetype: "El Maestro" },
    { id: "Saturn", name: "Saturno", sign: "Piscis", degree: 18, minute: 20, retrograde: false, archetype: "El Anciano" },
    { id: "Pluto", name: "Plutón", sign: "Acuario", degree: 0, minute: 45, retrograde: true, archetype: "El Transformador" }
  ],
  aspects: [
    { planet_a: "Sol", planet_b: "Luna", aspect_name: "Oposición", interpretation: "Polaridad entre el Ego y la Emoción. Posible tensión interna o claridad a través del otro." },
    { planet_a: "Mercurio", planet_b: "Saturno", aspect_name: "Cuadratura", interpretation: "Bloqueo entre Mente y Estructura. Pensamientos pesimistas o necesidad de disciplina." },
    { planet_a: "Venus", planet_b: "Júpiter", aspect_name: "Sextil", interpretation: "Flujo armónico entre Deseo y Expansión. Momento favorable para socializar." }
  ]
};
// ... (FIN CONSTANTES) ...

const TransitsService = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData({ ...MOCK_TRANSITS, date: date });
      setLoading(false);
    }, 1000);
  }, [date]);

  return (
    <div className="transits-container">
      
      {/* TÍTULO PRINCIPAL (Fuera del marco) */}
      <div className="transits-header-title">
        <h2>La Danza de los Astros</h2>
        <p className="velora-whisper">
          "Como es arriba, es abajo. Observa los ciclos que mueven el mundo."
        </p>
      </div>

      {/* --- INICIO DEL MARCO / HOJA --- */}
      <div className="transits-sheet">

        {/* 1. EXPLICACIÓN (Dentro del marco, fondo claro) */}
        <div className="transits-explanation">
          <p>
            Los <strong>Tránsitos Planetarios</strong> son el "clima cósmico" de hoy. 
            Muestran dónde están los planetas ahora mismo y cómo conversan entre ellos. 
            Utiliza este mapa para entender las energías disponibles: ¿es día para actuar (Marte) 
            o para reflexionar (Saturno)?
          </p>
        </div>

        {/* 2. SELECTOR FECHA */}
        <div className="date-selector-wrapper">
          <label>Fecha de Observación:</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="mystic-date-input"
          />
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner-orbit"></div>
            <p>Calculando efemérides...</p>
          </div>
        )}

        {!loading && data && (
          <div className="transits-content fade-in">
            
            {/* 3. ALERTA RX */}
            {data.retrograde_alert.length > 0 && (
              <div className="retrograde-banner">
                <span className="retro-symbol">Rx</span>
                <div className="retro-info">
                  <strong>Movimiento Retrógrado:</strong>
                  <span> {data.retrograde_alert.join(", ")} </span>
                  <small>— Período de revisión interna.</small>
                </div>
              </div>
            )}

            {/* 4. LAYOUT ALMANAQUE */}
            <div className="almanac-layout">
              
              {/* COLUMNA IZQUIERDA: TABLA */}
              <div className="ephemeris-section">
                <h3>Posiciones Eclípticas</h3>
                <table className="ephemeris-table">
                  <thead>
                    <tr>
                      <th>Astro</th>
                      <th>Arquetipo</th>
                      <th>Posición</th>
                      <th>Signo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.zodiac_positions.map((planet) => (
                      <tr key={planet.id}>
                        <td className="col-body">
                          <span className="ink-glyph">{PLANET_GLYPHS[planet.id]}</span>
                          <span className="body-name">
                            {planet.name}
                            {planet.retrograde && <span className="rx-mark">Rx</span>}
                          </span>
                        </td>
                        <td className="col-archetype">{planet.archetype}</td>
                        <td className="col-deg">{planet.degree}° {planet.minute}'</td>
                        <td className="col-sign">
                          <span className="ink-glyph small">{ZODIAC_GLYPHS[planet.sign]}</span>
                          {planet.sign}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* COLUMNA DERECHA: ASPECTOS */}
              <div className="aspects-section">
                <h3>Configuraciones Mayores</h3>
                <div className="aspects-journal">
                  {data.aspects.length === 0 ? (
                    <p className="journal-empty">Sin aspectos mayores hoy. Calma.</p>
                  ) : (
                    data.aspects.map((aspect, idx) => (
                      <div key={idx} className="journal-entry">
                        <div className="journal-header">
                          <span className="aspect-title">
                            {aspect.planet_a} 
                            <span className="connector">{aspect.aspect_name}</span> 
                            {aspect.planet_b}
                          </span>
                        </div>
                        <p className="journal-text">{aspect.interpretation}</p>
                        <div className="journal-separator">~ * ~</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div> 
      {/* --- FIN DEL MARCO --- */}

    </div>
  );
};

export default TransitsService;