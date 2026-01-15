import React, { useState, useEffect, useRef } from 'react';
import './CrystalBallService.css';

// --- MOCK DATA EXPANDIDO ---
const CRYSTAL_DATA = {
  topics: {
    love: {
      id: 'love', label: 'Amor',
      keywords: ["amor", "quiere", "pareja", "corazón", "sentimiento", "relación", "boda", "ex", "gustar", "novio", "novia", "esposo", "mujer"],
      messages: [
        "Una vieja herida sanará pronto para dejar espacio a lo nuevo.",
        "El corazón que buscas late al mismo ritmo que el tuyo, ten paciencia.",
        "Cuidado con las ilusiones; no todo lo que brilla es oro en el afecto.",
        "La bruma se disipa: un encuentro inesperado cambiará tu perspectiva.",
        "Debes soltar el pasado para que el presente pueda abrazarte.",
        "No confundas la intensidad momentánea con la intimidad eterna.",
        "Alguien te observa en silencio con admiración sincera.",
        "El amor propio es la llave que abrirá la puerta que tienes enfrente.",
        "Las aguas están turbulentas; espera a que se calmen antes de decidir.",
        "Una amistad cercana podría transformarse en algo más profundo.",
        "Lo que es para ti, ni el viento ni la marea podrán llevárselo.",
        "No busques completar tu alma, busca quien la acompañe.",
        "Un mensaje inesperado traerá claridad a tus dudas sentimentales.",
        "El ciclo de soledad está llegando a su fin.",
        "A veces, el mayor acto de amor es dejar ir.",
        "La respuesta está en los pequeños detalles, no en los grandes gestos."
      ]
    },
    work: {
      id: 'work', label: 'Trabajo / Dinero',
      keywords: ["trabajo", "dinero", "negocio", "empleo", "jefe", "proyecto", "inversión", "éxito", "carrera", "estudios", "examen", "sueldo"],
      messages: [
        "El esfuerzo invisible de hoy será la corona de mañana.",
        "Cuidado con las envidias cercanas; mantén tus planes en secreto.",
        "Una oportunidad se presentará disfrazada de un desafío difícil.",
        "La abundancia fluye cuando dejas de perseguirla con desesperación.",
        "Es momento de sembrar, no de cosechar. La paciencia es tu aliada.",
        "Un cambio de dirección inesperado te llevará a aguas más prósperas.",
        "Tu intuición financiera es correcta; confía en ese presentimiento.",
        "Revisa los documentos dos veces; el diablo está en los detalles.",
        "La colaboración será tu mayor fortaleza en este ciclo.",
        "No temas pedir lo que vales; el silencio te empobrece.",
        "Se acerca un reconocimiento por una labor del pasado.",
        "La austeridad de hoy es la libertad de mañana.",
        "Un mentor aparecerá para guiarte en la oscuridad.",
        "El estancamiento es solo una pausa para tomar impulso.",
        "Tu creatividad es la moneda más valiosa que posees ahora.",
        "Cierra ese ciclo laboral antes de iniciar la nueva aventura."
      ]
    },
    health: {
      id: 'health', label: 'Salud / Bienestar',
      keywords: ["salud", "cuerpo", "dolor", "mente", "sanar", "energía", "cansancio", "dormir", "estrés", "ansiedad", "medico"],
      messages: [
        "Tu cuerpo susurra lo que tu mente calla; escúchalo.",
        "La vitalidad regresará cuando te permitas descansar de verdad.",
        "Busca el equilibrio en el agua y el aire libre.",
        "La sanación comienza perdonándote a ti mismo.",
        "La tensión en tus hombros no es tuya; suéltala.",
        "Necesitas desconectar del ruido externo para recuperar tu centro.",
        "Alimenta tu fuego interior con luz solar y naturaleza.",
        "El reino de los sueños te pide más tiempo para reparar tu espíritu.",
        "Una vieja dolencia requiere un enfoque emocional, no solo físico.",
        "Tu energía está dispersa; enfócate en una sola cosa a la vez.",
        "Respira. El aire es el primer alimento del alma.",
        "El movimiento será tu medicina; no te quedes quieto.",
        "Cuida tus palabras, pues también afectan a tu bienestar físico.",
        "La risa desbloqueará la energía estancada en tu pecho.",
        "Un cambio en tu rutina nocturna traerá grandes beneficios."
      ]
    },
    yes_no: {
      id: 'yes_no', label: 'Sí / No',
      messages: [
        "Definitivamente sí.", 
        "Las estrellas indican que sí.", 
        "El camino está abierto: sí.",
        "Todo apunta a un resultado favorable.",
        "Sin duda alguna.",
        "Sí, pero no de la forma que esperas.",
        "El universo asiente en silencio.",
        "Mis visiones son oscuras... mejor no.", 
        "No es el momento adecuado.", 
        "El destino dice no.",
        "Hay bloqueos en el camino; la respuesta es no.",
        "Debes detenerte: no.",
        "La imagen es borrosa, pregunta de nuevo más tarde.",
        "El futuro está en movimiento; el resultado es incierto.",
        "Aún no se ha decidido; depende de tu próxima acción.",
        "Pregunta de nuevo cuando cambie la luna."
      ]
    },
    general: {
      id: 'general', label: 'General',
      keywords: [],
      messages: [
        "La niebla es densa, pero la luz al final es innegable.",
        "Lo que buscas también te está buscando a ti.",
        "El destino no está escrito en piedra, sino en agua.",
        "Una sorpresa agradable llegará antes de la próxima luna llena.",
        "Presta atención a tus sueños esta noche; traen mensajes.",
        "Rompe el ciclo o estarás condenado a repetirlo.",
        "Esa corazonada que ignoras es el grito de tu destino.",
        "No es casualidad que estés preguntando esto ahora.",
        "La llave que buscas ya está en tu bolsillo.",
        "Un viaje, físico o espiritual, está marcado en tu horizonte.",
        "Deja de nadar contracorriente y flota.",
        "El silencio tiene la respuesta que el ruido te oculta.",
        "Alguien del pasado volverá con una lección importante.",
        "Confía en el tiempo; es el único juez justo.",
        "Lo que parece un final es solo un nuevo comienzo disfrazado."
      ]
    }
  }
};

const CrystalBallService = () => {
  const [inputQuestion, setInputQuestion] = useState("");
  const [state, setState] = useState('idle'); // idle, gazing, revealed
  const [response, setResponse] = useState(null);
  const [fogIntensity, setFogIntensity] = useState(0); // Para animación visual

  // Referencia para limpiar timeouts si el componente se desmonta
  const timeoutRef = useRef(null);

  // --- LÓGICA DE DETECCIÓN (Simula el Backend) ---
  const detectTopic = (text) => {
    const lowerText = text.toLowerCase();
    for (const key in CRYSTAL_DATA.topics) {
      if (key === 'general' || key === 'yes_no') continue;
      const keywords = CRYSTAL_DATA.topics[key].keywords || [];
      if (keywords.some(kw => lowerText.includes(kw))) {
        return key;
      }
    }
    return null; // Si no detecta nada específico
  };

  const consultOracle = (explicitFocus = null) => {
    if (state === 'gazing') return; // Evitar doble click
    
    setState('gazing');
    setResponse(null);
    setFogIntensity(1); // Activar niebla densa

    // Simular tiempo de "videncia" (2-3 segundos)
    timeoutRef.current = setTimeout(() => {
      let topicKey = 'general';

      // 1. Prioridad: Foco explícito (botones)
      if (explicitFocus) {
        topicKey = explicitFocus;
      } 
      // 2. Prioridad: Detección en texto
      else if (inputQuestion) {
        const detected = detectTopic(inputQuestion);
        if (detected) {
          topicKey = detected;
        } else {
          // Si es una pregunta corta sin keywords claras, asumimos Sí/No
          topicKey = (inputQuestion.length < 15 || inputQuestion.includes('?')) ? 'yes_no' : 'general';
        }
      }

      // --- LÓGICA ANTI-REPETICIÓN ---
      const messages = CRYSTAL_DATA.topics[topicKey].messages;
      let finalMsg;
      let attempts = 0;
      
      // Intentamos hasta 3 veces encontrar uno diferente al que ya se muestra
      do {
        finalMsg = messages[Math.floor(Math.random() * messages.length)];
        attempts++;
      } while (response && finalMsg === response.text && attempts < 3);

      // --- GUARDAR LA RESPUESTA ---
      
      // Calculamos si la visión es nítida (70%) o borrosa (30%)
      const isClarityHigh = Math.random() > 0.3; 

      setResponse({
        text: finalMsg,
        category: CRYSTAL_DATA.topics[topicKey].label,
        isClarityHigh
      });
      
      // Cambiamos el estado visual
      setState('revealed');
      setFogIntensity(0.2); // Niebla suave de fondo
      
    }, 2500);
  }; // <--- ¡AQUÍ FALTABA ESTA LLAVE DE CIERRE!

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
      
      {/* HEADER */}
      <div className="crystal-header">
        <h2>La Visión Etérea</h2>
        <p className="velora-whisper">
          "Despeja tu mente. El cristal no muestra lo que quieres ver, sino lo que es."
        </p>
      </div>

      {/* --- ESCENARIO DE LA BOLA --- */ }
      <div className="scrying-stage">
        
        {/* NUEVO: Partículas flotantes de energía */}
        <div className="particles-container">
          <span className="magic-particle p1"></span>
          <span className="magic-particle p2"></span>
          <span className="magic-particle p3"></span>
          <span className="magic-particle p4"></span>
          <span className="magic-particle p5"></span>
        </div>

        {/* LA BOLA DE CRISTAL */}
        <div className={`crystal-ball ${state === 'gazing' ? 'pulsing' : ''}`}>
          
          <div className="ball-shadow"></div>
          {/* Capa extra de profundidad */}
          <div className="ball-depth"></div> 
          <div className="ball-glass"></div>
          <div className="ball-reflection"></div>
          <div className="ball-highlight"></div>
          
          {/* NIEBLA INTERNA */}
          <div 
            className="ball-fog" 
            style={{ opacity: state === 'gazing' ? 0.9 : (state === 'revealed' ? 0.4 : 0.15) }}
          ></div>

          {/* CONTENIDO INTERNO */}
          <div className="ball-content">
            {state === 'gazing' && (
              <span className="gazing-text">Invocando...</span>
            )}

            {state === 'revealed' && response && (
              <div className={`vision-result ${response.isClarityHigh ? 'clear' : 'blurry'}`}>
                <span className="vision-category">{response.category}</span>
                <p className="vision-message">"{response.text}"</p>
                {!response.isClarityHigh && <small className="blur-hint">La visión es inestable...</small>}
              </div>
            )}
          </div>
        </div>

        {/* PEDESTAL MÍSTICO MEJORADO */}
        <div className="crystal-stand">
          <div className="stand-base"></div>
          <div className="stand-neck"></div>
        </div>
      </div>

      {/* --- CONTROLES --- */}
      <div className={`crystal-controls ${state !== 'idle' ? 'faded' : ''}`}>
        
        {state === 'idle' ? (
          <>
            <div className="input-area">
              <input 
                type="text" 
                placeholder="Escribe tu pregunta aquí..." 
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
              <span>O enfoca tu energía en un tema:</span>
              <div className="focus-buttons">
                <button onClick={() => consultOracle('love')}>♥ Amor</button>
                <button onClick={() => consultOracle('work')}>♦ Trabajo</button>
                <button onClick={() => consultOracle('health')}>♣ Salud</button>
                <button onClick={() => consultOracle('yes_no')}>p? Sí/No</button>
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

export default CrystalBallService;