import React, { useEffect, useState } from 'react';
import './TarotService.css';
import VeloraLoader from './VeloraLoader';

// --- CONFIGURACIÓN DE LAS 3 TIRADAS ---
const SPREAD_OPTIONS = [
  {
    id: 'one-card',
    title: 'Consejo del Día',
    cards: 1,
    description: 'Un mensaje directo y rápido para meditar hoy.',
    positions: ['El Consejo']
  },
  {
    id: 'three-card',
    title: 'Pasado, Presente, Futuro',
    cards: 3,
    description: 'La tríada clásica: origen, situación y destino.',
    positions: ['El Origen', 'El Foco', 'El Destino']
  },
  {
    id: 'five-card',
    title: 'La Estrella de la Verdad',
    cards: 5,
    description: 'Análisis profundo: influencias, obstáculos y desenlace.',
    positions: ['La Situación', 'El Desafío', 'La Cima', 'La Raíz', 'El Resultado']
  }
];

const TarotService = ({ onServiceResult }) => {
  const [readingState, setReadingState] = useState('menu');
  const [selectedSpread, setSelectedSpread] = useState(null);
  
  const [cards, setCards] = useState([]);
  
  const [revealedCards, setRevealedCards] = useState({});
  const [failedImages, setFailedImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Seleccionar tipo de tirada
  const selectSpread = (spread) => {
    setSelectedSpread(spread);
    setReadingState('idle');
  };

  const startReading = async () => {
    setReadingState('shuffling');
    setIsLoading(true);
    setFailedImages({});

    try {
      const response = await fetch('http://localhost:8000/tarot/tirada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: selectedSpread.id }),
      });

      if (!response.ok) throw new Error('Error en el oráculo');
      const data = await response.json();

      // Ajustamos posiciones visuales si vienen del backend o usamos las predefinidas
      const cardsWithPos = data.visual_data.map((c, i) => ({
        ...c,
        position: selectedSpread.positions[i] || `Carta ${i+1}`
      }));

      setTimeout(() => {
        setCards(cardsWithPos);
        setReadingState('dealt');
        setIsLoading(false);
        setRevealedCards({});
        setFailedImages({});
      }, 2000);

    } catch (error) {
      console.error("Error:", error);
      alert("Velora guarda silencio. Verifica el backend.");
      setReadingState('idle');
      setIsLoading(false);
    }
  };

  const handleCardClick = (index) => {
    if (readingState === 'dealt' && !revealedCards[index]) {
      setRevealedCards(prev => ({ ...prev, [index]: true }));
    }
  };

  const handleImageError = (index) => {
    setFailedImages(prev => ({ ...prev, [index]: true }));
  };

  const getCardImagePath = (card) => {
    const imageName = card?.img || `${card?.id}.png`;
    return `/assets/tarot_cards/${imageName}`;
  };

  const resetReading = () => {
    setReadingState('menu');
    setSelectedSpread(null);
    setCards([]);
    onServiceResult?.(null);
    setRevealedCards({});
    setFailedImages({});
  };

  const allRevealed = cards.length > 0 && Object.keys(revealedCards).length === cards.length;

  useEffect(() => {
    if (!allRevealed) return;

    onServiceResult?.({
      spread: selectedSpread,
      cards,
    });
  }, [allRevealed, cards, onServiceResult, selectedSpread]);

  return (
    <div className="tarot-service-container">
      <section className={`tarot-panel tarot-panel--${readingState}`} aria-labelledby="tarot-title">
        <div className="tarot-card-geometry" aria-hidden="true" />
      
      <div className="tarot-header">
        <span className="tarot-kicker">Tarot ceremonial</span>
        <h2 id="tarot-title">{selectedSpread ? selectedSpread.title : "El Espejo de los Arcanos"}</h2>
        <p className="velora-whisper">
          {selectedSpread ? "Concéntrate en tu intención..." : "Elige la puerta por la que deseas entrar."}
        </p>
      </div>

      {/* MENÚ DE 3 OPCIONES */}
      {readingState === 'menu' && (
        <div className="spread-selector-container">
          {SPREAD_OPTIONS.map((option) => (
            <div key={option.id} className="menu-option-group" onClick={() => selectSpread(option)}>
              <div className="menu-card-visual">
                <div className="menu-card-inner">
                  <img src="/assets/tarot_cards/back.png" alt="Reverso" />
                  <div className="menu-card-symbol">
                    {option.cards === 1 && "I"}
                    {option.cards === 3 && "III"}
                    {option.cards === 5 && "V"}
                  </div>
                </div>
              </div>
              <div className="menu-text-info">
                <h3>{option.title}</h3>
                <span className="menu-subtitle">{option.cards} Cartas</span>
                <p>{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESTO DEL COMPONENTE (Mesa y Cartas) - IGUAL QUE ANTES */}
      {readingState !== 'menu' && (
        <div className="tarot-table">
          {readingState !== 'dealt' && (
            <div className={`deck-container ${readingState === 'shuffling' ? 'shaking' : ''}`} onClick={readingState === 'idle' ? startReading : null}>
              <div className="card-back-stack">
                <img src="/assets/tarot_cards/back.png" className="stack-layer layer-1" alt="" />
                <img src="/assets/tarot_cards/back.png" className="stack-layer layer-2" alt="" />
                <img src="/assets/tarot_cards/back.png" className="stack-layer layer-3" alt="" />
              </div>
              <div className="deck-instruction">{isLoading ? 'BARAJANDO CARTAS...' : 'TOCAR PARA INICIAR'}</div>
              {isLoading && (
                <VeloraLoader message="Barajando arcanos..." compact />
              )}
            </div>
          )}

          {readingState === 'dealt' && (
            /* Añadimos clase dinámica para ajustar CSS según sean 1, 3 o 5 cartas */
            <div className={`spread-container spread-${selectedSpread.id}`}>
              {cards.map((card, index) => (
                <div key={index} className="card-slot">
                  <div className="position-label">{card.position}</div>
                  <div className={`tarot-card-scene ${revealedCards[index] ? 'is-flipped' : ''}`} onClick={() => handleCardClick(index)}>
                    <div className="tarot-card-inner">
                      <div className="card-face card-back-face">
                        <img src="/assets/tarot_cards/back.png" alt="Reverso" />
                      </div>
                      <div className={`card-face card-front-face ${failedImages[index] ? 'is-missing' : ''}`}>
                        {failedImages[index] ? (
                          <div className="tarot-missing-card">
                            <span>Imagen pendiente</span>
                            <strong>{card.nombre}</strong>
                          </div>
                        ) : (
                          <img
                            src={getCardImagePath(card)}
                            alt={card.nombre}
                            className={card.invertida ? 'inverted-image' : ''}
                            onError={() => handleImageError(index)}
                          />
                        )}
                        <div className="texture-overlay"></div>
                      </div>
                    </div>
                  </div>
                  <div className={`card-meaning ${revealedCards[index] ? 'visible' : ''}`}>
                    <h3>{card.nombre} {card.invertida && <span className="inverted-tag">(Inv.)</span>}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {allRevealed && (
        <button className="reset-btn" onClick={resetReading}>
          <span>Nueva Lectura</span>
        </button>
      )}
      </section>
    </div>
  );
};

export default TarotService;
