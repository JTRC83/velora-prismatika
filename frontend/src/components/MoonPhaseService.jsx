import React, { useState, useEffect } from 'react';
import './AstroService.css'; // Estilos base
import './MoonPhaseService.css'; // Estilos lunares
import VeloraLoader from './VeloraLoader';

const MOON_CALENDAR_DAYS = Array.from({ length: 30 }, (_, index) => index + 1);
const MOON_PHASE_BACKDROP = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'waning-gibbous',
  'last-quarter',
  'waning-crescent',
  'new',
];

function normalizeText(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getMoonArtPhase(phaseName, illumination = 0) {
  const phase = normalizeText(phaseName);
  const light = Number(illumination) || 0;

  if (phase.includes('llena') || light >= 96) return 'full';
  if (phase.includes('cuarto creciente')) return 'first-quarter';
  if (phase.includes('cuarto menguante')) return 'last-quarter';
  if (phase.includes('menguante')) return light >= 50 ? 'waning-gibbous' : 'waning-crescent';
  if (phase.includes('creciente') || phase.includes('gibosa')) {
    return light >= 50 ? 'waxing-gibbous' : 'waxing-crescent';
  }
  if (phase.includes('nueva') || light <= 4) return 'new';

  return light >= 50 ? 'waxing-gibbous' : 'waxing-crescent';
}

function getMoonLightGeometry(artPhase, illumination = 0) {
  const light = Math.max(0, Math.min(100, Number(illumination) || 0));
  const crescentRatio = Math.max(0.02, Math.min(1, light / 50));
  const shadowRatio = Math.max(0.02, Math.min(1, (100 - light) / 50));
  const crescentRx = Math.max(5.5, Math.min(30, 5.5 + crescentRatio * 24.5));
  const biteRx = Math.max(8, Math.min(30, 8 + shadowRatio * 18));

  return {
    crescentRx,
    crescentLeftCx: 122 + crescentRx * 0.82,
    crescentRightCx: 238 - crescentRx * 0.82,
    biteRx,
    biteLeftCx: 122 + biteRx * 0.9,
    biteRightCx: 238 - biteRx * 0.9,
    isFineCrescent: artPhase === 'waning-crescent' || artPhase === 'waxing-crescent',
  };
}

function getCrescentShadowOffset(illumination = 0, radius = 58) {
  const measuredLight = Math.max(0, Math.min(0.5, Number(illumination) / 100));
  const targetLight = measuredLight > 0 ? Math.max(0.075, measuredLight) : 0;

  if (targetLight <= 0) return 0;

  let low = 0;
  let high = radius * 2;

  for (let index = 0; index < 24; index += 1) {
    const distance = (low + high) / 2;
    const overlap =
      2 * radius * radius * Math.acos(distance / (2 * radius)) -
      0.5 * distance * Math.sqrt(4 * radius * radius - distance * distance);
    const visibleRatio = 1 - overlap / (Math.PI * radius * radius);

    if (visibleRatio < targetLight) low = distance;
    else high = distance;
  }

  return (low + high) / 2;
}

function MoonPhaseIllustration({ phaseName, illumination }) {
  const artPhase = getMoonArtPhase(phaseName, illumination);
  const lightValue = Math.round(Number(illumination) || 0);
  const lightGeometry = getMoonLightGeometry(artPhase, lightValue);
  const crescentShadowOffset = getCrescentShadowOffset(illumination);
  const crescentShadowCx =
    artPhase === 'waning-crescent'
      ? 180 + crescentShadowOffset
      : 180 - crescentShadowOffset;
  const crescentPath = [
    'M 122 118',
    'a 58 58 0 1 0 116 0',
    'a 58 58 0 1 0 -116 0',
    `M ${crescentShadowCx - 58} 118`,
    'a 58 58 0 1 0 116 0',
    'a 58 58 0 1 0 -116 0',
  ].join(' ');

  return (
    <div className={`moon-illustration-wrap phase-${artPhase}`} aria-hidden="true">
      <svg className="moon-illustration" viewBox="0 0 360 225" role="img">
        <defs>
          <radialGradient id="moonSurface" cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fffdf0" />
            <stop offset="45%" stopColor="#d9d4bc" />
            <stop offset="100%" stopColor="#6f684f" />
          </radialGradient>
          <radialGradient id="moonDarkSurface" cx="38%" cy="28%" r="76%">
            <stop offset="0%" stopColor="#3a4150" />
            <stop offset="58%" stopColor="#151b2a" />
            <stop offset="100%" stopColor="#060913" />
          </radialGradient>
          <linearGradient id="lunarGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff1b8" />
            <stop offset="48%" stopColor="#c8a860" />
            <stop offset="100%" stopColor="#6d5728" />
          </linearGradient>
          <filter id="moonSoftGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0.85 0 1 0 0 0.78 0 0 1 0 0.55 0 0 0 0.7 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="moonDiscClip">
            <circle cx="180" cy="118" r="58" />
          </clipPath>
        </defs>

        <g className="moon-orbit-lines">
          <ellipse cx="180" cy="122" rx="128" ry="42" />
          <ellipse cx="180" cy="122" rx="128" ry="42" transform="rotate(28 180 122)" />
          <ellipse cx="180" cy="122" rx="128" ry="42" transform="rotate(-28 180 122)" />
          <path d="M72 122h216M180 32v180" />
        </g>

        <g className="moon-star-field">
          <circle cx="72" cy="67" r="2.4" />
          <circle cx="288" cy="76" r="2" />
          <circle cx="65" cy="172" r="1.8" />
          <circle cx="296" cy="168" r="2.5" />
          <path d="M111 45l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
          <path d="M257 42l2.4 5.5 5.6 2.5-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.5z" />
        </g>

        <g className="moon-phase-cues">
          <path className="moon-cue moon-cue--waxing" d="M255 87c30 20 30 60 0 82M282 128h30M301 117l11 11-11 11" />
          <path className="moon-cue moon-cue--waning" d="M105 87c-30 20-30 60 0 82M78 128H48M59 117l-11 11 11 11" />
          <path className="moon-cue moon-cue--full" d="M180 32v-18M180 222v18M86 128H68M292 128h-18" />
          <path className="moon-cue moon-cue--new" d="M151 211c14 12 44 12 58 0M164 225c8 5 24 5 32 0" />
        </g>

        <g className="moon-disc-shell" filter="url(#moonSoftGlow)">
          <circle className="moon-halo" cx="180" cy="118" r="76" />
          <circle className="moon-outer-ring" cx="180" cy="118" r="66" />

          <g clipPath="url(#moonDiscClip)">
            <circle className="moon-shadow-disc" cx="180" cy="118" r="58" />
            <circle className="moon-light-full" cx="180" cy="118" r="58" />
            <rect className="moon-light-half moon-light-half--right" x="180" y="60" width="58" height="116" />
            <rect className="moon-light-half moon-light-half--left" x="122" y="60" width="58" height="116" />
            <ellipse
              className="moon-light-crescent moon-light-crescent--right"
              cx={lightGeometry.crescentRightCx}
              cy="118"
              rx={lightGeometry.crescentRx}
              ry="58"
            />
            <ellipse
              className="moon-light-crescent moon-light-crescent--left"
              cx={lightGeometry.crescentLeftCx}
              cy="118"
              rx={lightGeometry.crescentRx}
              ry="58"
            />
            <ellipse
              className="moon-dark-bite moon-dark-bite--left"
              cx={lightGeometry.biteLeftCx}
              cy="118"
              rx={lightGeometry.biteRx}
              ry="61"
            />
            <path
              className="moon-light-crescent moon-light-crescent--precise"
              d={crescentPath}
              fillRule="evenodd"
            />
            <ellipse
              className="moon-dark-bite moon-dark-bite--right"
              cx={lightGeometry.biteRightCx}
              cy="118"
              rx={lightGeometry.biteRx}
              ry="61"
            />

            <g className="moon-craters">
              <circle cx="160" cy="94" r="8" />
              <circle cx="198" cy="102" r="5.5" />
              <circle cx="191" cy="142" r="9" />
              <circle cx="151" cy="139" r="4.5" />
              <path d="M137 113c14-8 29-9 45-1" />
              <path d="M198 82c13 5 23 13 30 25" />
              <path d="M145 153c15 9 33 11 55 4" />
            </g>
          </g>

          <circle className="moon-disc-stroke" cx="180" cy="118" r="58" />
        </g>

        <g className="moon-pedestal">
          <ellipse cx="180" cy="203" rx="92" ry="15" />
          <path d="M120 197c8-20 112-20 120 0" />
          <path d="M145 197c8 13 62 13 70 0" />
        </g>
      </svg>
    </div>
  );
}

function MoonTitleEmblem() {
  return (
    <svg className="moon-title-emblem" viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <radialGradient id="moonTitlePearl" cx="34%" cy="26%" r="78%">
          <stop offset="0%" stopColor="#fff8d8" />
          <stop offset="45%" stopColor="#d7c99a" />
          <stop offset="100%" stopColor="#5f5943" />
        </radialGradient>
        <linearGradient id="moonTitleGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff1b8" />
          <stop offset="48%" stopColor="#b8860b" />
          <stop offset="100%" stopColor="#4d3a0e" />
        </linearGradient>
      </defs>
      <circle className="moon-title-emblem__halo" cx="48" cy="48" r="38" />
      <g className="moon-title-emblem__rays">
        <path d="M48 5v13M48 78v13M5 48h13M78 48h13" />
        <path d="M18 18l9 9M69 69l9 9M78 18l-9 9M27 69l-9 9" />
      </g>
      <circle className="moon-title-emblem__disc" cx="48" cy="48" r="24" />
      <path className="moon-title-emblem__crescent" d="M55 24a24 24 0 1 0 0 48a19 24 0 1 1 0-48Z" />
      <path className="moon-title-emblem__orbit" d="M17 53c19 14 43 14 62 0" />
      <path className="moon-title-emblem__crown" d="M38 17l10-9 10 9M36 79l12 8 12-8" />
    </svg>
  );
}

function LunarBackdrop() {
  return (
    <div className="moon-backdrop-art" aria-hidden="true">
      <svg className="moon-backdrop-svg moon-backdrop-svg--calendar" viewBox="0 0 420 420">
        <g className="moon-calendar-rings">
          <circle cx="210" cy="210" r="184" />
          <circle cx="210" cy="210" r="154" />
          <circle cx="210" cy="210" r="112" />
          <circle cx="210" cy="210" r="72" />
        </g>

        <g className="moon-calendar-rays">
          {MOON_CALENDAR_DAYS.map((day) => {
            const angle = ((day - 7.5) / 30) * Math.PI * 2;
            const x1 = 210 + Math.cos(angle) * 114;
            const y1 = 210 + Math.sin(angle) * 114;
            const x2 = 210 + Math.cos(angle) * 183;
            const y2 = 210 + Math.sin(angle) * 183;
            return <line key={`ray-${day}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>

        <g className="moon-calendar-days">
          {MOON_CALENDAR_DAYS.map((day) => {
            const angle = ((day - 8) / 30) * Math.PI * 2;
            const x = 210 + Math.cos(angle) * 137;
            const y = 210 + Math.sin(angle) * 137;
            return (
              <text key={`day-${day}`} x={x} y={y}>
                {day}
              </text>
            );
          })}
        </g>

        <g className="moon-calendar-phases">
          {MOON_CALENDAR_DAYS.map((day) => {
            const angle = ((day - 8) / 30) * Math.PI * 2;
            const x = 210 + Math.cos(angle) * 169;
            const y = 210 + Math.sin(angle) * 169;
            const fill = day > 7 && day < 23 ? 'var(--moon-backdrop-ink)' : 'none';
            return (
              <g key={`phase-${day}`} transform={`translate(${x} ${y})`}>
                <circle r="10" />
                <circle className="moon-phase-fill" cx={day < 15 ? 4 : -4} r="8" fill={fill} />
              </g>
            );
          })}
        </g>

        <g className="moon-calendar-face">
          <circle cx="210" cy="210" r="43" />
          <path d="M166 210h88" />
          <path d="M178 198c12-9 25-9 38 0M204 198c12-9 25-9 38 0" />
          <path d="M185 224c16 13 35 13 51 0" />
          <path d="M210 160v-22M210 282v-22M160 210h-22M282 210h-22" />
        </g>
      </svg>

      <svg className="moon-backdrop-svg moon-backdrop-svg--phases" viewBox="0 0 620 340">
        <defs>
          <clipPath id="moonMiniDiscClip">
            <circle cx="0" cy="0" r="17" />
          </clipPath>
        </defs>

        <g className="moon-geometry-lines">
          <circle cx="310" cy="170" r="132" />
          <circle cx="310" cy="170" r="88" />
          <path d="M120 170h380M310 34v272M190 60l240 220M430 60 190 280" />
          <ellipse cx="310" cy="170" rx="250" ry="58" />
          <ellipse cx="310" cy="170" rx="250" ry="58" transform="rotate(27 310 170)" />
          <ellipse cx="310" cy="170" rx="250" ry="58" transform="rotate(-27 310 170)" />
          <path d="M310 22l36 70h-72zM310 318l-36-70h72z" />
        </g>

        <g className="moon-phase-row">
          {MOON_PHASE_BACKDROP.map((phase, index) => {
            const x = 102 + index * 52;
            return (
              <g key={`${phase}-${index}`} className={`moon-mini-phase phase-${phase}`} transform={`translate(${x} 170)`}>
                <circle className="moon-mini-disc" r="17" />
                <g clipPath="url(#moonMiniDiscClip)">
                  <circle className="moon-mini-light moon-mini-light--full" r="17" />
                  <rect className="moon-mini-light moon-mini-light--right" x="0" y="-17" width="17" height="34" />
                  <rect className="moon-mini-light moon-mini-light--left" x="-17" y="-17" width="17" height="34" />
                  <ellipse className="moon-mini-light moon-mini-light--crescent-right" cx="8" rx="7" ry="17" />
                  <ellipse className="moon-mini-light moon-mini-light--crescent-left" cx="-8" rx="7" ry="17" />
                  <ellipse className="moon-mini-bite moon-mini-bite--left" cx="-11" rx="9" ry="18" />
                  <ellipse className="moon-mini-bite moon-mini-bite--right" cx="11" rx="9" ry="18" />
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default function MoonPhaseService({ onServiceResult }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMoonData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // CORRECCIÓN: Usamos la URL completa del backend
      const res = await fetch('/moon-phase/current'); 
      
      if (!res.ok) throw new Error('La luna se oculta tras las nubes...');
      
      const jsonData = await res.json();
      
      // Pequeño delay artificial para disfrutar la animación de carga
      setTimeout(() => {
        setData(jsonData);
        onServiceResult?.(jsonData);
        setLoading(false);
      }, 1000);

    } catch {
      setError("No se pudo conectar con el cielo nocturno.");
      setLoading(false);
    }
  }, [onServiceResult]);

  useEffect(() => {
    fetchMoonData();
  }, [fetchMoonData]);

  return (
    <div className="astro-service moon-service p-6">
      <LunarBackdrop />
      
     <h2 className="moon-title">
        <MoonTitleEmblem />
        <span className="moon-title-copy">
          <span className="moon-title-kicker">Almanaque lunar</span>
          <span className="moon-title-main">Espejo de Plata</span>
        </span>
     </h2>

      {/* Botón de recarga */}
      {!data && !loading && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={fetchMoonData} className="astro-btn moon-btn">
            Intentar Conexión
          </button>
        </div>
      )}

      {/* Loading Místico */}
      {loading && (
        <VeloraLoader message="Sintonizando mareas..." />
      )}

      {error && <p className="astro-error">{error}</p>}

      <div className="astro-card-container">
        {data && !loading && (
          <div className="astro-card visible moon-card">
            
            {/* Cabecera: La Luna Visual */}
            <div className="zodiac-header-center">
              <MoonPhaseIllustration phaseName={data.phase_name} illumination={data.illumination} />
              <span className="zodiac-name moon-phase-name">
                {data.phase_name}
              </span>
              <span className="moon-date">{data.date}</span>
            </div>

            {/* Grid de Datos */}
            <div className="astro-stats-grid moon-grid">
              
              {/* Iluminación */}
              <div className="stat-box">
                <span className="stat-icon moon-stat-sigil moon-stat-sigil--light" aria-hidden="true" />
                <span className="stat-label">Luz</span>
                <span className="stat-value">{data.illumination}%</span>
              </div>

              {/* Signo Lunar */}
              <div className="stat-box">
                <span className="stat-icon moon-stat-sigil moon-stat-sigil--transit" aria-hidden="true" />
                <span className="stat-label">Tránsito</span>
                <span className="stat-value">{data.zodiac_sign}</span>
              </div>

              {/* Elemento (Decorativo) */}
              <div className="stat-box">
                <span className="stat-icon moon-stat-sigil moon-stat-sigil--cycle" aria-hidden="true" />
                <span className="stat-label">Ciclo</span>
                <span className="stat-value">
                    {data.illumination > 50 ? "Plenitud" : "Gestación"}
                </span>
              </div>

            </div>

            {(data.velora_message || data.velora_reflection) && (
              <div className="astro-horoscope moon-message">
                <span className="velora-label-moon">✦ Susurro Lunar ✦</span>
                {data.velora_message && (
                  <p className="velora-text-moon">
                    "{data.velora_message}"
                  </p>
                )}
                {data.velora_reflection && (
                  <div className="moon-reflection">
                    {data.velora_reflection}
                  </div>
                )}
              </div>
            )}
            
            <button onClick={fetchMoonData} className="moon-refresh-btn">
              Actualizar Cielo
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
