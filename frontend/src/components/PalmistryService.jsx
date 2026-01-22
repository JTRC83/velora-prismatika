import React, { useState, useRef } from 'react';
import './PalmistryService.css';

// --- DATOS DE LA GUÍA (versión “Velora” con más brillo) ---
const GUIDE_DATA = {
  life: {
    title: "Línea de la Vida",
    desc:
      "Abraza el Monte de Venus como un río que bordea la memoria del cuerpo. Habla de tu reserva de energía, tu resistencia y de los giros que te re-enraízan (mudanzas, rupturas, nuevos comienzos). " +
      "No mide años: describe intensidad, ciclos y recuperación. Observa su profundidad, continuidad y ramificaciones: ahí está el pulso."
  },

  head: {
    title: "Línea de la Cabeza",
    desc:
      "Es la senda del pensamiento: cómo decides, analizas y sueñas. Si es recta, prima la lógica y la estrategia; si cae o se curva, la imaginación y la intuición toman el timón. " +
      "Cortes y cambios señalan etapas de replanteamiento; bifurcaciones hablan de mente versátil. No es inteligencia: es tu estilo mental en acción."
  },

  heart: {
    title: "Línea del Corazón",
    desc:
      "Gobierna el paisaje afectivo: cómo amas, cómo te proteges y qué necesitas para sentirte en paz. Una línea alta sugiere idealismo; una más baja, pragmatismo emocional. " +
      "Si es amplia y fluida, hay apertura; si es fragmentada o muy tenue, cautela o aprendizaje emocional. No juzga: revela tu manera de vincularte."
  },

  fate: {
    title: "Línea del Destino",
    desc:
      "La columna del propósito: el hilo que cose vocación, trabajo y rumbo. Puede ser fuerte (camino definido) o sutil (rumbo flexible), y eso no es mejor ni peor. " +
      "Intersecciones con otras líneas suelen marcar decisiones importantes o influencias externas (familia, contexto, oportunidades). No dicta un final: ilumina el camino que eliges tejer."
  }
};

const PalmistryService = () => {
  const [mode, setMode] = useState('guide');
  const [activeLine, setActiveLine] = useState(null);

  // Estados Upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  const handleLineClick = (lineId) => setActiveLine(lineId);

  // Handlers Upload (Sin cambios)
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) { setSelectedImage(URL.createObjectURL(file)); setAnalysis(null); }
  };
  const startScan = () => {
    if (!selectedImage) return; setIsScanning(true);
    setTimeout(() => { setIsScanning(false); setAnalysis(`Lectura Espectral:\n1. Vitalidad alta.\n2. Mente creativa.\n3. Corazón apasionado.`); }, 3000);
  };

  return (
    <div className="palm-container">
      <div className="palm-header">
        <h2>La Lectura de la Palma</h2>
        <p className="velora-whisper">"El mapa de tu destino está grabado en tu piel."</p>
      </div>

      <div className="palm-tabs">
        <button className={`tab-btn ${mode === 'guide' ? 'active' : ''}`} onClick={() => setMode('guide')}>📖 Guía Interactiva</button>
        <button className={`tab-btn ${mode === 'upload' ? 'active' : ''}`} onClick={() => setMode('upload')}>📷 Lectura por Foto (IA)</button>
      </div>

      <div className="palm-workspace">
        
        {/* === MODO 1: DIAGRAMA ANATÓMICO (SVG PURO) === */}
        {mode === 'guide' && (
          <div className="guide-layout fade-in">
            
{/* COLUMNA IZQUIERDA: VISUALIZACIÓN */}
            <div className="hand-visual-col">
              <div className="hand-diagram-parchment">
                <svg viewBox="0 0 500 700" className="palmistry-hand-svg">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 z" fill="#3e2723" />
                    </marker>
                  </defs>

                  {/* IMAGEN DE FONDO */}
                  <image
                    href="/assets/mano.png"
                    x="0"
                    y="0"
                    width="500"
                    height="700"
                    preserveAspectRatio="none"
                    className="hand-image-bg"
                    />

                  {/* LÍNEAS DE LA MANO */}
                  {/* VIDA (espejada + recolocada) */}
                    <g
                    transform="translate(-145 0) translate(500 0) scale(-1 1)"
                    className={`line-group ${activeLine === 'life' ? 'active' : ''}`}
                    onClick={() => setActiveLine('life')}
                    >
                    <path
                        d="
                        M 190,330
                        C 120,400 120,485 145,545
                        C 158,565 168,578 176,590
                        "
                        className="click-zone"
                    />
                    <path
                        d="
                        M 190,330
                        C 120,400 120,485 145,545
                        C 158,565 168,578 176,590
                        "
                        className="palm-line-stroke"
                    />
                    </g>

                  {/* CABEZA (derecha más baja) */}
                    <g className={`line-group ${activeLine === 'head' ? 'active' : ''}`} onClick={() => setActiveLine('head')}>
                    <path d="M 170,340 C 235,330 310,345 380,405" className="click-zone" />
                    <path d="M 170,340 C 235,330 310,345 380,405" className="palm-line-stroke" />
                    </g>

                  {/* CORAZÓN */}
                  <g className={`line-group ${activeLine === 'heart' ? 'active' : ''}`} onClick={() => setActiveLine('heart')}>
                    <path d="M 400,320 C 340,350 280,345 225,305" className="click-zone" />
                    <path d="M 400,320 C 340,350 280,345 225,305" className="palm-line-stroke" />
                  </g>

                  {/* DESTINO */}
                    <g
                    className={`line-group ${activeLine === 'fate' ? 'active' : ''}`}
                    onClick={() => setActiveLine('fate')}
                    >
                    <path
                        d="
                        M 295,635
                        C 280,540 275,460 265,380
                        L 255,295
                        "
                        className="click-zone"
                    />
                    <path
                        d="
                        M 295,635
                        C 280,540 275,460 265,380
                        L 255,295
                        "
                        className="palm-line-stroke"
                    />
                    </g>
                   {/* ETIQUETAS */}
                  <text x="50" y="520" className={`tag-text ${activeLine === 'life' ? 'visible' : ''}`}>VIDA</text>
                  <line x1="80" y1="515" x2="150" y2="480" className={`tag-line ${activeLine === 'life' ? 'visible' : ''}`} />

                  <text
                    x="430"
                    y="420"
                    className={`tag-text ${activeLine === 'head' ? 'visible' : ''}`}
                    >
                    CABEZA
                    </text>
                    <line
                    x1="420"
                    y1="415"
                    x2="325"
                    y2="375"
                    className={`tag-line ${activeLine === 'head' ? 'visible' : ''}`}
                    />

                  {/* --- CORAZÓN (más a la derecha, fuera de la mano) --- */}
                  <text
                    x="420"
                    y="235"
                    className={`tag-text ${activeLine === 'heart' ? 'visible' : ''}`}
                    >
                    CORAZÓN
                    </text>
                    <line
                    x1="410"
                    y1="240"
                    x2="305"
                    y2="305"
                    className={`tag-line ${activeLine === 'heart' ? 'visible' : ''}`}
                    />

                  {/* --- DESTINO (indicación más abajo) --- */}
                  <text
                    x="60"
                    y="690"
                    className={`tag-text ${activeLine === 'fate' ? 'visible' : ''}`}
                    >
                    DESTINO
                    </text>
                    <line
                    x1="115"
                    y1="685"
                    x2="250"
                    y2="545"
                    className={`tag-line ${activeLine === 'fate' ? 'visible' : ''}`}
                    />

                </svg>

                {!activeLine && (
                  <div className="diagram-instruction">
                    ☝️ Toca una línea para leerla
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN */}
            <div className="info-panel-col">
              <div className="guide-info-box">
                {activeLine ? (
                  <div className="info-content active fade-in">
                    <h3>{GUIDE_DATA[activeLine].title}</h3>
                    <div className="divider-ornament">✻</div>
                    <p>{GUIDE_DATA[activeLine].desc}</p>
                    <button className="clear-selection-btn" onClick={() => setActiveLine(null)}>
                      Ver otra línea
                    </button>
                  </div>
                ) : (
                  <div className="info-content placeholder">
                    <h3>Sabiduría en tus Manos</h3>
                    <p>
                      "La mano es el espejo del alma, donde el pasado, el presente y el potencial convergen."
                    </p>
                    <p className="small-hint">
                      Selecciona un trazo en la ilustración para desvelar su significado esotérico.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* MODO UPLOAD (Sin cambios) */}
        {mode === 'upload' && (
          <div className="upload-layout fade-in">
             <p style={{textAlign: 'center', color: '#555'}}>Modo Upload (Funcionalidad IA)</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PalmistryService;