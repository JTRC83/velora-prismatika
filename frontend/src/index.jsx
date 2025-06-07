import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// En React 18+ usamos createRoot:
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);