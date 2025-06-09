import React from 'react';
import Header from './components/Header';
import CarouselAvatars from './components/CarouselAvatars';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';

export default function App() {
  const [selected, setSelected] = React.useState('sibylla');
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');

  const avatars = [
    { id: 'sibylla',     name: 'Sibylla' },
    { id: 'dee',         name: 'John Dee' },
    { id: 'nostradamus', name: 'Nostradamus' },
    { id: 'crowley',     name: 'Crowley' },
    { id: 'blavatsky',   name: 'H. P. Blavatsky' },
    { id: 'vanga',       name: 'Baba Vanga' },
    { id: 'hermes',      name: 'Hermes Trismegisto' },
    { id: 'paracelso',   name: 'Paracelso' },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, user: true }]);
    setInput('');
  };

  return (
    <div className="app">
      {/* Header */}
      <Header />

      {/* Main content: árbol + carrusel + horóscopo */}
      <div className="main-area">
        {/* Árbol de la Vida */}
        <div className="tree-side">
          <img src="/assets/arbolVida.png" alt="Árbol de la Vida" />
        </div>

        {/* Carrusel */}
        <div className="carousel-area">
          <CarouselAvatars
            avatars={avatars}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Rueda del Zodiaco */}
        <div className="horoscope-side">
          <img
            src="/assets/horoscopo.png"
            alt="Rueda del Zodiaco"
          />
        </div>
      </div>

      {/* Chat + Input */}
      <div className="footer">
        <ChatWindow messages={messages} />
        <InputBar
          value={input}
          onChange={setInput}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}