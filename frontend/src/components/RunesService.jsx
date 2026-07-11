import React, { useState } from 'react';
import './RunesService.css';
import VeloraLoader from './VeloraLoader';

const RUNE_SPREADS = [
  {
    type: 'one',
    number: '01',
    symbol: 'ᚨ',
    title: 'Consejo de Odín',
    count: '1 runa',
    description: 'Una piedra para abrir una dirección clara y directa.',
  },
  {
    type: 'three',
    number: '02',
    symbol: 'ᛜ',
    title: 'Las Tres Nornas',
    count: '3 runas',
    description: 'Origen, presente y tendencia: el hilo completo del momento.',
  },
  {
    type: 'five',
    number: '03',
    symbol: 'ᛉ',
    title: 'La Cruz de Thor',
    count: '5 runas',
    description: 'Una lectura amplia para ver fuerza, desafío y camino.',
  },
];

export default function RunesService({ onServiceResult }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const castRunes = async (type) => {
    setLoading(true);
    setResult(null);
    setError(null);
    onServiceResult?.(null);

    try {
      const res = await fetch('/runes/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: type }),
      });

      if (!res.ok) throw new Error("Las piedras se niegan a hablar hoy.");

      const data = await res.json();

      setTimeout(() => {
        setResult(data);
        onServiceResult?.({
          input: { spread_type: type },
          ...data,
        });
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("El viento del norte ha dispersado la conexión.");
      setLoading(false);
    }
  };

  const runes = result?.visual_data || [];
  const voiceLines = (result?.velora_voice || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const hasRunicVoice = voiceLines.length > 0 || Boolean(result?.reflejo);

  return (
    <div className="runes-container">
      <section className={`runes-panel ${result ? 'runes-panel--result' : 'runes-panel--menu'}`} aria-labelledby="runes-title">
        <div className="runes-card-geometry" aria-hidden="true" />

        <header className="runes-header">
          <span className="runes-kicker">Oráculo rúnico</span>
          <h2 id="runes-title">{result ? result.tipo_tirada : 'Mesa del Norte'}</h2>
          <p>
            {result
              ? 'Las piedras han caído. Lee primero la posición, después el signo y deja que Velora cierre el hilo.'
              : 'Elige cómo quieres abrir la bolsa: una señal directa, el hilo de las Nornas o una cruz completa.'}
          </p>
        </header>

        {!result && !loading && (
          <div className="runes-menu fade-in">
            <div className="runes-oracle-disc" aria-hidden="true">
              <div className="runes-disc">
                <span className="runes-disc-symbol">ᛟ</span>
                <span className="runes-disc-mark runes-disc-mark--top">ᚠ</span>
                <span className="runes-disc-mark runes-disc-mark--right">ᛉ</span>
                <span className="runes-disc-mark runes-disc-mark--bottom">ᛞ</span>
                <span className="runes-disc-mark runes-disc-mark--left">ᚱ</span>
              </div>
            </div>

            <div className="runes-options">
              {RUNE_SPREADS.map((spread) => (
                <button key={spread.type} className="rune-btn" onClick={() => castRunes(spread.type)}>
                  <span className="rune-option-number">{spread.number}</span>
                  <span className="btn-icon">{spread.symbol}</span>
                  <span className="btn-text">
                    <strong>{spread.title}</strong>
                    <small>{spread.count}</small>
                    <span>{spread.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="runes-loading fade-in">
            <VeloraLoader message="Agitando el saco de piel..." compact />
          </div>
        )}

        {result && (
          <div className="runes-result fade-in-up">
            <div className="runes-result-meta">
              <span className="runes-kicker">Lectura emitida</span>
              <p>{runes.length} piedra{runes.length === 1 ? '' : 's'} sobre la mesa.</p>
            </div>

            <div className={`stones-grid stones-grid--${runes.length}`}>
              {runes.map((rune, index) => (
                <article
                  key={`${rune.id}-${index}`}
                  className="rune-card"
                  style={{ '--rune-delay': `${index * 90}ms` }}
                >
                  <div className="rune-stone-wrap">
                    <span className="rune-card-index">{String(index + 1).padStart(2, '0')}</span>
                    <div className={`rune-stone ${rune.inverted ? 'inverted' : ''}`}>
                      <span className="rune-symbol-text">{rune.symbol}</span>
                    </div>
                  </div>

                  <div className="rune-info">
                    <span className="rune-pos">{rune.position_desc}</span>
                    <div className="rune-name-row">
                      <span className="rune-name">
                        {rune.name} {rune.inverted && <small>(Inv.)</small>}
                      </span>
                      <span className="rune-element">{rune.element}</span>
                    </div>
                    <p className="rune-meaning">{rune.meaning_text}</p>
                  </div>
                </article>
              ))}
            </div>

            {hasRunicVoice && (
              <div className="velora-runic-box">
                <span className="runes-kicker">La Voz de Velora</span>
                <h4>Interpretación rúnica</h4>
                {voiceLines.length > 0 && (
                  <div className="runic-prose">
                    {voiceLines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                )}

                {result.reflejo && (
                  <div className="runic-reflection">
                    <span>El reflejo</span>
                    <strong>"{result.reflejo}"</strong>
                  </div>
                )}
              </div>
            )}

            <button
              className="reset-runes-btn"
              onClick={() => {
                setResult(null);
                onServiceResult?.(null);
              }}
            >
              Nueva consulta
            </button>
          </div>
        )}

        {error && <p className="runes-error">{error}</p>}
      </section>
    </div>
  );
}
