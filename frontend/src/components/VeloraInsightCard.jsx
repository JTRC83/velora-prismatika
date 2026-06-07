import React from 'react';
import VeloraLoader from './VeloraLoader';
import './VeloraInsightCard.css';

export default function VeloraInsightCard({ insight }) {
  if (!insight || insight.status === 'idle') return null;

  const paragraphs = (insight.text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  return (
    <section className={`velora-insight-card is-${insight.status}`} aria-live="polite">
      <div className="velora-insight-frame">
        <div className="velora-insight-header">
          <span className="velora-insight-kicker">Velora interpreta</span>
          <h3>{insight.service || 'Lectura activa'}</h3>
        </div>

        {insight.status === 'loading' && (
          <div className="velora-insight-loading">
            <VeloraLoader compact />
            <p>La explicación se está preparando en segundo plano.</p>
          </div>
        )}

        {insight.status === 'ready' && (
          <div className="velora-insight-copy">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        {insight.status === 'error' && (
          <p className="velora-insight-error">
            No he podido preparar la interpretación de Velora en este momento.
          </p>
        )}
      </div>
    </section>
  );
}
