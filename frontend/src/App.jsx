import React from 'react';
import Header          from './components/Header';
import CarouselAvatars from './components/CarouselAvatars';
import ChatWindow      from './components/ChatWindow';
import InputBar        from './components/InputBar';

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

  const handleSelectService = svc => {
    setSelectedService(svc);
    console.log('Servicio:', svc);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, user: true }]);
    setInput('');
  };

  return (
    <div className="app">
      {/* HEADER */}
      <Header />

      {/* ICON BUTTON BAR */}
      <div className="icon-bar">
        <div className="icon-group left-group"> 
          {SERVICES_LEFT.map(s => (
            <button
              key={s}
              data-tooltip={s} 
              className={`service-button service-${s.replace(/\s+/g, '-').toLowerCase()} ${
                 selectedService === s ? 'selected' : ''
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
              className={`service-button service-${s.replace(/\s+/g, '-').toLowerCase()} ${
                selectedService === s ? 'selected' : ''
        }`}
              onClick={() => handleSelectService(s)}
            >
              <img src={ICONS[s]} alt={s} />
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="main-area">
        <div className="tree-side">
          <img src="/assets/arbolVida.png" alt="Árbol de la Vida" />
        </div>
        <div className="carousel-area">
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
        <div className="horoscope-side">
          <img src="/assets/horoscopo.png" alt="Rueda del Zodiaco" />
        </div>
      </div>

      {/* CHAT + INPUT */}
      <div className="footer">
        <ChatWindow messages={messages} />
        <InputBar value={input} onChange={setInput} onSend={handleSend} />
      </div>
    </div>
  );
}