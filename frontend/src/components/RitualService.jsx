import React, { useState } from 'react';
import './AstroService.css'; // Estilos base
import './RitualService.css'; // Estilos del Grimorio

export default function RitualService() {
  const [birthdate, setBirthdate] = useState('');
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRitual = async (e) => {
    e.preventDefault();
    if(!birthdate) return;
    setLoading(true);
    setRitual(null);

    try {
      const res = await fetch(`/ritual/daily?birthdate=${birthdate}`);
      const data = await res.json();
      setTimeout(() => {
        setRitual(data);
        setLoading(false);
      }, 1000); 
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="astro-service p-6 ritual-container">
      {/* Título unificado con el resto de la app */}
      <h2 className="astro-title">🕯️ Grimorio Diario</h2>
      
      {!ritual ? (
        <form onSubmit={fetchRitual} className="astro-form-col">
          <div className="form-group">
            <label htmlFor="ritual-date">Fecha de Nacimiento:</label>
            <input 
              id="ritual-date"
              type="date" 
              value={birthdate} 
              onChange={e=>setBirthdate(e.target.value)} 
              className="astro-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="astro-btn">
            {loading ? 'Consultando los astros...' : 'Abrir el Grimorio'}
          </button>
        </form>
      ) : (
        <div className="astro-card-container">
          <div className="astro-card visible ritual-card">
            
            {/* Cabecera del Ritual */}
            <div className="ritual-header">
              <h3 className="ritual-title-text">{ritual.ritual_title}</h3>
              <div className="ritual-meta-grid">
                <span className="meta-tag">🌑 {ritual.moon_phase}</span>
                <span className="meta-tag">🔥 {ritual.sign} ({ritual.element})</span>
              </div>
            </div>

            <div className="ritual-body">
              {/* Materiales (Estilo Lista Elegante) */}
              <div className="ritual-section materials-box">
                <h4>✦ Materiales Necesarios</h4>
                <ul>
                  {ritual.ritual_materials.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>

              {/* Pasos */}
              <div className="ritual-section steps-box">
                <h4>✦ El Rito</h4>
                <ol>
                  {ritual.ritual_steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
              
              {/* Mantra (Estilo Pergamino Destacado) */}
              <div className="ritual-mantra-box">
                <span className="mantra-label">Afirmación de Poder</span>
                <p className="mantra-text">"{ritual.ritual_mantra}"</p>
              </div>
            </div>

            {/* Voz de Velora (Estilo idéntico a AstroService) */}
            <div className="astro-horoscope mt-4">
              <span className="velora-label">✦ Voluntad Radical ✦</span>
              <p className="velora-text">"{ritual.velora_message}"</p>
            </div>
            
            <button onClick={() => setRitual(null)} className="reset-link">
              ⟳ Consultar otra fecha
            </button>
          </div>
        </div>
      )}
    </div>
  );
}