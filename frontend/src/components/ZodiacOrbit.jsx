import React from 'react';
import './ZodiacOrbit.css';

const zodiacSymbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const planetSymbols = ['☿', '♁', '♂', '♃', '♄', '♅', '♆'];

export default function ZodiacOrbit() {
  return (
    <div className="zodiac-wrapper">
      <div className="orbit zodiac">
        <svg className="zodiac-grid" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={`zodiac-line-${i}`}
                x1="100"
                y1="100"
                x2={100 + 90 * Math.cos(rad)}
                y2={100 + 90 * Math.sin(rad)}
              />
            );
          })}
          <circle cx="100" cy="100" r="65" />
          {[...Array(7)].map((_, i) => {
            const angle = (i * 360) / 7;
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={`planet-line-${i}`}
                x1="100"
                y1="100"
                x2={100 + 65 * Math.cos(rad)}
                y2={100 + 65 * Math.sin(rad)}
              />
            );
          })}
        </svg>

        {zodiacSymbols.map((symbol, i) => (
          <div key={i} className="symbol zodiac-symbol" style={{ '--i': i }}>
            {symbol}
          </div>
        ))}
      </div>

      <div className="orbit planets">
        {planetSymbols.map((symbol, i) => (
          <div key={i} className="symbol planet-symbol" style={{ '--i': i }}>
            {symbol}
          </div>
        ))}
      </div>

      <div className="sun">
        <img src="/assets/soLuna.png" alt="Sol" className="sun-img" />
      </div>
    </div>
  );
}