import React from 'react';
import VeloraLoader from './VeloraLoader';
import { SERVICE_LORE_ROTATION_MS, getServiceLore } from '../data/serviceLore';
import './VeloraInsightCard.css';

const SECTION_HEADINGS = new Set([
  'los signos revelados',
  'el hilo oculto',
  'la corriente visible',
  'la corriente de fondo',
  'lectura de conjunto',
  'reflejo practico',
  'reflejo práctico',
]);

function classifyInsightLine(line) {
  const normalized = line
    .replace(/^#+\s*/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/:$/, '')
    .trim()
    .toLowerCase();

  if (SECTION_HEADINGS.has(normalized)) return 'heading';
  if (/^[-•]\s+/.test(line)) return 'list';
  return 'paragraph';
}

function renderInlineEmphasis(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

export default function VeloraInsightCard({ insight }) {
  const status = insight?.status || 'idle';
  const service = insight?.service;
  const text = insight?.text || '';

  const lore = React.useMemo(
    () => getServiceLore(service),
    [service]
  );
  const [activeLoreIndex, setActiveLoreIndex] = React.useState(0);

  React.useEffect(() => {
    if (status !== 'loading') return undefined;

    const itemCount = lore.items.length;
    setActiveLoreIndex(Math.floor(Math.random() * itemCount));

    const interval = window.setInterval(() => {
      setActiveLoreIndex(prev => {
        if (itemCount < 2) return 0;
        const offset = 1 + Math.floor(Math.random() * (itemCount - 1));
        return (prev + offset) % itemCount;
      });
    }, SERVICE_LORE_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, [status, service, lore.items.length]);

  if (!insight || status === 'idle') return null;

  const paragraphs = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  const activeLore = lore.items[activeLoreIndex % lore.items.length];
  const isFlipped = status === 'ready' || status === 'error';

  return (
    <section
      className={`velora-insight-card is-${status} ${isFlipped ? 'is-flipped' : ''}`}
      aria-live="polite"
    >
      <div className="velora-insight-flipper">
        <article className="velora-insight-frame velora-insight-face velora-insight-face--front">
          <div className="velora-frame-corner corner-tl" aria-hidden="true" />
          <div className="velora-frame-corner corner-tr" aria-hidden="true" />
          <div className="velora-frame-corner corner-bl" aria-hidden="true" />
          <div className="velora-frame-corner corner-br" aria-hidden="true" />
          <div className="velora-flourish velora-flourish--bottom" aria-hidden="true" />

          <div className="velora-insight-header">
            <span className="velora-insight-kicker">Mientras Velora lee</span>
            <h3>{service || 'Lectura activa'}</h3>
          </div>
          <div className="velora-flourish velora-flourish--top" aria-hidden="true" />

          <div className="velora-insight-loading">
            <div className="velora-wait-orb">
              <VeloraLoader compact />
            </div>

            <div className="velora-lore-panel" key={`${service}-${activeLore.title}`}>
              <span>{activeLore.kind}</span>
              <h4>{activeLore.title}</h4>
              <p>{activeLore.body}</p>
            </div>

            <div className="velora-lore-purpose">
              <span>Finalidad del servicio</span>
              <p>{lore.purpose}</p>
            </div>
          </div>
        </article>

        <article className="velora-insight-frame velora-insight-face velora-insight-face--back">
          <div className="velora-frame-corner corner-tl" aria-hidden="true" />
          <div className="velora-frame-corner corner-tr" aria-hidden="true" />
          <div className="velora-frame-corner corner-bl" aria-hidden="true" />
          <div className="velora-frame-corner corner-br" aria-hidden="true" />
          <div className="velora-flourish velora-flourish--bottom" aria-hidden="true" />

          <div className="velora-insight-header">
            <span className="velora-insight-kicker">Velora interpreta</span>
            <h3>{service || 'Lectura activa'}</h3>
          </div>
          <div className="velora-flourish velora-flourish--top" aria-hidden="true" />

          {status === 'ready' && (
            <div className="velora-insight-copy">
              {paragraphs.map((paragraph, index) => {
                const lineType = classifyInsightLine(paragraph);
                const cleanParagraph = paragraph.replace(/^[-•]\s+/, '');

                if (lineType === 'heading') {
                  return (
                    <h4 key={index}>
                      {cleanParagraph.replace(/^\*\*|\*\*$/g, '').replace(/:$/, '')}
                    </h4>
                  );
                }

                return (
                  <p key={index} className={lineType === 'list' ? 'is-list-line' : undefined}>
                    {renderInlineEmphasis(cleanParagraph)}
                  </p>
                );
              })}
            </div>
          )}

          {status === 'error' && (
            <p className="velora-insight-error">
              No he podido preparar la interpretación de Velora en este momento.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
