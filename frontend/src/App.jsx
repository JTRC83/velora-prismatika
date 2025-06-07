// src/App.jsx
import React from 'react';
import Header from './components/Header';
import AvatarSelector from './components/AvatarSelector';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';

export default function App() {
  const [selectedAvatar, setSelectedAvatar] = React.useState('sibylla');
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');

  const avatars = [
    { id: 'sibylla', name: 'Sibylla' },
    { id: 'dee', name: 'John Dee' },
    { id: 'nostradamus', name: 'Nostradamus' },
    { id: 'crowley', name: 'Crowley' },
    { id: 'blavatsky', name: 'H. P. Blavatsky' },
    { id: 'vanga', name: 'Baba Vanga' },
    { id: 'hermes', name: 'Hermes Trismegisto' },
    { id: 'paracelso', name: 'Paracelso' }
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { text: input, user: true }]);
    // TODO: fetch al backend
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <AvatarSelector
        avatars={avatars}
        selected={selectedAvatar}
        onSelect={setSelectedAvatar}
      />
      <ChatWindow messages={messages} />
      <InputBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
      />
    </div>
  );
}