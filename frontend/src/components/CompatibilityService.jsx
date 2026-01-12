import React, { useState } from 'react';
import './AstroService.css'; // Heredamos estilos base
import './CompatibilityService.css'; // Estilos específicos de fusión

const SIGNS = [
  "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
];

// Mapeo de elementos para colores (usado en CSS)
const ELEMENT_MAP = {
  Fuego: 'fire',
  Tierra: 'earth',
  Aire: 'air',
  Agua: 'water'
};

export default function CompatibilityService() {
  const [sign1, setSign1] = useState('');
  const [sign2, setSign2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!sign1 || !sign2) return;
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Llamada al backend
      const res = await fetch(`/compatibility/check?sign1=${sign1}&sign2=${sign2}`);
      if (!res.ok) throw new Error("Error en la alquimia estelar");
      
      const data = await res.json();
      
      // Pequeño delay artificial para dejar que la animación de carga se vea (opcional)
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      console.error(err);
      setError("No se pudo calcular la afinidad. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="astro-service p-6 compat-container">
      <h2 className="astro-title" style={{ color: '#5a4a42' }}>
        💞 Sinastría de Almas
      </h2>

      {/* --- FORMULARIO DE SELECCIÓN --- */}
      <form onSubmit={handleCalculate} className="astro-form-col compat-form">
        <div className="compat-inputs">
          
          <div className="form-group">
            <label>Tu Signo</label>
            <select 
              value={sign1} 
              onChange={(e) => setSign1(e.target.value)} 
              className="astro-input compat-select"
              required
            >
              <option value="" disabled>Selecciona...</option>
              {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <span className="compat-vs">+</span>

          <div className="form-group">
            <label>Su Signo</label>
            <select 
              value={sign2} 
              onChange={(e) => setSign2(e.target.value)} 
              className="astro-input compat-select"
              required
            >
              <option value="" disabled>Selecciona...</option>
              {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
        </div>

        <button type="submit" disabled={loading || !sign1 || !sign2} className="astro-btn">
          {loading ? 'Fusionando esencias...' : 'Calcular Afinidad'}
        </button>
      </form>

      {error && <p className="astro-error">{error}</p>}

      {/* --- VISUALIZACIÓN DE RESULTADOS --- */}
      {result && (
        <div className="astro-card-container">
          <div className="astro-card visible compat-card">
            
            {/* 1. ANIMACIÓN DE ESFERAS (Diagrama de Venn) */}
            <div className="venn-diagram-container">
              {/* Esfera Izquierda */}
              <div className={`venn-circle left ${ELEMENT_MAP[result.sign1_element]}`}>
                <span className="venn-label">{result.sign1_name}</span>
                <span className="venn-sublabel">{result.sign1_element}</span>
              </div>

              {/* Esfera Derecha */}
              <div className={`venn-circle right ${ELEMENT_MAP[result.sign2_element]}`}>
                <span className="venn-label">{result.sign2_name}</span>
                <span className="venn-sublabel">{result.sign2_element}</span>
              </div>

              {/* Centro (Resultado) */}
              <div className="venn-center">
                <span className="score-number">{result.score}%</span>
              </div>
            </div>

            {/* 2. TEXTO ALQUÍMICO */}
            <div className="alchemy-result">
              <h3 className="alchemy-title">{result.alchemy_title}</h3>
              <p className="alchemy-text">{result.alchemy_text}</p>
            </div>

            {/* 3. MENSAJE DE VELORA */}
            <div className="astro-horoscope mt-4">
              <span className="velora-label">✦ Consejo del Vínculo ✦</span>
              <p className="velora-text">"{result.velora_message}"</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}