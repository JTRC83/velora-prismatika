import React, { useState } from 'react';
import './AstroService.css'; // Estilos base
import './RitualService.css'; // Estilos del Grimorio
import VeloraLoader from './VeloraLoader';

export default function RitualService({ onServiceResult, userData, onSaveUserData }) {
  const [birthdate, setBirthdate] = useState(userData?.birthdate || '');
  const [ritual, setRitual] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRitual = async (e) => {
    e.preventDefault();
    if(!birthdate) return;
    if (birthdate !== userData?.birthdate) {
      onSaveUserData?.({ birthdate });
    }
    setLoading(true);
    setRitual(null);
    onServiceResult?.(null);

    try {
      const res = await fetch(`/ritual/daily?birthdate=${birthdate}`);
      const data = await res.json();
      setTimeout(() => {
        setRitual(data);
        onServiceResult?.({
          input: { birthdate },
          ...data,
        });
        setLoading(false);
      }, 1000); 
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="astro-service p-6 ritual-container">
      {!ritual ? (
        <section className="ritual-panel" aria-labelledby="ritual-title">
          <div className="ritual-card-geometry" aria-hidden="true" />

          <div className="ritual-intro">
            <span className="ritual-kicker">Rituales diarios</span>
            <h2 id="ritual-title">Grimorio Diario</h2>
            <p>
              Introduce tu fecha de nacimiento para abrir el rito sugerido por el ciclo lunar, tu signo y el pulso del día.
            </p>
          </div>

          <form onSubmit={fetchRitual} className="ritual-form">
            <div className="ritual-field form-group">
              <label htmlFor="ritual-date">
                <span>01</span>
                Fecha de nacimiento
              </label>
              <input
                id="ritual-date"
                type="date"
                value={birthdate}
                onChange={e=>setBirthdate(e.target.value)}
                className="astro-input ritual-input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="astro-btn ritual-submit">
              {loading ? 'Abriendo el grimorio...' : 'Abrir el Grimorio'}
            </button>

            {loading && (
              <VeloraLoader message="Abriendo el grimorio..." compact />
            )}
          </form>
        </section>
      ) : (
        <div className="astro-card-container">
          <section className="astro-card visible ritual-card" aria-live="polite">
            <div className="ritual-card-geometry ritual-card-geometry--result" aria-hidden="true" />
            
            {/* Cabecera del Ritual */}
            <div className="ritual-header">
              <span className="ritual-kicker">Rito emitido</span>
              <h3 className="ritual-title-text">{ritual.ritual_title}</h3>
              <div className="ritual-meta-grid">
                <span className="meta-tag">{ritual.moon_phase}</span>
                <span className="meta-tag">{ritual.sign} ({ritual.element})</span>
              </div>
            </div>

            <div className="ritual-body">
              {/* Materiales (Estilo Lista Elegante) */}
              <div className="ritual-section materials-box">
                <h4>Materiales necesarios</h4>
                <ul>
                  {ritual.ritual_materials.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>

              {/* Pasos */}
              <div className="ritual-section steps-box">
                <h4>El rito</h4>
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
            <div className="astro-horoscope ritual-velora">
              <span className="velora-label">✦ Voluntad Radical ✦</span>
              <p className="velora-text">"{ritual.velora_message}"</p>
            </div>
            
            <button
              onClick={() => {
                setRitual(null);
                onServiceResult?.(null);
              }}
              className="reset-link"
            >
              Nueva lectura
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
