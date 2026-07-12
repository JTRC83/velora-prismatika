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

const getSpreadServiceName = (spread) => {
  if (!spread) return 'Tarot';
  return spread.title;
};

const TarotService = ({ onServiceResult, onServiceLabelChange }) => {
  const [readingState, setReadingState] = useState('menu');
  const [selectedSpread, setSelectedSpread] = useState(null);
  
  const [cards, setCards] = useState([]);
  const [readingMeta, setReadingMeta] = useState(null);
  
  const [revealedCards, setRevealedCards] = useState({});
  const [failedImages, setFailedImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Seleccionar tipo de tirada
  const selectSpread = (spread) => {
    setSelectedSpread(spread);
    onServiceLabelChange?.(getSpreadServiceName(spread));
    setReadingState('idle');
    setError(null);
  };

  const startReading = async () => {
    setReadingState('shuffling');
    setIsLoading(true);
    setFailedImages({});
    setError(null);

    try {
      const response = await fetch('/tarot/tirada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: selectedSpread.id }),
      });

      if (!response.ok) {
        let detail = '';
        try {
          const errorBody = await response.json();
          detail = errorBody.detail || JSON.stringify(errorBody);
        } catch {
          detail = await response.text().catch(() => '');
        }
        throw new Error(`Backend respondió ${response.status}${detail ? `: ${detail}` : ''}`);
      }

      const data = await response.json();

      if (!data.visual_data || !Array.isArray(data.visual_data)) {
        throw new Error('La respuesta del backend no contiene cartas válidas (visual_data vacío o inválido).');
      }

      // Ajustamos posiciones visuales si vienen del backend o usamos las predefinidas
      const cardsWithPos = data.visual_data.map((c, i) => ({
        ...c,
        position: selectedSpread.positions[i] || `Carta ${i+1}`
      }));

      setTimeout(() => {
        setCards(cardsWithPos);
        setReadingMeta({
          tipo_tirada: data.tipo_tirada,
          tipo_tirada_nombre: data.tipo_tirada_nombre,
          deck_size: data.deck_size,
          available_image_count: data.available_image_count,
        });
        setReadingState('dealt');
        setIsLoading(false);
        setRevealedCards({});
        setFailedImages({});
      }, 2000);

    } catch (err) {
      const esFalloConexion = err instanceof TypeError;
      setError({
        tipo: esFalloConexion ? 'conexion' : 'backend',
        titulo: esFalloConexion
          ? 'No puedo conectar con el servidor'
          : 'El backend devolvió un error',
        mensaje: esFalloConexion
          ? 'Comprueba que la aplicación esté iniciada por completo.'
          : err.message,
      });
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
    setReadingMeta(null);
    setError(null);
    onServiceLabelChange?.(null);
    onServiceResult?.(null);
    setRevealedCards({});
    setFailedImages({});
  };

  const allRevealed = cards.length > 0 && Object.keys(revealedCards).length === cards.length;

  useEffect(() => {
    if (!allRevealed) return;

    onServiceResult?.({
      serviceName: getSpreadServiceName(selectedSpread),
      serviceType: 'Tarot',
      spread: selectedSpread,
      cards,
      meta: readingMeta,
    });
  }, [allRevealed, cards, onServiceResult, readingMeta, selectedSpread]);

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

      {error && (
        <div className="tarot-error-box">
          <div className="tarot-error-header">
            <span className="tarot-error-icon">❗</span>
            <strong>{error.titulo}</strong>
          </div>
          <p className="tarot-error-message">{error.mensaje}</p>
          <button className="tarot-error-dismiss" onClick={() => setError(null)}>
            Reintentar
          </button>
        </div>
      )}
      </section>
    </div>
  );
};

export default TarotService;
