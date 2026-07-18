import React, { useState } from 'react';
import './CrystalService.css'; // Asegúrate de que el CSS tenga este nombre

const CrystalService = ({ onServiceResult }) => {
  const [inputQuestion, setInputQuestion] = useState("");
  const [state, setState] = useState('idle'); // idle, gazing, revealed
  const [response, setResponse] = useState(null);
  const [fogIntensity, setFogIntensity] = useState(0); 

  // Función modificada para usar POST y conectar con Velora
  const consultOracle = async (presetQuestion = null) => {
    // Si viene una pregunta predefinida (botones), la usamos. Si no, la del input.
    const questionToSend = presetQuestion || inputQuestion;

    if (!questionToSend.trim()) return;
    if (state === 'gazing') return;
    
    setState('gazing');
    setResponse(null);
    setFogIntensity(1); // Niebla al máximo

    // Promesa de tiempo mínimo (3 segundos) para disfrutar la animación
    const minTimePromise = new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // 1. Llamada al Backend (POST)
      const fetchPromise = fetch('/crystal/gaze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionToSend })
      }).then(res => {
        if (!res.ok) throw new Error("La visión se ha nublado...");
        return res.json();
      });

      // 2. Esperamos a que terminen la animación Y la petición
      const [_, data] = await Promise.all([minTimePromise, fetchPromise]);

      // 3. Formateamos la respuesta de Velora
      const vision = {
        text: data.velora_voice,
        reflection: data.reflejo,
        topic: data.topic === 'yes_no' ? 'Sí / No' : data.topic.toUpperCase(),
        isClarityHigh: true // Velora siempre ve claro, pero mantenemos tu variable visual
      };
      setResponse(vision);
      onServiceResult?.({
        input: { question: questionToSend },
        ...vision,
      });
        
      setState('revealed');
      setFogIntensity(0.2); // Niebla baja para leer

    } catch (error) {
      console.error(error);
      const errorVision = {
        text: "El éter está perturbado. Las sombras ocultan la verdad.",
        reflection: "Intenta de nuevo más tarde.",
        topic: "Error",
        isClarityHigh: false
      };
      setResponse(errorVision);
      onServiceResult?.(errorVision);
      setState('revealed');
    }
  };

  const handleReset = () => {
    setState('idle');
    setInputQuestion("");
    setResponse(null);
    setFogIntensity(0);
    onServiceResult?.(null);
  };

  return (
    <div className="crystal-container">
      <div className="crystal-card-geometry" aria-hidden="true" />
      
      <div className="crystal-header">
        <span className="crystal-kicker">Bola de cristal</span>
        <h2>La Visión Etérea</h2>
        <p className="velora-whisper">
          "El cristal no muestra lo que quieres ver, sino lo que es."
        </p>
      </div>

      <div className={`scrying-stage ${state === 'gazing' ? 'is-gazing' : ''}`}>
        
        {/* Tus partículas mágicas */}
        <div className="particles-container">
          <span className="magic-particle p1"></span>
          <span className="magic-particle p2"></span>
          <span className="magic-particle p3"></span>
          <span className="magic-particle p4"></span>
          <span className="magic-particle p5"></span>
        </div>

        {/* LA BOLA */}
        <div className={`crystal-ball ${state === 'gazing' ? 'pulsing' : ''}`}>
          
          <div className="ball-shadow"></div>
          <div className="ball-depth"></div> 
          <div className="ball-glass"></div>
          <div className="ball-reflection"></div>
          <div className="ball-highlight"></div>
          
          <div className="ball-inner">
            {/* Niebla dinámica */}
            <div
              className="ball-fog"
              style={{ opacity: state === 'idle' ? 0.15 : fogIntensity }}
            ></div>
            <img
              className="ball-eye-sigil"
              src="/assets/ojo_velora.png"
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="ball-content">
            {state === 'gazing' && (
              <span className="gazing-text">Velora está mirando...</span>
            )}

            {state === 'revealed' && response && (
              <div className={`vision-result ${response.isClarityHigh ? 'clear' : 'blurry'}`}>
                <span className="vision-category">TEMA: {response.topic}</span>
                
                {/* Parseamos saltos de línea de la IA */}
                <div className="vision-message-container">
                    {response.text.split('\n').map((line, i) => (
                        line.trim() && <p key={i} className="vision-message">{line}</p>
                    ))}
                </div>

                {response.reflection && (
                  <div className="vision-reflection">
                    "{response.reflection}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="crystal-stand">
          <div className="stand-ring" aria-hidden="true" />
          <div className="stand-column" aria-hidden="true" />
          <div className="stand-foot" aria-hidden="true" />
        </div>
      </div>

      <div className={`crystal-controls ${state !== 'idle' ? 'faded' : ''}`}>
        
        {state === 'idle' ? (
          <>
            <div className="input-area">
              <input 
                type="text" 
                placeholder="Escribe tu pregunta al vacío..." 
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && consultOracle()}
                className="mystic-input"
              />
              <button 
                className="gaze-btn" 
                onClick={() => consultOracle()}
                disabled={!inputQuestion.trim()}
              >
                Consultar
              </button>
            </div>

            <div className="quick-focus">
              <span>O enfoca tu energía rápidamente:</span>
              <div className="focus-buttons">
                {/* Enviamos preguntas predefinidas para activar los topics del backend */}
                <button onClick={() => consultOracle('¿Qué me depara el amor?')}>
                  <span className="focus-icon">♥</span>
                  <span>Amor</span>
                </button>
                <button onClick={() => consultOracle('¿Tendré éxito en el trabajo?')}>
                  <span className="focus-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <rect x="3" y="7.5" width="18" height="12" rx="2" />
                      <path d="M9 7.5V5.8a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 15 5.8v1.7" />
                      <path d="M3 12.5h18" />
                    </svg>
                  </span>
                  <span>Trabajo</span>
                </button>
                <button onClick={() => consultOracle('¿Cómo estará mi energía y salud?')}>
                  <span className="focus-icon">✚</span>
                  <span>Salud</span>
                </button>
                <button onClick={() => consultOracle('¿Sí o No?')}>
                  <span className="focus-icon">?</span>
                  <span>Sí/No</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="reset-area">
             {state === 'revealed' && (
               <button className="reset-vision-btn" onClick={handleReset}>
                 Nueva Visión
               </button>
             )}
          </div>
        )}
      </div>

    </div>
  );
};

export default CrystalService;
