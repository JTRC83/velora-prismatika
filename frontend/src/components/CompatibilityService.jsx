import React, { useEffect, useRef, useState } from 'react';
import './AstroService.css'; // Heredamos estilos base
import './CompatibilityService.css'; // Estilos específicos de fusión
import VeloraLoader from './VeloraLoader';

const SIGNS = [
  "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
];

// Mapeo de elementos para colores
const ELEMENT_MAP = {
  Fuego: 'fire',
  Tierra: 'earth',
  Aire: 'air',
  Agua: 'water'
};

export default function CompatibilityService({ onServiceResult }) {
  const [sign1, setSign1] = useState('');
  const [sign2, setSign2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSelect, setOpenSelect] = useState(null);
  const selectAreaRef = useRef(null);

  useEffect(() => {
    if (!openSelect) return undefined;

    const handlePointerDown = (event) => {
      if (selectAreaRef.current && !selectAreaRef.current.contains(event.target)) {
        setOpenSelect(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openSelect]);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!sign1 || !sign2) return;
    
    setLoading(true);
    setResult(null);
    setError(null);
    onServiceResult?.(null);

    try {
      const res = await fetch(`/compatibility/check?sign1=${sign1}&sign2=${sign2}`);
      if (!res.ok) throw new Error("Error en la alquimia estelar");
      
      const data = await res.json();
      
      // Pequeño delay para la animación
      setTimeout(() => {
        setResult(data);
        onServiceResult?.({
          input: { sign1, sign2 },
          ...data,
        });
        setLoading(false);
      }, 800);
      
    } catch (err) {
      console.error(err);
      setError("No se pudo calcular la afinidad. Intenta de nuevo.");
      setLoading(false);
    }
  };

  // Función auxiliar para obtener la clase de color limpia
  const getElementClass = (elementRaw) => {
    if (!elementRaw) return '';
    // Toma solo la primera palabra (ej: "Fuego, cardinal" -> "Fuego")
    const key = elementRaw.split(',')[0].trim(); 
    return ELEMENT_MAP[key] || '';
  };

  const renderSignPicker = ({ id, pickerKey, value, onChange }) => {
    const isOpen = openSelect === pickerKey;

    return (
      <div className={`compat-select-wrap ${isOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          id={id}
          className="astro-input compat-select compat-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setOpenSelect(isOpen ? null : pickerKey)}
        >
          <span>{value || 'Selecciona...'}</span>
        </button>

        {isOpen && (
          <div className="compat-select-menu" role="listbox" aria-labelledby={id}>
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={`compat-select-option ${!value ? 'is-selected is-placeholder' : 'is-placeholder'}`}
              onClick={() => {
                onChange('');
                setOpenSelect(null);
              }}
            >
              Selecciona...
            </button>
            {SIGNS.map((sign) => (
              <button
                key={sign}
                type="button"
                role="option"
                aria-selected={value === sign}
                className={`compat-select-option ${value === sign ? 'is-selected' : ''}`}
                onClick={() => {
                  onChange(sign);
                  setOpenSelect(null);
                }}
              >
                {sign}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="astro-service p-6 compat-container">
      <div className="compat-shell">
        <section className="compat-panel" aria-labelledby="compat-title">
          <div className="compat-card-geometry" aria-hidden="true" />

          <div className="compat-header">
            <span className="compat-kicker">Afinidad de signos</span>
            <h2 id="compat-title">Sinastría de Almas</h2>
            <p>
              Elige dos signos para observar cómo se mezclan sus elementos, su clima activo y el consejo del vínculo.
            </p>
          </div>

          {/* --- FORMULARIO --- */}
          <form onSubmit={handleCalculate} className="compat-form">
            <div className="compat-inputs" ref={selectAreaRef}>
              <div className="form-group compat-field">
                <label htmlFor="compat-sign-1">
                  <span>01</span>
                  Tu signo
                </label>
                {renderSignPicker({
                  id: 'compat-sign-1',
                  pickerKey: 'sign1',
                  value: sign1,
                  onChange: setSign1
                })}
              </div>

              <span className="compat-vs" aria-hidden="true">+</span>

              <div className="form-group compat-field">
                <label htmlFor="compat-sign-2">
                  <span>02</span>
                  Su signo
                </label>
                {renderSignPicker({
                  id: 'compat-sign-2',
                  pickerKey: 'sign2',
                  value: sign2,
                  onChange: setSign2
                })}
              </div>
            </div>

            <button type="submit" disabled={loading || !sign1 || !sign2} className="astro-btn compat-submit">
              {loading ? 'Fusionando esencias...' : 'Calcular afinidad'}
            </button>

            {loading && (
              <VeloraLoader message="Fusionando esencias..." compact />
            )}
          </form>
        </section>
      </div>

      {error && <p className="astro-error">{error}</p>}

      {/* --- RESULTADOS --- */}
      {result && (
        <div className="astro-card-container">
          <section className="astro-card visible compat-card" aria-live="polite">
            <div className="compat-card-geometry compat-card-geometry--result" aria-hidden="true" />
            
            <div className="compat-result-hero">
              {/* 1. DIAGRAMA DE VENN */}
              <div className="venn-diagram-container">
                {/* Esfera Izquierda */}
                <div className={`venn-circle left ${getElementClass(result.sign1_element)}`}>
                  <span className="venn-label">{result.sign1_name}</span>
                  <span className="venn-sublabel">{result.sign1_element.split(',')[0]}</span>
                </div>

                {/* Esfera Derecha */}
                <div className={`venn-circle right ${getElementClass(result.sign2_element)}`}>
                  <span className="venn-label">{result.sign2_name}</span>
                  <span className="venn-sublabel">{result.sign2_element.split(',')[0]}</span>
                </div>

                {/* Centro (Resultado) */}
                <div className="venn-center">
                  {/* Usamos total_score (suma de base + bonus) */}
                  <span className="score-number">{result.total_score}%</span>
                </div>

                {/* Badge si hay Bonus Cósmico */}
                {result.transit_bonus > 0 && (
                  <div className="transit-badge">
                    +{result.transit_bonus}%
                  </div>
                )}
              </div>

              <div className="compat-result-heading">
                <span className="compat-kicker">Lectura emitida</span>
                <h3>{result.sign1_name} + {result.sign2_name}</h3>
                <p>{result.alchemy_title}</p>
              </div>
            </div>

            {/* 2. TEXTO ALQUÍMICO */}
            <div className="alchemy-result">
              <p className="alchemy-text">{result.alchemy_text}</p>
            </div>

            {/* Explicación del Clima Astral */}
            <div className="transit-info-box">
              <strong>Clima Astral de Hoy</strong>
              <p>{result.transit_message}</p>
            </div>

            {/* 3. MENSAJE DE VELORA */}
            <div className="astro-horoscope compat-velora">
              <span className="velora-label">✦ Consejo del Vínculo ✦</span>
              <p className="velora-text">"{result.velora_message}"</p>
            </div>

          </section>
        </div>
      )}
    </div>
  );
}
