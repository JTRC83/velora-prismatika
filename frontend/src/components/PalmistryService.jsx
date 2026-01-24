import React, { useState, useRef } from 'react';
import './PalmistryService.css';

const PalmistryService = () => {
  const [mode, setMode] = useState('guide');
  const [activeLine, setActiveLine] = useState(null);
  
  // Estados para la IA
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados Upload
  const [selectedImage, setSelectedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  // --- FUNCIÓN PRINCIPAL: Conecta con el Backend ---
  const handleLineClick = async (lineId) => {
    setActiveLine(lineId);
    setLoading(true);
    setReading(null); // Limpiamos lectura anterior

    try {
      // Llamamos a nuestro backend en el puerto 8000
      const res = await fetch(`http://localhost:8000/palmistry/read/${lineId}`);
      if (!res.ok) throw new Error("Error conectando con Velora");
      
      const data = await res.json();
      
      // Simular un pequeño delay para dar sensación de "tacto"
      setTimeout(() => {
        setReading(data);
        setLoading(false);
      }, 800);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Handlers Upload (Sin cambios)
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) { setSelectedImage(URL.createObjectURL(file)); setAnalysis(null); }
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
        
        {/* === MODO 1: DIAGRAMA ANATÓMICO === */}
        {mode === 'guide' && (
          <div className="guide-layout fade-in">
            
            {/* COLUMNA IZQUIERDA: VISUALIZACIÓN (TU SVG INTACTO) */}
            <div className="hand-visual-col">
              <div className="hand-diagram-parchment">
                <svg viewBox="0 0 500 700" className="palmistry-hand-svg">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* IMPORTANTE: Asegúrate de tener esta imagen en public/assets/mano.png */}
                  <image
                    href="/assets/mano.png" 
                    x="0" y="0" width="500" height="700"
                    preserveAspectRatio="none"
                    className="hand-image-bg"
                  />

                  {/* LÍNEA DE LA VIDA */}
                  <g
                    transform="translate(-145 0) translate(500 0) scale(-1 1)"
                    className={`line-group ${activeLine === 'life' ? 'active' : ''}`}
                    onClick={() => handleLineClick('life')}
                  >
                    <path d="M 190,330 C 120,400 120,485 145,545 C 158,565 168,578 176,590" className="click-zone"/>
                    <path d="M 190,330 C 120,400 120,485 145,545 C 158,565 168,578 176,590" className="palm-line-stroke"/>
                  </g>

                  {/* LÍNEA DE LA CABEZA */}
                  <g className={`line-group ${activeLine === 'head' ? 'active' : ''}`} onClick={() => handleLineClick('head')}>
                    <path d="M 170,340 C 235,330 310,345 380,405" className="click-zone" />
                    <path d="M 170,340 C 235,330 310,345 380,405" className="palm-line-stroke" />
                  </g>

                  {/* LÍNEA DEL CORAZÓN */}
                  <g className={`line-group ${activeLine === 'heart' ? 'active' : ''}`} onClick={() => handleLineClick('heart')}>
                    <path d="M 400,320 C 340,350 280,345 225,305" className="click-zone" />
                    <path d="M 400,320 C 340,350 280,345 225,305" className="palm-line-stroke" />
                  </g>

                  {/* LÍNEA DEL DESTINO */}
                  <g className={`line-group ${activeLine === 'fate' ? 'active' : ''}`} onClick={() => handleLineClick('fate')}>
                    <path d="M 295,635 C 280,540 275,460 265,380 L 255,295" className="click-zone"/>
                    <path d="M 295,635 C 280,540 275,460 265,380 L 255,295" className="palm-line-stroke"/>
                  </g>

                   {/* ETIQUETAS VISUALES */}
                  <text x="50" y="520" className={`tag-text ${activeLine === 'life' ? 'visible' : ''}`}>VIDA</text>
                  <line x1="80" y1="515" x2="150" y2="480" className={`tag-line ${activeLine === 'life' ? 'visible' : ''}`} />

                  <text x="430" y="420" className={`tag-text ${activeLine === 'head' ? 'visible' : ''}`}>CABEZA</text>
                  <line x1="420" y1="415" x2="325" y2="375" className={`tag-line ${activeLine === 'head' ? 'visible' : ''}`} />

                  <text x="420" y="235" className={`tag-text ${activeLine === 'heart' ? 'visible' : ''}`}>CORAZÓN</text>
                  <line x1="410" y1="240" x2="305" y2="305" className={`tag-line ${activeLine === 'heart' ? 'visible' : ''}`} />

                  <text x="60" y="690" className={`tag-text ${activeLine === 'fate' ? 'visible' : ''}`}>DESTINO</text>
                  <line x1="115" y1="685" x2="250" y2="545" className={`tag-line ${activeLine === 'fate' ? 'visible' : ''}`} />
                </svg>

                {!activeLine && (
                  <div className="diagram-instruction">
                    ☝️ Toca una línea para leerla
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN (CONECTADA A IA) */}
            <div className="info-panel-col">
              <div className="guide-info-box">
                {activeLine ? (
                  <div className="info-content active fade-in">
                    
                    {loading ? (
                      <div className="palm-loading-state">
                        <span className="pulse-hand">✋</span>
                        <p>Velora está trazando tu piel...</p>
                      </div>
                    ) : reading ? (
                      <>
                        <h3>{reading.line_name}</h3>
                        <div className="divider-ornament">✻</div>
                        
                        <div className="base-reading-box">
                            <strong>Lectura de la forma:</strong>
                            <p>"{reading.base_reading}"</p>
                        </div>

                        {/* Texto generado por IA */}
                        <div className="velora-reading-text">
                             {reading.velora_voice.split('\n').map((line, i) => (
                                line.trim() && <p key={i}>{line}</p>
                             ))}
                        </div>
                        
                        <div className="palm-reflection">
                           ✨ {reading.reflejo}
                        </div>

                        <button className="clear-selection-btn" onClick={() => setActiveLine(null)}>
                          Ver otra línea
                        </button>
                      </>
                    ) : (
                        <p>Error en la lectura.</p>
                    )}
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
             <p style={{textAlign: 'center', color: '#555'}}>Próximamente: Escaneo visual con IA.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PalmistryService;