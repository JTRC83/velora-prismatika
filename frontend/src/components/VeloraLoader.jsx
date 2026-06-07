import React from 'react';
import './VeloraLoader.css';

export default function VeloraLoader({ message = 'Velora está consultando el símbolo...', compact = false, className = '' }) {
  const classes = ['velora-loader', compact ? 'velora-loader--compact' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status" aria-live="polite" aria-label={message}>
      <div className="velora-hourglass-background" aria-hidden="true">
        <div className="velora-hourglass-container">
          <div className="velora-hourglass-curves" />
          <div className="velora-hourglass-cap-top" />
          <div className="velora-hourglass-glass-top" />
          <div className="velora-hourglass-sand" />
          <div className="velora-hourglass-sand-stream" />
          <div className="velora-hourglass-cap-bottom" />
          <div className="velora-hourglass-glass" />
        </div>
      </div>
    </div>
  );
}
