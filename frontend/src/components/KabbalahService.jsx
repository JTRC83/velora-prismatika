import React, { useState } from 'react';
import './KabbalahService.css';

// --- MOCK DATA ENRIQUECIDO ---
const SEPHIROTH_DATA = [
  { 
    id: 1, name: "Kéter", hebrew: "כֶּתֶר", color: "#F5F5F5", 
    path: "La Corona", planet: "Primer Móvil", virtue: "Voluntad Pura", angel: "Metatrón",
    meaning: "El punto inicial de la voluntad divina. La semilla de todo lo que existe.", 
    shadow: "Desconexión de la realidad.", mantra: "EHEIEH", x: 50, y: 10 
  },
  { 
    id: 2, name: "Jojmá", hebrew: "חָכְמָה", color: "#CFD8DC", 
    path: "La Sabiduría", planet: "Zodíaco / Urano", virtue: "Iniciativa", angel: "Raziel",
    meaning: "La fuerza expansiva, la chispa de la idea creativa masculina.", 
    shadow: "Caos mental, dispersión.", mantra: "YAH", x: 85, y: 25 
  },
  { 
    id: 3, name: "Biná", hebrew: "בִּינָה", color: "#212121", 
    path: "El Entendimiento", planet: "Saturno", virtue: "Silencio", angel: "Tzaphkiel",
    meaning: "La fuerza que da forma, estructura y contención. La madre cósmica.", 
    shadow: "Rigidez, melancolía.", mantra: "YHVH ELOHIM", x: 15, y: 25 
  },
  { 
    id: 4, name: "Jesed", hebrew: "חֶסֶד", color: "#1565C0", 
    path: "La Misericordia", planet: "Júpiter", virtue: "Generosidad", angel: "Tzadkiel",
    meaning: "El amor expansivo que nutre y da sin medida. Abundancia.", 
    shadow: "Amor asfixiante, falta de límites.", mantra: "EL", x: 85, y: 45 
  },
  { 
    id: 5, name: "Guevurá", hebrew: "גְּבוּרָה", color: "#D32F2F", 
    path: "La Severidad", planet: "Marte", virtue: "Valor / Disciplina", angel: "Kamael",
    meaning: "La fuerza que limita y juzga para definir la forma.", 
    shadow: "Crueldad, ira descontrolada.", mantra: "ELOHIM GIBOR", x: 15, y: 45 
  },
  { 
    id: 6, name: "Tiféret", hebrew: "תִּפְאֶרֶת", color: "#FFC107", 
    path: "La Belleza", planet: "Sol", virtue: "Integridad", angel: "Miguel",
    meaning: "El corazón del árbol. Equilibrio entre dar y recibir. Armonía.", 
    shadow: "Orgullo, vanidad, egocentrismo.", mantra: "YHVH ELOAH", x: 50, y: 55 
  },
  { 
    id: 7, name: "Nétsaj", hebrew: "נֵצַח", color: "#4CAF50", 
    path: "La Victoria", planet: "Venus", virtue: "Desinterés", angel: "Haniel",
    meaning: "La energía de las emociones, el arte y la atracción.", 
    shadow: "Lujuria, obsesión, promiscuidad.", mantra: "YHVH TZVAOT", x: 85, y: 75 
  },
  { 
    id: 8, name: "Hod", hebrew: "הוֹד", color: "#FF9800", 
    path: "La Gloria", planet: "Mercurio", virtue: "Veracidad", angel: "Rafael",
    meaning: "El intelecto, la lógica, la comunicación y la magia ritual.", 
    shadow: "Mentira, astucia fría.", mantra: "ELOHIM TZVAOT", x: 15, y: 75 
  },
  { 
    id: 9, name: "Yesod", hebrew: "יְסוֹד", color: "#9C27B0", 
    path: "El Fundamento", planet: "Luna", virtue: "Independencia", angel: "Gabriel",
    meaning: "El subconsciente, los sueños, la base astral.", 
    shadow: "Ilusión, fantasía escapista.", mantra: "SHADDAI EL CHAI", x: 50, y: 85 
  },
  { 
    id: 10, name: "Malkut", hebrew: "מַלְכוּת", color: "#5D4037", 
    path: "El Reino", planet: "Tierra", virtue: "Discriminación", angel: "Sandalphon",
    meaning: "El mundo físico, el cuerpo, la manifestación final.", 
    shadow: "Materialismo, inercia.", mantra: "ADONAI HA-ARETZ", x: 50, y: 100 
  }
];

// Rutas/Conexiones tradicionales entre Sephiroth (Indices ID)
const PATHS = [
  [1,2], [1,3], [1,6], [2,3], [2,4], [2,6], [3,5], [3,6],
  [4,5], [4,6], [4,7], [5,6], [5,8], [6,7], [6,8], [6,9],
  [7,8], [7,9], [7,10], [8,9], [8,10], [9,10]
];

const KabbalahService = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [inputName, setInputName] = useState("");
  const [gematriaResult, setGematriaResult] = useState(null);

  // --- LÓGICA DE GEMATRIA SIMPLE (Simulación Frontend) ---
  const calculateGematria = () => {
    if (!inputName) return;
    
    // 1. Calcular valor (A=1, B=2...)
    let total = 0;
    const normalized = inputName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    for (let i = 0; i < normalized.length; i++) {
      const code = normalized.charCodeAt(i);
      if (code >= 65 && code <= 90) total += (code - 64);
    }

    // 2. Reducir a 1-10
    let reduced = total;
    while (reduced > 10) {
      reduced = String(reduced).split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }

    // 3. Buscar Sephirá correspondiente
    const sephira = SEPHIROTH_DATA.find(s => s.id === reduced);
    setGematriaResult({ original: total, reduced, sephira });
    setSelectedNode(sephira); // Auto-seleccionar en el árbol
  };

  return (
    <div className="kabbalah-container">
      
      {/* HEADER CON EXPLICACIÓN */}
        <div className="kabbalah-header">
        <h2>El Árbol de la Vida</h2>
        <p className="velora-whisper">
            "Diez esferas de luz, veintidós senderos de verdad. Conoce tu estructura interior."
        </p>
        
        {/* NUEVO BLOQUE EXPLICATIVO */}
        <div className="kabbalah-explanation">
            <p>
            Según la mística antigua, <strong>tu nombre no es casualidad: es una fórmula de energía</strong>. 
            Esta herramienta utiliza la <strong>Gematría</strong> para traducir tus letras en números y revelar 
            con qué esfera del Árbol resuena tu esencia.
            </p>
            <span className="instruction-tag"> Escribe tu nombre o apodo abajo para descubrirlo ▼</span>
        </div>
        </div>

      <div className="kabbalah-workspace">
        
        {/* IZQUIERDA: EL ÁRBOL (SVG INTERACTIVO) */}
        <div className="tree-visual">
          <svg viewBox="0 0 100 115" className="tree-svg">
            {/* 1. DIBUJAR SENDEROS (LÍNEAS) */}
            {PATHS.map(([startId, endId], index) => {
              const start = SEPHIROTH_DATA.find(s => s.id === startId);
              const end = SEPHIROTH_DATA.find(s => s.id === endId);
              return (
                <line 
                  key={index}
                  x1={start.x} y1={start.y}
                  x2={end.x} y2={end.y}
                  className="tree-path"
                />
              );
            })}

            {/* 2. DIBUJAR NODOS (CÍRCULOS) */}
            {SEPHIROTH_DATA.map((node) => (
              <g 
                key={node.id} 
                className={`tree-node-group ${selectedNode?.id === node.id ? 'active' : ''}`}
                onClick={() => { setSelectedNode(node); setGematriaResult(null); }}
              >
                {/* Halo brillante */}
                <circle cx={node.x} cy={node.y} r="6" className="node-halo" fill={node.color} />
                {/* Núcleo */}
                <circle cx={node.x} cy={node.y} r="3.5" className="node-core" />
                {/* Texto ID (opcional, o letra hebrea) */}
                <text x={node.x} y={node.y + 1.2} fontSize="2.5" textAnchor="middle" className="node-text">
                  {node.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* DERECHA: PANEL DE INFORMACIÓN / HERRAMIENTAS */}
        <div className="kabbalah-panel">
          
          {/* MODO 1: DETALLE DE SEPHIRÁ (COMPLETO) */}
          {selectedNode ? (
            <div className="sephira-card fade-in">
              <div className="sephira-header" style={{ borderColor: selectedNode.color }}>
                <span className="hebrew-big">{selectedNode.hebrew}</span>
                <h3>{selectedNode.name}</h3>
                <span className="path-name">{selectedNode.path}</span>
              </div>
              
              <div className="sephira-body">
                <p className="main-meaning">{selectedNode.meaning}</p>
                
                {/* NUEVO: Rejilla de Atributos */}
                <div className="attributes-grid">
                  <div className="attr-item">
                    <span className="attr-label">Virtud</span>
                    <span className="attr-value">{selectedNode.virtue}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-label">Astro</span>
                    <span className="attr-value">{selectedNode.planet}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-label">Arcángel</span>
                    <span className="attr-value">{selectedNode.angel}</span>
                  </div>
                  <div className="attr-item">
                     <span className="attr-label">Mantra</span>
                     <span className="attr-value mantra-text">{selectedNode.mantra}</span>
                  </div>
                </div>

                <div className="shadow-box">
                  <strong>⚠️ Aspecto Sombra (Qlifot):</strong>
                  <p>{selectedNode.shadow}</p>
                </div>
                
                {gematriaResult && gematriaResult.sephira.id === selectedNode.id && (
                  <div className="gematria-match-msg">
                    ★ Tu nombre vibra con esta energía ★
                  </div>
                )}

                <button className="close-btn" onClick={() => setSelectedNode(null)}>
                  Volver al Mapa
                </button>
              </div>
            </div>
          ) : (
            /* MODO 2: CALCULADORA GEMATRIA (DEFAULT) */
            <div className="gematria-tool fade-in">
              <h3>Gematria Cabalística</h3>
              <p>Descubre qué esfera rige la vibración de tu nombre.</p>
              
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Tu Nombre..." 
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && calculateGematria()}
                />
                <button onClick={calculateGematria}>Calcular</button>
              </div>

              <div className="wisdom-note">
                <small>
                  "El nombre no es solo una etiqueta, es la fórmula de tu esencia."
                </small>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default KabbalahService;