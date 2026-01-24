import React, { useState } from 'react';
import './KabbalahService.css';

// Mantenemos tus datos visuales para dibujar el árbol rápido (coordenadas x,y)
// Los datos profundos vendrán del backend al seleccionar.
const VISUAL_SEPHIROTH = [
  { id: 1, name: "Kéter", hebrew: "כֶּתֶר", color: "#F5F5F5", x: 50, y: 10 },
  { id: 2, name: "Jojmá", hebrew: "חָכְמָה", color: "#CFD8DC", x: 85, y: 25 },
  { id: 3, name: "Biná", hebrew: "בִּינָה", color: "#212121", x: 15, y: 25 },
  { id: 4, name: "Jesed", hebrew: "חֶסֶד", color: "#1565C0", x: 85, y: 45 },
  { id: 5, name: "Guevurá", hebrew: "גְּבוּרָה", color: "#D32F2F", x: 15, y: 45 },
  { id: 6, name: "Tiféret", hebrew: "תִּפְאֶרֶת", color: "#FFC107", x: 50, y: 55 },
  { id: 7, name: "Nétsaj", hebrew: "נֵצַח", color: "#4CAF50", x: 85, y: 75 },
  { id: 8, name: "Hod", hebrew: "הוֹד", color: "#FF9800", x: 15, y: 75 },
  { id: 9, name: "Yesod", hebrew: "יְסוֹד", color: "#9C27B0", x: 50, y: 85 },
  { id: 10, name: "Malkut", hebrew: "מַלְכוּת", color: "#5D4037", x: 50, y: 100 }
];

const PATHS = [
  [1,2], [1,3], [1,6], [2,3], [2,4], [2,6], [3,5], [3,6],
  [4,5], [4,6], [4,7], [5,6], [5,8], [6,7], [6,8], [6,9],
  [7,8], [7,9], [7,10], [8,9], [8,10], [9,10]
];

const KabbalahService = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [inputName, setInputName] = useState("");
  const [loading, setLoading] = useState(false);
  const [gematriaResult, setGematriaResult] = useState(null);
  const [veloraMessage, setVeloraMessage] = useState(null); // Nuevo estado para IA

  // 1. SELECCIÓN MANUAL (Carga datos estáticos del JSON visual + info básica)
  // Nota: Para hacerlo perfecto, podríamos pedir info al backend, pero usaremos los datos visuales
  // combinados con una llamada si quisiéramos más detalle. Por ahora, usaremos lo que tenemos.
  const handleNodeClick = (visualNode) => {
    // Simulamos la estructura completa buscando en el array visual (o podríamos hacer un fetch by ID)
    // Para simplificar y no romper tu diseño, usaremos los datos visuales + placeholders
    // O mejor: Hacemos fetch al backend para tener la info completa (virtud, angel, etc)
    fetch(`http://localhost:8000/kabbalah/tree`)
      .then(res => res.json())
      .then(data => {
        const fullData = data.find(s => s.id === visualNode.id);
        if (fullData) {
          // Fusionamos coordenadas visuales con datos del backend
          setSelectedNode({ ...visualNode, ...fullData });
          setGematriaResult(null);
          setVeloraMessage(null);
        }
      });
  };

  // 2. CÁLCULO GEMATRÍA (CONECTADO AL BACKEND)
  const calculateGematria = async () => {
    if (!inputName.trim()) return;
    setLoading(true);
    setVeloraMessage(null);
    setSelectedNode(null);

    try {
      const res = await fetch('http://localhost:8000/kabbalah/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputName })
      });

      if (!res.ok) throw new Error("Error en el cálculo sagrado.");

      const data = await res.json();
      
      // Datos del backend
      const backendSephira = data.calculation.sephira;
      const visualRef = VISUAL_SEPHIROTH.find(s => s.id === backendSephira.id);

      // Fusionamos para mostrar en el árbol
      const completeNode = { ...visualRef, ...backendSephira };
      
      setSelectedNode(completeNode);
      setGematriaResult({
        original: data.calculation.raw_value,
        reduced: data.calculation.reduced_value,
        sephira: completeNode
      });
      
      // Guardamos el mensaje de Velora
      setVeloraMessage({
        voice: data.velora_voice,
        reflection: data.reflejo
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kabbalah-container">
      
      <div className="kabbalah-header">
        <h2>El Árbol de la Vida</h2>
        <p className="velora-whisper">
            "Diez esferas de luz. Conoce tu estructura interior."
        </p>
        <div className="kabbalah-explanation">
            <p>
            Tu nombre es una fórmula de energía. Velora utiliza la <strong>Gematría</strong> para 
            revelar con qué esfera del Árbol resuena tu esencia.
            </p>
        </div>
      </div>

      <div className="kabbalah-workspace">
        
        {/* ÁRBOL INTERACTIVO */}
        <div className="tree-visual">
          <svg viewBox="0 0 100 115" className="tree-svg">
            {PATHS.map(([startId, endId], index) => {
              const start = VISUAL_SEPHIROTH.find(s => s.id === startId);
              const end = VISUAL_SEPHIROTH.find(s => s.id === endId);
              return (
                <line 
                  key={index}
                  x1={start.x} y1={start.y}
                  x2={end.x} y2={end.y}
                  className="tree-path"
                />
              );
            })}

            {VISUAL_SEPHIROTH.map((node) => (
              <g 
                key={node.id} 
                className={`tree-node-group ${selectedNode?.id === node.id ? 'active' : ''}`}
                onClick={() => handleNodeClick(node)}
              >
                <circle cx={node.x} cy={node.y} r="6" className="node-halo" fill={node.color} />
                <circle cx={node.x} cy={node.y} r="3.5" className="node-core" />
                <text x={node.x} y={node.y + 1.2} fontSize="2.5" textAnchor="middle" className="node-text">
                  {node.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* PANEL DERECHO */}
        <div className="kabbalah-panel">
          
          {selectedNode ? (
            <div className="sephira-card fade-in">
              <div className="sephira-header" style={{ borderColor: selectedNode.color || '#ccc' }}>
                <span className="hebrew-big">{selectedNode.hebrew}</span>
                <h3>{selectedNode.name}</h3>
                <span className="path-name">{selectedNode.path}</span>
              </div>
              
              <div className="sephira-body">
                <p className="main-meaning">{selectedNode.meaning}</p>
                
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
                  <strong>⚠️ Sombra (Qlifot):</strong>
                  <p>{selectedNode.shadow}</p>
                </div>
                
                {/* --- SECCIÓN NUEVA: MENSAJE DE VELORA --- */}
                {veloraMessage && gematriaResult?.sephira.id === selectedNode.id && (
                  <div className="velora-kabbalah-msg fade-in">
                    <div className="gematria-match-msg">
                       ★ {inputName}, tu vibración es {gematriaResult.reduced} ★
                    </div>
                    
                    <div className="velora-text-content">
                        {veloraMessage.voice.split('\n').map((line, i) => (
                            line.trim() && <p key={i}>{line}</p>
                        ))}
                    </div>
                    <div className="velora-reflection">
                        "{veloraMessage.reflection}"
                    </div>
                  </div>
                )}

                <button className="close-btn" onClick={() => setSelectedNode(null)}>
                  Volver al Mapa
                </button>
              </div>
            </div>
          ) : (
            <div className="gematria-tool fade-in">
              <h3>Gematria Cabalística</h3>
              <p>Descubre tu esfera regente.</p>
              
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Tu Nombre..." 
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && calculateGematria()}
                />
                <button onClick={calculateGematria} disabled={loading}>
                  {loading ? "..." : "Calcular"}
                </button>
              </div>

              <div className="wisdom-note">
                <small>"El nombre es la llave de la esencia."</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KabbalahService;