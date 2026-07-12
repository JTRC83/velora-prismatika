import React from "react";
import Header          from "./components/Header";
import CarouselAvatars from "./components/CarouselAvatars";
import ChatWindow      from "./components/ChatWindow";
import InputBar        from "./components/InputBar";
import Curtain         from "./components/Curtain";
import { slugify }     from "./utils/slugify";
import { useUserData } from "./utils/useUserData";
// Servicios existentes
import AstroService         from './components/AstroService';
import NumerologyService    from "./components/NumerologyService";
import MoonPhaseService     from "./components/MoonPhaseService"; 
import CompatibilityService from "./components/CompatibilityService"; 
import RitualService        from "./components/RitualService"; 
import ChakraService        from "./components/ChakraService";
// NUEVO: Importar el servicio de Tarot
import TarotService         from "./components/TarotService";
import RunesService         from "./components/RunesService";
import KabbalahService      from "./components/KabbalahService";
import TransitsService      from "./components/TransitsService";
import CrystalBallService   from "./components/CrystalService";
import PalmistryService     from "./components/PalmistryService";
import VeloraInsightCard    from "./components/VeloraInsightCard";

const ICONS = {
  "Astrología Natal":  "/assets/icons/horoscopo.png",
  "Numerología":       "/assets/icons/numerologia.png",
  "Fases Lunares":     "/assets/icons/fasesDeLuna.png",
  "Compatibilidad":    "/assets/icons/compatibilidad.png",
  "Rituales":          "/assets/icons/vela.png",
  "Chakras":           "/assets/icons/chakras.png",
  "Tarot 3 Cartas":    "/assets/icons/tarot.png",
  "Runas":             "/assets/icons/runas.png",
  "Cábala":            "/assets/icons/cabala.png",
  "Tránsitos":         "/assets/icons/transitosPlanetarios.png",
  "Bola de Cristal":   "/assets/icons/bolaCristal.png",
  "Lectura de Mano":   "/assets/icons/mano.png",
};

const SERVICES_LEFT  = [
  "Astrología Natal",
  "Numerología",
  "Fases Lunares",
  "Compatibilidad",
  "Rituales",
  "Chakras",
];

const SERVICES_RIGHT = [
  "Tarot 3 Cartas",
  "Runas",
  "Cábala",
  "Tránsitos",
  "Bola de Cristal",
  "Lectura de Mano",
];

const TOOLTIP_TEXT = {
  'Astrología Natal': 'Carta natal y horóscopo',
  'Numerología':      'Numerología',
  'Fases Lunares':    'Fase lunar',
  'Compatibilidad':   'Afinidad entre signos zodiacales',
  'Rituales':         'Rituales diarios',
  'Chakras':          'Lectura de chakras',
  'Tarot 3 Cartas':   'Tarot',
  'Runas':            'Lectura de runas',
  'Cábala':           'Lectura de Sephiroth y Árbol de la Vida',
  'Tránsitos':        'Tránsitos planetarios',
  'Bola de Cristal':  'Bola de cristal',
  'Lectura de Mano':  'Lectura de Mano',
};

const AI_CONTEXT_KEYS = new Set([
  'velora_voice',
  'velora_message',
  'velora_reflection',
  'reflejo',
  'reflection',
  'voice',
]);

function sanitizeServicePayload(payload) {
  if (Array.isArray(payload)) {
    return payload.map(sanitizeServicePayload);
  }

  if (payload && typeof payload === 'object') {
    return Object.fromEntries(
      Object.entries(payload)
        .filter(([key]) => !AI_CONTEXT_KEYS.has(key))
        .map(([key, value]) => [key, sanitizeServicePayload(value)])
    );
  }

  return payload;
}

export default function App() {
  const [selectedAvatar,  setSelectedAvatar]  = React.useState("sibylla");
  const [messages,        setMessages]        = React.useState([]);
  const [input,           setInput]           = React.useState("");
  const [selectedService, setSelectedService] = React.useState(null);
  const [serviceContext,  setServiceContext]  = React.useState(null);
  const [serviceDisplayName, setServiceDisplayName] = React.useState(null);
  const [veloraInsight,   setVeloraInsight]   = React.useState({ status: 'idle' });
  const [curtainPhase,    setCurtainPhase]    = React.useState("idle"); // idle | closing | opening
  const [isSending,       setIsSending]       = React.useState(false);
  const { userData, saveUserData } = useUserData();

  const publishServiceContext = React.useCallback((service, payload) => {
    if (!payload) {
      setServiceContext(null);
      setVeloraInsight({ status: 'idle' });
      return;
    }

    setServiceContext({
      service,
      captured_at: new Date().toISOString(),
      result: sanitizeServicePayload(payload),
    });
  }, []);

  const serviceContextPublishers = React.useMemo(() => ({
    astro: (payload) => publishServiceContext('Astrología Natal', payload),
    numerology: (payload) => publishServiceContext('Numerología', payload),
    moon: (payload) => publishServiceContext('Fases Lunares', payload),
    compatibility: (payload) => publishServiceContext('Compatibilidad', payload),
    rituals: (payload) => publishServiceContext('Rituales', payload),
    chakra: (payload) => publishServiceContext('Chakras', payload),
    tarot: (payload) => {
      const tarotServiceName = payload?.serviceName || payload?.spread?.title || 'Tarot';
      publishServiceContext(tarotServiceName, payload);
    },
    runes: (payload) => publishServiceContext('Runas', payload),
    kabbalah: (payload) => publishServiceContext('Cábala', payload),
    transits: (payload) => publishServiceContext('Tránsitos', payload),
    crystal: (payload) => publishServiceContext('Bola de Cristal', payload),
    palmistry: (payload) => publishServiceContext('Lectura de Mano', payload),
  }), [publishServiceContext]);

  const handleSelectService = svc => {
    // Si la cortina ya se está moviendo, no hacer nada para evitar glitches
    if (curtainPhase !== "idle") return;

    // Si pulsamos el mismo servicio que ya está activo, quizás queramos cerrarlo (volver a home)
    // Opcional: Descomenta esto si quieres que al volver a clicar se cierre
    /* if (selectedService === svc) {
       setCurtainPhase("closing");
       setTimeout(() => {
         setSelectedService(null);
         setCurtainPhase("opening");
         setTimeout(() => setCurtainPhase("idle"), 1200);
       }, 1200);
       return;
    } 
    */

    setCurtainPhase("closing");
    setTimeout(() => {
      setSelectedService(svc);
      setServiceContext(null);
      setServiceDisplayName(null);
      setVeloraInsight({ status: 'idle' });
      setCurtainPhase("opening");
      setTimeout(() => setCurtainPhase("idle"), 1200);
    }, 1200);
  };

  const activeServiceLabel = serviceContext?.service
    || serviceDisplayName
    || (selectedService === 'Tarot 3 Cartas' ? 'Tarot' : selectedService);

  React.useEffect(() => {
    if (!serviceContext) {
      setVeloraInsight({ status: 'idle' });
      return undefined;
    }

    const controller = new AbortController();
    setVeloraInsight({
      status: 'loading',
      service: serviceContext.service,
    });

    fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        usuario: 'ampliar',
        modo: 'ampliar',
        current_service: serviceContext.service || selectedService,
        service_context: serviceContext,
        use_knowledge: true,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Backend respondió con estado ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (controller.signal.aborted) return;
        setVeloraInsight({
          status: 'ready',
          service: serviceContext.service,
          text: data.velora_voice || '',
        });
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        console.error(error);
        setVeloraInsight({
          status: 'error',
          service: serviceContext.service,
        });
      });

    return () => controller.abort();
  }, [selectedService, serviceContext]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages(prev => [...prev, { id: crypto.randomUUID(), text, user: true }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: text,
          current_service: serviceContext?.service || activeServiceLabel || selectedService,
          service_context: serviceContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend respondió con estado ${response.status}`);
      }

      const data = await response.json();

      if (data.incidencia) {
        const inc = data.incidencia;
        const mensajesPorTipo = {
          backend_no_responde: 'No puedo conectar con el servidor de Velora. Verifica que la aplicación esté iniciada.',
          ollama_no_responde: 'El modelo de IA no responde. Ollama puede estar caído o el modelo no está descargado.',
          error_ia: 'Velora no pudo generar una respuesta coherente. Intenta reformular tu pregunta.',
          servicio_no_cargado: 'Uno de los servicios no se cargó correctamente al arrancar.',
          error_interno: `Error interno: ${inc.mensaje}`,
        };
        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: mensajesPorTipo[inc.tipo] || `Incidencia: ${inc.mensaje}`,
            user: false,
            incidencia: inc,
          },
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: data.velora_voice || "La bóveda permanece en silencio por ahora.",
          user: false,
          reflejo: data.reflejo,
          serviceContextUsed: data.service_context_used,
          currentService: data.current_service,
        },
      ]);
    } catch (error) {
      const esFalloConexion = error instanceof TypeError;
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: esFalloConexion
            ? "No puedo conectar con el servidor de Velora. Comprueba que la aplicación esté iniciada por completo."
            : `No he podido abrir el puente con Velora: ${error.message}`,
          user: false,
          error: error.message,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="app relative min-h-screen bg-amber-50 flex flex-col items-center">
      {/* Cortinas */}
      <Curtain phase={curtainPhase} />

      {/* Header */}
      <Header />

      {/* Barra de iconos */}
      <div className="icon-bar">
        <div className="icon-group left-group">
          {SERVICES_LEFT.map(s => (
            <button
              key={s}
              data-tooltip={TOOLTIP_TEXT[s] || s}
              className={
                "service-button " +
                (selectedService === s ? "selected " : "") +
                "service-" + slugify(s)
              }
              onClick={() => handleSelectService(s)}
            >
              <img src={ICONS[s]} alt={s} />
            </button>
          ))}
        </div>
        
        {/* Al hacer clic en el centro (logo), volvemos al Home (null) */}
        <div 
          className="logo-placeholder cursor-pointer" 
          onClick={() => handleSelectService(null)}
          title="Volver al Inicio"
        />
        
        <div className="icon-group right-group">
          {SERVICES_RIGHT.map(s => (
            <button
              key={s}
              data-tooltip={TOOLTIP_TEXT[s] || s} 
              className={
                "service-button " +
                (selectedService === s ? "selected " : "") +
                "service-" + slugify(s)
              }
              onClick={() => handleSelectService(s)}
            >
              <img src={ICONS[s]} alt={s} />
            </button>
          ))}
        </div>
      </div>

      {/* 4) Zona de servicio dinámico */}
      {selectedService === 'Astrología Natal' && <AstroService onServiceResult={serviceContextPublishers.astro} userData={userData} onSaveUserData={saveUserData} />}
      {selectedService === 'Numerología'      && <NumerologyService onServiceResult={serviceContextPublishers.numerology} userData={userData} onSaveUserData={saveUserData} />}
      {selectedService === 'Fases Lunares'    && <MoonPhaseService onServiceResult={serviceContextPublishers.moon} />}
      {selectedService === 'Compatibilidad'   && <CompatibilityService onServiceResult={serviceContextPublishers.compatibility} />}
      {selectedService === 'Rituales'         && <RitualService onServiceResult={serviceContextPublishers.rituals} userData={userData} onSaveUserData={saveUserData} />}
      {selectedService === 'Chakras'          && <ChakraService onServiceResult={serviceContextPublishers.chakra} />}
      
      {/* AQUÍ ESTABA EL CAMBIO CLAVE: Coincidir string exacto "Tarot 3 Cartas" */}
      {selectedService === 'Tarot 3 Cartas'   && (
        <TarotService
          onServiceResult={serviceContextPublishers.tarot}
          onServiceLabelChange={setServiceDisplayName}
        />
      )}
      {selectedService === 'Runas'            && <RunesService onServiceResult={serviceContextPublishers.runes} />}
      {selectedService === 'Cábala'           && <KabbalahService onServiceResult={serviceContextPublishers.kabbalah} />}
      {selectedService === 'Tránsitos'        && <TransitsService onServiceResult={serviceContextPublishers.transits} />}
      {selectedService === 'Bola de Cristal'  && <CrystalBallService onServiceResult={serviceContextPublishers.crystal} />}
      {selectedService === 'Lectura de Mano'  && <PalmistryService onServiceResult={serviceContextPublishers.palmistry} />}

      {selectedService && <VeloraInsightCard insight={veloraInsight} />}
      

      {/* Contenido principal: Árbol, Carrusel, Rueda */}
      {/* Solo se muestra si NO hay un servicio seleccionado */}
      {!selectedService && (
        <div className="main-area w-full max-w-3xl flex flex-col md:flex-row items-start px-4 pt-4">
          <div className="tree-side pointer-events-none">
            <img
              src="/assets/arbolVida.png"
              alt="Árbol de la Vida"
              className="max-h-[60vh] opacity-60 rotate-[-23deg] object-contain"
            />
          </div>
          <div className="carousel-area flex-1 flex justify-center items-center">
            <CarouselAvatars
              avatars={[
                { id: "sibylla",     name: "Sibylla" },
                { id: "dee",         name: "John Dee" },
                { id: "nostradamus", name: "Nostradamus" },
                { id: "crowley",     name: "Crowley" },
                { id: "blavatsky",   name: "H. P. Blavatsky" },
                { id: "vanga",       name: "Baba Vanga" },
                { id: "hermes",      name: "Hermes Trismegisto" },
                { id: "paracelso",   name: "Paracelso" },
              ]}
              selected={selectedAvatar}
              onSelect={setSelectedAvatar}
            />
          </div>
          <div className="horoscope-side pointer-events-none">
            <img
              src="/assets/horoscopo.png"
              alt="Rueda del Zodiaco"
              className="max-h-[56vh] rotate-[18deg] opacity-80 object-contain"
            />
          </div>
        </div>
      )}

      {/* Chat + Input */}
      {
        <div className={`chat-shell w-full max-w-3xl flex flex-col flex-grow px-4 pb-4 ${selectedService ? 'chat-shell--service' : ''}`}>
          {selectedService && (
            <div className="chat-context-strip">
              <span>Velora ve: {activeServiceLabel}</span>
              <small>{serviceContext ? 'lectura disponible' : 'esperando resultado del servicio'}</small>
            </div>
          )}
          <div className="chat-scroll flex-grow overflow-y-auto">
            <ChatWindow messages={messages} />
          </div>
          <div className="chat-input-wrap pt-2">
            <InputBar
              value={input}
              onChange={setInput}
              onSend={handleSend}
              disabled={isSending}
              placeholder={
                serviceContext
                  ? `Pregunta a Velora sobre ${serviceContext.service}…`
                  : activeServiceLabel
                    ? `Pregunta a Velora sobre ${activeServiceLabel}…`
                    : "Escribe tu pregunta…"
              }
            />
          </div>
        </div>
      }
    </div>
  );
}
