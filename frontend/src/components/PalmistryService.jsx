import React, { useEffect, useMemo, useRef, useState } from 'react';
import './PalmistryService.css';
import VeloraLoader from './VeloraLoader';
import { SERVICE_LORE_ROTATION_MS, getServiceLore } from '../data/serviceLore';

const HAND_OPTIONS = [
  {
    id: 'left',
    label: 'Izquierda',
    title: 'Mapa interno',
    description: 'Memoria, sensibilidad heredada y patrones que suelen actuar por debajo de la voluntad.'
  },
  {
    id: 'right',
    label: 'Derecha',
    title: 'Mano activa',
    description: 'Hábitos presentes, decisiones visibles y forma de llevar la energía al mundo cotidiano.'
  }
];

const emptyPhoto = {
  src: '',
  source: '',
  name: '',
  width: 0,
  height: 0
};

function getQualityLabel(photo) {
  if (!photo?.width || !photo?.height) return 'A la espera de imagen';
  const shortEdge = Math.min(photo.width, photo.height);
  if (shortEdge >= 1200) return 'Imagen amplia y clara';
  if (shortEdge >= 900) return 'Imagen adecuada';
  return 'Imagen utilizable, mejorable';
}

const PalmistryService = ({ onServiceResult }) => {
  const [mode, setMode] = useState('guide');
  const [activeLine, setActiveLine] = useState(null);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lineError, setLineError] = useState('');

  const [handSide, setHandSide] = useState('right');
  const [photo, setPhoto] = useState(emptyPhoto);
  const [scanReading, setScanReading] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [activeLoreIndex, setActiveLoreIndex] = useState(0);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const palmLore = useMemo(() => getServiceLore('Lectura de Mano'), []);
  const activeLore = palmLore.items[activeLoreIndex % palmLore.items.length];

  const stopCamera = React.useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!cameraActive || !video || !stream) return undefined;

    video.srcObject = stream;
    video.play().then(() => {
      if (video.readyState >= 2) {
        setCameraReady(true);
      }
    }).catch(error => {
      console.error('Error al reproducir video:', error);
      setCameraError('La cámara se ha abierto, pero no ha podido iniciar la vista previa.');
    });

    return () => {
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [cameraActive]);

  useEffect(() => {
    if (!scanLoading) return undefined;
    setActiveLoreIndex(Math.floor(Math.random() * palmLore.items.length));
    const interval = window.setInterval(() => {
      setActiveLoreIndex(prev => (prev + 1) % palmLore.items.length);
    }, SERVICE_LORE_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, [scanLoading, palmLore.items.length]);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setScanError('');
    setLineError('');
    if (nextMode !== 'upload') stopCamera();
  };

  const handleLineClick = async (lineId) => {
    setActiveLine(lineId);
    setLoading(true);
    setReading(null);
    setLineError('');
    onServiceResult?.(null);

    try {
      const res = await fetch(`/palmistry/read/${lineId}`);
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.detail || `Backend respondió ${res.status}`);
      }

      const data = await res.json();

      setTimeout(() => {
        setReading(data);
        onServiceResult?.({
          input: { mode: 'line', line_id: lineId },
          ...data,
        });
        setLoading(false);
      }, 800);
    } catch (err) {
      const esFalloConexion = err instanceof TypeError;
      setLineError({
        titulo: esFalloConexion ? 'No puedo conectar con el servidor' : 'Error al leer la línea',
        mensaje: esFalloConexion
          ? 'Comprueba que la aplicación esté iniciada por completo.'
          : err.message,
      });
      setLoading(false);
    }
  };

  const setPhotoFromSource = (src, source, name, width, height) => {
    setPhoto({ src, source, name, width, height });
    setScanReading(null);
    setScanError('');
    onServiceResult?.(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setScanError('Sube una imagen en formato JPG, PNG o WebP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      const image = new Image();
      image.onload = () => {
        setPhotoFromSource(src, 'upload', file.name, image.naturalWidth, image.naturalHeight);
      };
      image.onerror = () => {
        setScanError('No se pudo cargar la imagen. Puede estar corrupta o tener un formato incompatible.');
      };
      image.src = src;
    };
    reader.onerror = () => {
      setScanError('Error al leer el archivo seleccionado. Intenta con otro archivo.');
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setCameraError('');
    setScanError('');
    setScanReading(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Este navegador no permite acceder a la cámara desde aquí.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1440 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 3 / 4 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      setCameraReady(false);
      setCameraActive(true);
    } catch (error) {
      const mensajes = {
        NotAllowedError: 'Permiso de cámara denegado. Activa el acceso en el navegador o usa una imagen subida.',
        NotFoundError: 'No se encontró ninguna cámara en este dispositivo. Usa una imagen subida.',
        NotReadableError: 'La cámara está ocupada por otra aplicación. Ciérrala e inténtalo de nuevo.',
      };
      const msg = mensajes[error.name] || 'No he podido abrir la cámara. Revisa permisos del navegador o usa una imagen subida.';
      setCameraError(msg);
      stopCamera();
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const sourceWidth = video.videoWidth || 1280;
    const sourceHeight = video.videoHeight || 960;
    const targetRatio = 3 / 4;
    const sourceRatio = sourceWidth / sourceHeight;
    const width = sourceRatio > targetRatio ? Math.round(sourceHeight * targetRatio) : sourceWidth;
    const height = sourceRatio > targetRatio ? sourceHeight : Math.round(sourceWidth / targetRatio);
    const sourceX = Math.round((sourceWidth - width) / 2);
    const sourceY = Math.round((sourceHeight - height) / 2);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('No se pudo procesar la captura en este navegador.');
      return;
    }
    context.drawImage(video, sourceX, sourceY, width, height, 0, 0, width, height);
    const src = canvas.toDataURL('image/jpeg', 0.92);
    setPhotoFromSource(src, 'camera', 'captura-camara.jpg', width, height);
    stopCamera();
  };

  const handleScan = async () => {
    if (!photo.src) {
      setScanError('Primero sube una imagen o captura la mano con la cámara.');
      return;
    }

    setScanLoading(true);
    setScanReading(null);
    setScanError('');
    onServiceResult?.(null);

    const minTimePromise = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const fetchPromise = fetch('/palmistry/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hand_side: handSide,
          source: photo.source,
          image_name: photo.name,
          image_width: photo.width,
          image_height: photo.height,
        })
      }).then(async res => {
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(errorBody.detail || 'La lectura de la mano no ha podido prepararse.');
        }
        return res.json();
      });

      const [, data] = await Promise.all([minTimePromise, fetchPromise]);
      setScanReading(data);
      onServiceResult?.({
        input: {
          mode: 'photo',
          hand_side: data.hand_label,
          source: data.source_label,
          image_name: photo.name,
          image_size: `${photo.width} x ${photo.height}`,
        },
        lectura_base: data.base_reading,
        lineas_observadas: data.focus_lines,
        reflejo: data.reflejo,
      });
    } catch (error) {
      if (error instanceof TypeError) {
        setScanError('No puedo conectar con el servidor de Velora. Comprueba que la aplicación esté iniciada por completo.');
      } else {
        setScanError(error.message || 'No he podido preparar la lectura de esta imagen. Prueba con otra foto más clara.');
      }
    } finally {
      setScanLoading(false);
    }
  };

  const handleNewScan = () => {
    setScanReading(null);
    setPhoto(emptyPhoto);
    setScanError('');
    onServiceResult?.(null);
  };

  return (
    <div className="palm-container">
      <div className="palm-card-geometry" aria-hidden="true" />
      <div className="palm-header">
        <span className="palm-kicker">Lectura de mano</span>
        <h2>La Lectura de la Palma</h2>
        <p className="velora-whisper">"La piel guarda memoria; la mano enseña cómo la voluntad aprende a moverse."</p>
      </div>

      <div className="palm-tabs">
        <button className={`tab-btn ${mode === 'guide' ? 'active' : ''}`} onClick={() => handleModeChange('guide')}>
          Mapa de líneas
        </button>
        <button className={`tab-btn ${mode === 'upload' ? 'active' : ''}`} onClick={() => handleModeChange('upload')}>
          Lectura por imagen
        </button>
      </div>

      <div className="palm-workspace">
        {mode === 'guide' && (
          <div className="guide-layout fade-in">
            <div className="hand-visual-col">
              <div className="hand-diagram-parchment">
                <svg viewBox="0 0 500 700" className="palmistry-hand-svg">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <image
                    href="/assets/mano.png"
                    x="0" y="0" width="500" height="700"
                    preserveAspectRatio="none"
                    className="hand-image-bg"
                  />

                  <g
                    transform="translate(-145 0) translate(500 0) scale(-1 1)"
                    className={`line-group ${activeLine === 'life' ? 'active' : ''}`}
                    onClick={() => handleLineClick('life')}
                  >
                    <path d="M 190,330 C 120,400 120,485 145,545 C 158,565 168,578 176,590" className="click-zone"/>
                    <path d="M 190,330 C 120,400 120,485 145,545 C 158,565 168,578 176,590" className="palm-line-stroke"/>
                  </g>

                  <g className={`line-group ${activeLine === 'head' ? 'active' : ''}`} onClick={() => handleLineClick('head')}>
                    <path d="M 170,340 C 235,330 310,345 380,405" className="click-zone" />
                    <path d="M 170,340 C 235,330 310,345 380,405" className="palm-line-stroke" />
                  </g>

                  <g className={`line-group ${activeLine === 'heart' ? 'active' : ''}`} onClick={() => handleLineClick('heart')}>
                    <path d="M 400,320 C 340,350 280,345 225,305" className="click-zone" />
                    <path d="M 400,320 C 340,350 280,345 225,305" className="palm-line-stroke" />
                  </g>

                  <g className={`line-group ${activeLine === 'fate' ? 'active' : ''}`} onClick={() => handleLineClick('fate')}>
                    <path d="M 295,635 C 280,540 275,460 265,380 L 255,295" className="click-zone"/>
                    <path d="M 295,635 C 280,540 275,460 265,380 L 255,295" className="palm-line-stroke"/>
                  </g>

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
                    Toca una línea para leerla
                  </div>
                )}
              </div>
            </div>

            <div className="info-panel-col">
              <div className="guide-info-box">
                {activeLine ? (
                  <div className="info-content active fade-in">
                    {loading ? (
                      <VeloraLoader message="Velora está trazando tu piel..." compact />
                    ) : lineError ? (
                      <div className="palm-line-error">
                        <strong>{lineError.titulo}</strong>
                        <p>{lineError.mensaje}</p>
                        <button className="clear-selection-btn" onClick={() => { setActiveLine(null); setLineError(''); }}>
                          Volver
                        </button>
                      </div>
                    ) : reading ? (
                      <>
                        <h3>{reading.line_name}</h3>
                        <div className="divider-ornament">✻</div>

                        <div className="base-reading-box">
                          <strong>Lectura de la forma:</strong>
                          <p>"{reading.base_reading}"</p>
                        </div>

                        {reading.velora_voice && (
                          <div className="velora-reading-text">
                            {reading.velora_voice.split('\n').map((line, i) => (
                              line.trim() && <p key={i}>{line}</p>
                            ))}
                          </div>
                        )}

                        {reading.reflejo && (
                          <div className="palm-reflection">
                            {reading.reflejo}
                          </div>
                        )}

                        <button className="clear-selection-btn" onClick={() => setActiveLine(null)}>
                          Ver otra línea
                        </button>
                      </>
                    ) : (
                      <p>Esperando lectura...</p>
                    )}
                  </div>
                ) : (
                  <div className="info-content placeholder">
                    <h3>Sabiduría en tus manos</h3>
                    <p>
                      "La mano es el espejo del hábito: aquello que repetimos termina dibujando dirección."
                    </p>
                    <p className="small-hint">
                      Selecciona un trazo en la ilustración o cambia a lectura por imagen para usar cámara o foto.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <div className="upload-layout palm-image-layout fade-in">
            <section className="palm-capture-panel">
              <div className="palm-instructions">
                <span className="palm-panel-kicker">Cómo debe verse</span>
                <h3>Palma abierta, luz suave y mano completa</h3>
                <ul>
                  <li>Fotografía la palma de frente, desde la muñeca hasta la punta de los dedos.</li>
                  <li>Usa fondo liso, buena luz y evita sombras fuertes sobre las líneas.</li>
                  <li>Relaja la mano: dedos ligeramente separados, sin cerrar la palma.</li>
                  <li>En cámara, alinea la mano con la silueta y deja un pequeño margen alrededor.</li>
                </ul>
              </div>

              <div className="hand-choice">
                <span className="palm-panel-kicker">Qué mano leer</span>
                <div className="hand-choice-grid">
                  {HAND_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      className={`hand-choice-btn ${handSide === option.id ? 'active' : ''}`}
                      onClick={() => setHandSide(option.id)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.title}</span>
                      <small>{option.description}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="capture-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="palm-file-input"
                />
                <button className="palm-action-btn" onClick={() => fileInputRef.current?.click()}>
                  Subir imagen
                </button>
                <button className="palm-action-btn" onClick={startCamera} disabled={cameraActive}>
                  Usar cámara
                </button>
              </div>

              {cameraError && <p className="palm-error">{cameraError}</p>}
            </section>

            <section className="palm-preview-panel">
              {cameraActive ? (
                <div className="camera-preview">
                  <div className="camera-viewport">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      onLoadedData={() => setCameraReady(true)}
                      onCanPlay={() => setCameraReady(true)}
                    />
                    <div className="camera-hand-guide" aria-hidden="true">
                      <span className="camera-guide-label camera-guide-label--top">Dedos arriba</span>
                      <svg
                        viewBox="0 0 240 340"
                        className={`camera-hand-silhouette ${handSide === 'left' ? 'is-left' : ''}`}
                      >
                        <path d="M108 312c-25-2-48-15-59-37-13-25-8-48-1-69l14-42-11-47c-3-13 3-24 14-26 12-2 20 5 23 17l10 36-4-93c-1-14 6-24 18-25 13-1 21 8 22 22l5 76 4-88c1-14 9-22 21-21 12 1 19 11 18 25l-5 91 14-75c3-13 12-19 24-16 12 3 17 14 14 27l-19 83 20-44c6-11 17-14 27-8 10 6 12 18 6 29l-28 52c-8 16-7 31-5 49l6 47c4 31-2 62-20 85-17 22-43 34-70 33Z" />
                        <path className="camera-palm-line" d="M78 194c23 13 60 16 96 1M80 232c28 16 67 16 99-2M113 157c12 15 15 40 10 68" />
                      </svg>
                      <span className="camera-guide-label camera-guide-label--bottom">Muñeca abajo</span>
                    </div>
                    {!cameraReady && <span className="camera-status">Preparando cámara...</span>}
                  </div>
                  <p className="camera-guidance">
                    Centra una sola mano, palma hacia la cámara, dentro de la silueta.
                  </p>
                  <div className="camera-actions">
                    <button className="palm-action-btn palm-action-btn--dark" onClick={capturePhoto} disabled={!cameraReady}>
                      Capturar mano
                    </button>
                    <button className="palm-action-btn" onClick={stopCamera}>
                      Cerrar cámara
                    </button>
                  </div>
                </div>
              ) : photo.src ? (
                <div className="photo-preview">
                  <img src={photo.src} alt="Mano seleccionada para lectura" />
                  <div className="photo-meta">
                    <span>{photo.source === 'camera' ? 'Cámara' : 'Archivo'}</span>
                    <strong>{getQualityLabel(photo)}</strong>
                    <small>{photo.width} x {photo.height}px</small>
                  </div>
                </div>
              ) : (
                <div className="photo-empty-state">
                  <img
                    className="palm-empty-hand"
                    src="/assets/icons/mano.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <h3>Esperando una mano</h3>
                  <p>Sube una foto o abre la cámara para preparar la lectura.</p>
                </div>
              )}

              {scanError && <p className="palm-error">{scanError}</p>}

              {!scanLoading && !scanReading && (
                <button
                  className="scan-palm-btn"
                  onClick={handleScan}
                  disabled={!photo.src || cameraActive}
                >
                  {photo.src ? 'Leer esta mano' : 'Sube o captura una mano primero'}
                </button>
              )}

              {scanReading && (
                <button className="scan-palm-btn" onClick={handleNewScan}>
                  Nueva lectura
                </button>
              )}
            </section>

            <section className="palm-scan-panel">
              {scanLoading ? (
                <div className="palm-waiting">
                  <VeloraLoader compact />
                  <div className="palm-lore-card" key={activeLore.title}>
                    <span>{activeLore.kind}</span>
                    <h3>{activeLore.title}</h3>
                    <p>{activeLore.body}</p>
                  </div>
                </div>
              ) : scanReading ? (
                <div className="scan-reading">
                  <span className="palm-panel-kicker">Lectura emitida</span>
                  <h3>{scanReading.hand_label}</h3>
                  <p>{scanReading.base_reading}</p>
                  <div className="scan-lines">
                    {scanReading.focus_lines.map(line => (
                      <article key={line.line_id}>
                        <strong>{line.line_name}</strong>
                        <p>{line.base_reading}</p>
                      </article>
                    ))}
                  </div>
                  <div className="palm-reflection">
                    {scanReading.reflejo}
                  </div>
                </div>
              ) : (
                <div className="palm-scan-placeholder">
                  <span className="palm-panel-kicker">Mientras se prepara</span>
                  <h3>Velora leerá el gesto visible</h3>
                  <p>{palmLore.purpose}</p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default PalmistryService;