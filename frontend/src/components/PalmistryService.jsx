import React, { useState } from 'react';
import './PalmistryService.css';

// Simulación de datos del backend
const MOCK_READINGS = {
  heart: {
    name: "Línea del Corazón",
    readings: [
      "Tu línea es profunda y curva: indica una naturaleza apasionada y gran capacidad de amar.",
      "La línea es recta y lógica: manejas tus emociones con prudencia y buscas seguridad.",
      "Termina bajo el índice: eres idealista en el amor y buscas una conexión espiritual."
    ]
  },
  head: {
    name: "Línea de la Cabeza",
    readings: [
      "Línea larga y curvada: mente creativa, intituiva y flexible.",
      "Línea recta: pensamiento analítico, realista y directo.",
      "Separada de la vida: espíritu independiente y aventurero desde joven."
    ]
  },
  life: {
    name: "Línea de la Vida",
    readings: [
      "Arco amplio: gran vitalidad y resistencia física. Energía abundante.",
      "Línea doble: tienes una protección espiritual fuerte o 'ángel guardián'.",
      "Cambios en el trazo: eres capaz de reinventarte completamente como el fénix."
    ]
  },
  fate: {
    name: "Línea del Destino",
    readings: [
      "Línea vertical fuerte: tienes un propósito claro y determinación férrea.",
      "Línea tenue o cambiante: tu camino profesional será variado y múltiple.",
      "Nace en la luna: tu éxito vendrá de la creatividad o el contacto con el público."
    ]
  }
};

const PalmistryService = () => {
  const [activeLine, setActiveLine] = useState(null);
  const [reading, setReading] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLineClick = (lineId) => {
    if (isAnimating) return;
    
    setActiveLine(lineId);
    setReading(null);
    setIsAnimating(true);

    // Simular petición al backend y tiempo de "trazado"
    setTimeout(() => {
      const data = MOCK_READINGS[lineId];
      const randomMsg = data.readings[Math.floor(Math.random() * data.readings.length)];
      
      setReading({
        name: data.name,
        text: randomMsg
      });
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <div className="palm-container">
      <div className="palm-header">
        <h2>La Lectura de la Palma</h2>
        <p className="velora-whisper">
          "El mapa de tu destino está grabado en tu piel. Toca una línea para revelar su secreto."
        </p>
      </div>

      <div className="palm-workspace">
        
        {/* --- MANO SVG INTERACTIVA --- */}
        <div className="hand-visual">
          <svg viewBox="0 0 300 400" className="palm-svg">
            {/* 1. SILUETA DE LA MANO (Fondo) */}
            <path 
              className="hand-outline"
              d="M80,380 L80,300 C60,280 20,240 30,190 C35,160 50,180 60,190 L70,120 C70,90 90,90 95,120 L105,60 C105,30 135,30 140,60 L155,50 C165,20 190,30 190,60 L205,90 C220,70 240,90 230,120 C230,160 230,220 230,250 C230,320 200,380 200,380 Z"
            />

            {/* 2. LÍNEAS INTERACTIVAS */}
            
            {/* Línea de la Vida (Curva alrededor del pulgar) */}
            <path 
              id="life"
              className={`palm-line ${activeLine === 'life' ? 'active' : ''}`}
              d="M100,160 Q90,250 130,330"
              onClick={() => handleLineClick('life')}
            />
            
            {/* Línea de la Cabeza (Horizontal media) */}
            <path 
              id="head"
              className={`palm-line ${activeLine === 'head' ? 'active' : ''}`}
              d="M100,165 Q160,200 220,180"
              onClick={() => handleLineClick('head')}
            />
            
            {/* Línea del Corazón (Superior) */}
            <path 
              id="heart"
              className={`palm-line ${activeLine === 'heart' ? 'active' : ''}`}
              d="M220,130 Q160,160 110,130"
              onClick={() => handleLineClick('heart')}
            />

            {/* Línea del Destino (Vertical central) */}
            <path 
              id="fate"
              className={`palm-line ${activeLine === 'fate' ? 'active' : ''}`}
              d="M150,330 Q150,250 150,170"
              onClick={() => handleLineClick('fate')}
            />
            
            {/* Etiquetas flotantes (opcionales) */}
            <text x="50" y="300" className="line-label">Vida</text>
            <text x="240" y="130" className="line-label">Corazón</text>
            <text x="240" y="190" className="line-label">Cabeza</text>
            <text x="160" y="350" className="line-label">Destino</text>

          </svg>
          
          {/* Instrucción visual si no hay nada seleccionado */}
          {!activeLine && <div className="hand-hint">Pasa el ratón sobre las líneas</div>}
        </div>

        {/* --- PANEL DE LECTURA --- */}
        <div className="reading-panel">
          {activeLine ? (
            <div className={`reading-card ${reading ? 'visible' : 'loading'}`}>
              <h3>{MOCK_READINGS[activeLine].name}</h3>
              {reading ? (
                <>
                  <p className="reading-text">{reading.text}</p>
                  <div className="palm-separator">✦</div>
                  <button className="reset-palm-btn" onClick={() => {setActiveLine(null); setReading(null);}}>
                    Leer otra línea
                  </button>
                </>
              ) : (
                <p className="analyzing-text">Interpretando trazo...</p>
              )}
            </div>
          ) : (
            <div className="palm-intro">
              <h3>Guía de Quiromancia</h3>
              <ul>
                <li><strong>♥ Corazón:</strong> Emociones y relaciones.</li>
                <li><strong>🧠 Cabeza:</strong> Intelecto y mentalidad.</li>
                <li><strong>🌱 Vida:</strong> Vitalidad y energía.</li>
                <li><strong>⚡ Destino:</strong> Carrera y propósito.</li>
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PalmistryService;