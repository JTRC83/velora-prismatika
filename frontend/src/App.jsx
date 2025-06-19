import React from 'react';
import Header          from './components/Header';
import CarouselAvatars from './components/CarouselAvatars';
import ChatWindow      from './components/ChatWindow';
import InputBar        from './components/InputBar';
import Curtain         from './components/Curtain';

const ICONS = {
  'Astrología Natal':    '/assets/icons/horoscopo.png',
  'Numerología':         '/assets/icons/numerologia.png',
  'Fases Lunares':       '/assets/icons/fasesDeLuna.png',
  'Compatibilidad':      '/assets/icons/compatibilidad.png',
  'Rituales':            '/assets/icons/vela.png',
  'Chakras':             '/assets/icons/chakras.png',
  'Tarot 3 Cartas':      '/assets/icons/tarot.png',
  'Runas':               '/assets/icons/runas.png',
  'Cábala':              '/assets/icons/cabala.png',
  'Tránsitos':           '/assets/icons/transitosPlanetarios.png',
  'Bola de Cristal':     '/assets/icons/bolaCristal.png',
  'I Ching':             '/assets/icons/iching.png',
};

const SERVICES_LEFT = [
  'Astrología Natal',
  'Numerología',
  'Fases Lunares',
  'Compatibilidad',
  'Rituales',
  'Chakras',
];

const SERVICES_RIGHT = [
  'Tarot 3 Cartas',
  'Runas',
  'Cábala',
  'Tránsitos',
  'Bola de Cristal',
  'I Ching',
];

export default function App() {
  const [selectedAvatar,  setSelectedAvatar]  = React.useState('sibylla');
  const [messages,        setMessages]        = React.useState([]);
  const [input,           setInput]           = React.useState('');
  const [selectedService, setSelectedService] = React.useState(null);
  const [curtainPhase,    setCurtainPhase]    = React.useState('idle'); // idle | closing | opening

  const handleSelectService = svc => {
    if (curtainPhase !== 'idle') return;   // evitar dobles clicks
    setCurtainPhase('closing');
    setTimeout(() => {
      setSelectedService(svc);
      console.log('Servicio:', svc);
      setCurtainPhase('opening');
      setTimeout(() => setCurtainPhase('idle'), 1200);
    }, 1200);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, user: true }]);
    setInput('');
  };

  return (
    <div className="app relative min-h-screen bg-amber-50 flex flex-col items-center">
      {/* 1) Cortinas */}
      <Curtain phase={curtainPhase} />

      {/* 2) Header */}
      <Header />

      {/* 3) Icon-bar */}
      <div className="icon-bar">
        <div className="icon-group left-group"> 
          {SERVICES_LEFT.map(s => (
            <button
              key={s}
              data-tooltip={s}
              className={`service-button ${
                selectedService===s ? 'selected' : ''
              }`}
              onClick={() => handleSelectService(s)}
            >
              <img src={ICONS[s]} alt={s} />
            </button>
          ))}
        </div>
        <div className="logo-placeholder" />
        <div className="icon-group right-group"> 
          {SERVICES_RIGHT.map(s => (
            <button
              key={s}
              data-tooltip={s}
              className={`service-button ${
                selectedService===s ? 'selected' : ''
              }`}
              onClick={() => handleSelectService(s)}
            >
              <img src={ICONS[s]} alt={s} />
            </button>
          ))}
        </div>
      </div>

      {/* 4) Main: árbol + carrusel + horóscopo */}
      <div className="main-area w-full max-w-3xl flex flex-col md:flex-row items-start px-4 pt-4">
        <div className="tree-side pointer-events-none">
          <img src="/assets/arbolVida.png" alt="Árbol de la Vida"
               className="max-h-[60vh] opacity-60 rotate-[-23deg] object-contain"/>
        </div>
        <div className="carousel-area flex-1 flex justify-center items-center">
          <CarouselAvatars
           avatars={[
              { id: 'sibylla',     name: 'Sibylla' },
              { id: 'dee',         name: 'John Dee' },
              { id: 'nostradamus', name: 'Nostradamus' },
              { id: 'crowley',     name: 'Crowley' },
              { id: 'blavatsky',   name: 'H. P. Blavatsky' },
              { id: 'vanga',       name: 'Baba Vanga' },
              { id: 'hermes',      name: 'Hermes Trismegisto' },
              { id: 'paracelso',   name: 'Paracelso' },
            ]}
            selected={selectedAvatar}
            onSelect={setSelectedAvatar}
          />
        </div>
        <div className="horoscope-side pointer-events-none">
          <img src="/assets/horoscopo.png" alt="Rueda del Zodiaco"
               className="max-h-[56vh] rotate-[18deg] opacity-80 object-contain"/>
        </div>
      </div>

      {/* 5) Chat + Input */}
      <div className="w-full max-w-3xl flex flex-col flex-grow px-4 pb-4">
        <div className="flex-grow overflow-y-auto">
          <ChatWindow messages={messages}/>
        </div>
        <div className="pt-2">
          <InputBar value={input} onChange={setInput} onSend={handleSend}/>
        </div>
      </div>
    </div>
  );
}