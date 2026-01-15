import React, { useState } from 'react';
import './RunesService.css';

// --- CONFIGURACIÓN DE TIRADAS ---
const RUNE_SPREADS = [
  {
    id: 'odin-one',
    title: 'El Consejo de Odín',
    count: 1,
    description: 'Una única runa para una respuesta directa y certera.',
    positions: ['La Respuesta']
  },
  {
    id: 'norns-three',
    title: 'Las Tres Nornas',
    count: 3,
    description: 'Urd (Pasado), Verdandi (Presente) y Skuld (Futuro).',
    positions: ['El Origen (Urd)', 'El Devenir (Verdandi)', 'El Destino (Skuld)']
  },
  {
    id: 'elemental-five',
    title: 'La Cruz Elemental',
    count: 5,
    description: 'Panorama completo de una situación compleja.',
    positions: ['El Pasado', 'Tú Ahora', 'El Futuro', 'El Reto', 'La Ayuda']
  }
];

// --- DATOS DE RUNAS (Copia exacta de tu JSON mejorado) ---
const RUNES_DATA = [
  { id: "fehu", name: "Fehu", symbol: "ᚠ", meaning: "Abundancia, prosperidad, energía creadora.", reversed: "Pérdida de recursos, codicia, desequilibrio.", symmetrical: false },
  { id: "uruz", name: "Uruz", symbol: "ᚢ", meaning: "Fuerza, salud y voluntad indomable.", reversed: "Temor, debilidad, estancamiento.", symmetrical: false },
  { id: "thurisaz", name: "Thurisaz", symbol: "ᚦ", meaning: "Protección, desafío y despertar interior.", reversed: "Conflicto, impaciencia, dolor inesperado.", symmetrical: false },
  { id: "ansuz", name: "Ansuz", symbol: "ᚨ", meaning: "Comunicación, inspiración divina.", reversed: "Malentendidos, palabras hirientes, bloqueo.", symmetrical: false },
  { id: "raidho", name: "Raido", symbol: "ᚱ", meaning: "Viaje, movimiento con propósito.", reversed: "Desorientación, retrasos, indecisión.", symmetrical: false },
  { id: "kenaz", name: "Kenaz", symbol: "ᚲ", meaning: "Conocimiento, transformación y fuego interior.", reversed: "Oscuridad interna, bloqueo creativo, confusión.", symmetrical: false },
  { id: "gebo", name: "Gebo", symbol: "ᚷ", meaning: "Generosidad, intercambio equilibrado.", reversed: "Desequilibrio en dar y recibir, dependencia.", symmetrical: true },
  { id: "wunjo", name: "Wunjo", symbol: "ᚹ", meaning: "Alegría, armonía y plenitud.", reversed: "Insatisfacción, discordia, pérdida de gozo.", symmetrical: false },
  { id: "hagalaz", name: "Hagal", symbol: "ᚺ", meaning: "Cambio repentino, purificación.", reversed: "Destrucción innecesaria, caos sin propósito.", symmetrical: true },
  { id: "nauthiz", name: "Nauthiz", symbol: "ᚾ", meaning: "Necesidad, resistencia a la adversidad.", reversed: "Miedo paralizante, obstáculo persistente.", symmetrical: false },
  { id: "isa", name: "Isa", symbol: "ᛁ", meaning: "Estasis, pausa y reflexión profunda.", reversed: "Estancamiento destructivo, inacción prolongada.", symmetrical: true },
  { id: "jera", name: "Jera", symbol: "ᛃ", meaning: "Cosecha, ciclos y retribución.", reversed: "Retraso en recompensas, injusticia.", symmetrical: true },
  { id: "eihwaz", name: "Eihwaz", symbol: "ᛇ", meaning: "Protección, conexión entre mundos.", reversed: "Desorientación, bloqueo espiritual.", symmetrical: true },
  { id: "perthro", name: "Perthro", symbol: "ᛈ", meaning: "Destino, misterio y potencial oculto.", reversed: "Secreto revelado prematuramente, incertidumbre.", symmetrical: false },
  { id: "algiz", name: "Algiz", symbol: "ᛉ", meaning: "Defensa, guía espiritual.", reversed: "Vulnerabilidad, falta de guía.", symmetrical: false },
  { id: "sowilo", name: "Sowilo", symbol: "ᛋ", meaning: "Éxito, energía vital y logro.", reversed: "Derrota, falta de dirección.", symmetrical: true },
  { id: "tiwaz", name: "Tiwaz", symbol: "ᛏ", meaning: "Justicia, coraje y sacrificio.", reversed: "Injusticia, cobardía.", symmetrical: false },
  { id: "berkano", name: "Berkano", symbol: "ᛒ", meaning: "Renacimiento, crecimiento y fertilidad.", reversed: "Estancamiento creativo, infertilidad.", symmetrical: false },
  { id: "ehwaz", name: "Ehwaz", symbol: "ᛖ", meaning: "Movimiento, cambio fluido y confianza.", reversed: "Traición, desconfianza.", symmetrical: false },
  { id: "mannaz", name: "Mannaz", symbol: "ᛗ", meaning: "Humanidad, cooperación y comunidad.", reversed: "Aislamiento, egoísmo.", symmetrical: false },
  { id: "laguz", name: "Laguz", symbol: "ᛚ", meaning: "Intuición, emoción y fluir.", reversed: "Resistencia al cambio, bloqueo emocional.", symmetrical: false },
  { id: "ingwaz", name: "Ingwaz", symbol: "ᛝ", meaning: "Potencial creativo y gestación.", reversed: "Bloqueo de proyectos, impulsos reprimidos.", symmetrical: true },
  { id: "dagaz", name: "Dagaz", symbol: "ᛞ", meaning: "Renacimiento, iluminación y claridad.", reversed: "Estancamiento, confusión.", symmetrical: true },
  { id: "othala", name: "Othala", symbol: "ᛟ", meaning: "Herencia, legado y seguridad.", reversed: "Desarraigo, desorden familiar.", symmetrical: false }
];

const RunesService = () => {
  const [state, setState] = useState('menu'); // menu, shuffling, cast
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [runes, setRunes] = useState([]);
  const [revealedRunes, setRevealedRunes] = useState({});

  // Función para mezclar array (Fisher-Yates)
  const shuffleArray = (array) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const selectSpread = (spread) => {
    setSelectedSpread(spread);
    setState('shuffling'); // Pasamos directo a la bolsa
  };

  const castRunes = () => {
    setState('casting');
    
    setTimeout(() => {
      // 1. Seleccionar N runas al azar
      const shuffled = shuffleArray(RUNES_DATA);
      const selected = shuffled.slice(0, selectedSpread.count);

      // 2. Procesar inversión y rotación visual
      const castResult = selected.map((rune, index) => {
        const isInverted = Math.random() > 0.6; // 40% chance de invertida
        
        // Rotación visual aleatoria para que parezcan piedras naturales (-10deg a 10deg)
        // Si está invertida y NO es simétrica, sumamos 180deg.
        const randomTilt = Math.floor(Math.random() * 20) - 10; 
        const rotation = (isInverted && !rune.symmetrical) ? 180 + randomTilt : randomTilt;

        return {
          ...rune,
          isInverted,
          rotation, 
          positionName: selectedSpread.positions[index] || `Runa ${index + 1}`,
          interpretation: (isInverted && rune.reversed) ? rune.reversed : rune.meaning
        };
      });

      setRunes(castResult);
      setState('cast');
      setRevealedRunes({});
    }, 2000);
  };

  const handleRuneClick = (index) => {
    if (state === 'cast' && !revealedRunes[index]) {
      setRevealedRunes(prev => ({ ...prev, [index]: true }));
    }
  };

  const reset = () => {
    setState('menu');
    setRunes([]);
    setRevealedRunes({});
    setSelectedSpread(null);
  };

  return (
    <div className="runes-service-container">
      
      {/* HEADER */}
      <div className="runes-header">
        <h2>El Susurro de las Runas</h2>
        <p className="velora-whisper">
          {state === 'menu' 
            ? "Las piedras antiguas conocen los caminos ocultos." 
            : "Agita la bolsa y deja que el destino caiga."}
        </p>
      </div>

      {/* 1. MENÚ DE SELECCIÓN */}
      {state === 'menu' && (
        <div className="rune-menu">
          {RUNE_SPREADS.map(spread => (
            <div key={spread.id} className="rune-option" onClick={() => selectSpread(spread)}>
              <div className="rune-option-icon">
                {/* Símbolos decorativos para el menú */}
                {spread.count === 1 && "ᚠ"}
                {spread.count === 3 && "ᛯ"}
                {spread.count === 5 && "ᛸ"}
              </div>
              <h3>{spread.title}</h3>
              <p>{spread.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* 2. LA BOLSA (Shuffling) */}
      {(state === 'shuffling' || state === 'casting') && (
        <div className="pouch-container" onClick={state === 'shuffling' ? castRunes : null}>
          <div className={`rune-pouch ${state === 'casting' ? 'shaking-pouch' : ''}`}>
             <img src="/assets/icons/runas.png" alt="Bolsa de Runas" className="pouch-img" />
             {/* Partículas o brillo podrían ir aquí */}
          </div>
          <p className="pouch-instruction">
            {state === 'casting' ? "CONSULTANDO A LAS NORNAS..." : "TOCA LA BOLSA PARA LANZAR"}
          </p>
        </div>
      )}

      {/* 3. MESA DE LECTURA */}
      {state === 'cast' && (
        <div className="runes-table">
          <div className="runes-spread">
            {runes.map((rune, index) => (
              <div key={rune.id} className="rune-slot">
                <div className="position-label-rune">{rune.positionName}</div>
                
                {/* LA PIEDRA RÚNICA */}
                <div 
                  className={`rune-stone ${revealedRunes[index] ? 'revealed' : 'hidden'} ${rune.isInverted && !rune.symmetrical ? 'inverted-stone' : ''}`}
                  onClick={() => handleRuneClick(index)}
                  style={{ transform: `rotate(${rune.rotation}deg)` }}
                >
                  <div className="rune-face front">
                    {/* El símbolo Unicode renderizado como tallado */}
                    <span className="rune-symbol">{rune.symbol}</span>
                  </div>
                  <div className="rune-face back">
                    {/* Textura de piedra lisa para cuando está boca abajo */}
                  </div>
                </div>

                {/* INTERPRETACIÓN */}
                <div className={`rune-meaning ${revealedRunes[index] ? 'visible' : ''}`}>
                  <h3>{rune.name} {rune.isInverted && <span className="inv-tag">(Inv.)</span>}</h3>
                  <p>{rune.interpretation}</p>
                </div>
              </div>
            ))}
          </div>
          
          {Object.keys(revealedRunes).length === runes.length && (
             <button className="rune-reset-btn" onClick={reset}>Nueva Consulta</button>
          )}
        </div>
      )}

    </div>
  );
};

export default RunesService;