import React, { useState, useEffect, useRef } from 'react';
import './CrystalService.css'; // Asegúrate de que el CSS tenga este nombre

const CrystalService = () => {
  const [inputQuestion, setInputQuestion] = useState("");
  const [state, setState] = useState('idle'); // idle, gazing, revealed
  const [response, setResponse] = useState(null);
  const [fogIntensity, setFogIntensity] = useState(0); 

  const timeoutRef = useRef(null);

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
      const fetchPromise = fetch('http://localhost:8000/crystal/gaze', {
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
      setResponse({
        text: data.velora_voice,
        reflection: data.reflejo,
        topic: data.topic === 'yes_no' ? 'Sí / No' : data.topic.toUpperCase(),
        isClarityHigh: true // Velora siempre ve claro, pero mantenemos tu variable visual
      });
        
      setState('revealed');
      setFogIntensity(0.2); // Niebla baja para leer

    } catch (error) {
      console.error(error);
      setResponse({
        text: "El éter está perturbado. Las sombras ocultan la verdad.",
        reflection: "Intenta de nuevo más tarde.",
        topic: "Error",
        isClarityHigh: false
      });
      setState('revealed');
    }
  };

  const handleReset = () => {
    setState('idle');
    setInputQuestion("");
    setResponse(null);
    setFogIntensity(0);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="crystal-container">
      
      <div className="crystal-header">
        <h2>La Visión Etérea</h2>
        <p className="velora-whisper">
          "El cristal no muestra lo que quieres ver, sino lo que es."
        </p>
      </div>

      <div className="scrying-stage">
        
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
          
          {/* Niebla dinámica */}
          <div 
            className="ball-fog" 
            style={{ opacity: state === 'gazing' ? 0.9 : (state === 'revealed' ? 0.4 : 0.15) }}
          ></div>

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

                <div className="vision-reflection">
                   ✨ "{response.reflection}"
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="crystal-stand">
          <div className="stand-base"></div>
          <div className="stand-neck"></div>
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
                <button onClick={() => consultOracle('¿Qué me depara el amor?')}>♥ Amor</button>
                <button onClick={() => consultOracle('¿Tendré éxito en el trabajo?')}>♦ Trabajo</button>
                <button onClick={() => consultOracle('¿Cómo estará mi energía y salud?')}>♣ Salud</button>
                <button onClick={() => consultOracle('¿Sí o No?')}>? Sí/No</button>
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