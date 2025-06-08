import React from 'react';
import ReactDOM from 'react-dom/client';    // <<-- nota el '/client'
import App from './App';
import './styles.css';                       // tu CSS global

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error("No se encontró el elemento con id 'root' en index.html");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);