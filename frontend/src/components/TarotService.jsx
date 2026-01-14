import React, { useState } from 'react';
import './TarotService.css';

// --- CONFIGURACIÓN DE TIRADAS ---
const SPREAD_OPTIONS = [
  {
    id: 'one-card',
    title: 'Consejo del Día',
    cards: 1,
    description: 'Un mensaje directo para meditar hoy.',
    positions: ['El Consejo']
  },
  {
    id: 'three-card',
    title: 'Pasado, Presente, Futuro',
    cards: 3,
    description: 'Entiende el origen, la situación y el destino.',
    positions: ['El Pasado', 'El Presente', 'El Futuro']
  },
  {
    id: 'celtic-cross',
    title: 'La Cruz Celta',
    cards: 10,
    description: 'Análisis profundo de una situación compleja.',
    positions: [
      'La Situación', 'El Desafío', 'El Origen', 'El Pasado Reciente', 
      'La Corona', 'El Futuro Inmediato', 'El Consultante', 
      'El Entorno', 'Esperanzas', 'El Resultado Final'
    ]
  }
];

// --- BIBLIOTECA DE SIGNIFICADOS (Simulación de Base de Datos) ---
// Aquí definimos qué dice Velora para cada carta (0, 1, 2...)
const CARD_LIBRARY = {
  0: {
    name: "El Loco",
    upright: "Estás ante un nuevo comienzo. Velora ve en ti la inocencia necesaria para dar ese salto de fe, aunque el abismo parezca profundo. Confía en el viaje.",
    reversed: "Ten cuidado con la impulsividad. Estás a punto de tomar una decisión sin medir las consecuencias reales. Detente y observa antes de saltar."
  },
  1: {
    name: "El Mago",
    upright: "Tienes todas las herramientas sobre la mesa. La voluntad es tuya; lo que manifiestes ahora tiene el poder de transformar tu realidad tangible.",
    reversed: "Sientes un bloqueo creativo o falta de voluntad. Tienes el talento, pero la duda te impide canalizar tu energía. La magia está latente, no ausente."
  },
  2: {
    name: "La Sacerdotisa",
    upright: "El velo se levanta. No busques respuestas en el ruido exterior; Velora te invita a escuchar tu intuición y los secretos que guardas en silencio.",
    reversed: "Estás ignorando tu voz interior por escuchar a los demás. Hay un secreto o una verdad oculta que te niegas a aceptar en este momento."
  }
};

// --- GENERADOR DE LECTURA DINÁMICA ---
const generateMockReading = (numCards, positions) => {
  return Array.from({ length: numCards }, (_, i) => {
    // Para probar, rotamos entre las cartas 0, 1 y 2 que tienes en la carpeta
    // (Cuando tengas las 78, esto será un Math.random() real)
    const cardId = i % 3; 
    
    // Aleatoriedad: 30% de probabilidad de que salga invertida
    const isInverted = Math.random() > 0.7;
    
    // Recuperamos los datos de la biblioteca
    const cardData = CARD_LIBRARY[cardId] || { 
      name: `Arcano ${cardId}`, 
      upright: "Un misterio aún no revelado.", 
      reversed: "Un misterio aún no revelado." 
    };

    return {
      id: cardId,
      name: cardData.name,
      position_name: positions[i] || `Posición ${i + 1}`,
      is_inverted: isInverted,
      // Elegimos el texto según si está invertida o no
      interpretation: isInverted ? cardData.reversed : cardData.upright
    };
  });
};

const TarotService = () => {
  const [readingState, setReadingState] = useState('menu'); // menu, idle, shuffling, dealt
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [cards, setCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState({});

  // Seleccionar tipo de tirada
  const selectSpread = (spread) => {
    setSelectedSpread(spread);
    setReadingState('idle');
  };

  // Iniciar lectura
  const startReading = () => {
    setReadingState('shuffling');
    
    // Simulamos tiempo de "barajar"
    setTimeout(() => {
      const newCards = generateMockReading(selectedSpread.cards, selectedSpread.positions);
      setCards(newCards);
      setReadingState('dealt');
      setRevealedCards({});
    }, 2500); // 2.5 segundos de suspense
  };

  const handleCardClick = (index) => {
    if (readingState === 'dealt' && !revealedCards[index]) {
      setRevealedCards(prev => ({ ...prev, [index]: true }));
    }
  };

  const resetReading = () => {
    setReadingState('menu');
    setSelectedSpread(null);
    setCards([]);
    setRevealedCards({});
  };

  return (
    <div className="tarot-service-container">
      
      {/* HEADER DINÁMICO */}
      <div className="tarot-header">
        <h2>{selectedSpread ? selectedSpread.title : "El Espejo de los Arcanos"}</h2>
        <p className="velora-whisper">
          {selectedSpread 
            ? "Concéntrate en tu pregunta y toca el mazo..." 
            : "Elige la puerta por la que deseas entrar."}
        </p>
      </div>

      {/* VISTA 1: MENÚ DE SELECCIÓN (Estilo Épico) */}
      {readingState === 'menu' && (
        <div className="spread-selector-container">
          {SPREAD_OPTIONS.map((option) => (
            <div 
              key={option.id} 
              className="menu-option-group" 
              onClick={() => selectSpread(option)}
            >
              {/* LA CARTA VISUAL */}
              <div className="menu-card-visual">
                <div className="menu-card-inner">
                  <img src="/assets/tarot_cards/back.png" alt="Reverso" />
                  <div className="menu-card-symbol">
                    {option.cards === 1 && "I"}
                    {option.cards === 3 && "III"}
                    {option.cards === 10 && "✛"}
                  </div>
                </div>
              </div>

              {/* EL TEXTO */}
              <div className="menu-text-info">
                <h3>{option.title}</h3>
                <span className="menu-subtitle">{option.cards} {option.cards === 1 ? 'Carta' : 'Cartas'}</span>
                <p>{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA 2: MESA DE JUEGO */}
      {readingState !== 'menu' && (
        <div className="tarot-table">
          
          {/* MAZO CERRADO */}
          {readingState !== 'dealt' && (
            <div className={`deck-container ${readingState === 'shuffling' ? 'shaking' : ''}`} onClick={readingState === 'idle' ? startReading : null}>
              <div className="card-back-stack">
                <img src="/assets/tarot_cards/back.png" alt="Reverso" className="stack-layer layer-1" />
                <img src="/assets/tarot_cards/back.png" alt="Reverso" className="stack-layer layer-2" />
                <img src="/assets/tarot_cards/back.png" alt="Reverso" className="stack-layer layer-3" />
              </div>
              <div className="deck-instruction">
                {readingState === 'idle' ? 'TOCAR PARA INICIAR' : 'BARAJANDO...'}
              </div>
            </div>
          )}

          {/* CARTAS REPARTIDAS */}
          {readingState === 'dealt' && (
            <div className={`spread-container spread-${selectedSpread.id}`}>
              {cards.map((card, index) => (
                <div key={index} className="card-slot">
                  <div className="position-label">{card.position_name}</div>
                  
                  <div 
                    className={`tarot-card-scene ${revealedCards[index] ? 'is-flipped' : ''}`}
                    onClick={() => handleCardClick(index)}
                  >
                    <div className="tarot-card-inner">
                      <div className="card-face card-back-face">
                        <img src="/assets/tarot_cards/back.png" alt="Reverso" />
                      </div>
                      <div className="card-face card-front-face">
                        <img 
                          src={`/assets/tarot_cards/${card.id}.png`} 
                          alt={card.name} 
                          className={card.is_inverted ? 'inverted-image' : ''}
                        />
                        {/* Overlay textura */}
                        <div className="texture-overlay"></div>
                      </div>
                    </div>
                  </div>

                  {/* AQUÍ SE MUESTRA EL TEXTO ESPECÍFICO DE LA BIBLIOTECA */}
                  <div className={`card-meaning ${revealedCards[index] ? 'visible' : ''}`}>
                    <h3>{card.name} {card.is_inverted && <span className="inverted-tag">(Inv.)</span>}</h3>
                    <p>{card.interpretation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOTÓN VOLVER */}
      {readingState !== 'menu' && (
        <button className="reset-btn" onClick={resetReading}>
          {readingState === 'dealt' && Object.keys(revealedCards).length === cards.length 
            ? "Otra Lectura" 
            : "Volver"}
        </button>
      )}
    </div>
  );
};

export default TarotService;