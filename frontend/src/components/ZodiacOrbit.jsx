import React from 'react';
import './ZodiacOrbit.css';

const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const planetSymbols = ['☿', '♁', '♂', '♃', '♄', '♅', '♆'];

function renderSymbols(symbols, className, depth) {
  return symbols.map((symbol, i) => (
    <div
      key={`${depth}-${className}-${symbol}-${i}`}
      className={`symbol ${className}`}
      style={{ '--i': i }}
    >
      {symbol}
    </div>
  ));
}

function ZodiacGrid() {
  return (
    <svg className="zodiac-grid" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="90" />
      <circle cx="100" cy="100" r="74" />
      <circle cx="100" cy="100" r="58" />
    </svg>
  );
}

export default function ZodiacOrbit() {
  return (
    <div className="zodiac-wrapper">
      <div className="orbit-layer orbit-layer-back">
        <div className="orbit zodiac orbit-back">
          <ZodiacGrid />
          {renderSymbols(zodiacSymbols, 'zodiac-symbol', 'back')}
        </div>

        <div className="orbit planets orbit-back">
          {renderSymbols(planetSymbols, 'planet-symbol', 'back')}
        </div>
      </div>

      <div className="sun">
        <img src="/assets/soLuna.png" alt="Sol" className="sun-img" />
      </div>

      <div className="orbit-layer orbit-layer-front">
        <div className="orbit zodiac orbit-front">
          <ZodiacGrid />
          {renderSymbols(zodiacSymbols, 'zodiac-symbol', 'front')}
        </div>

        <div className="orbit planets orbit-front">
          {renderSymbols(planetSymbols, 'planet-symbol', 'front')}
        </div>
      </div>
    </div>
  );
}
