import React, { useState } from 'react';
import './NumerologyService.css';
import VeloraLoader from './VeloraLoader';

export default function NumerologyService({ onServiceResult }) {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birthdate) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // CAMBIO IMPORTANTE: Ahora usamos POST y el endpoint '/informe'
      const res = await fetch('http://localhost:8000/numerology/informe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.name,
          fecha_nacimiento: formData.birthdate
        }),
      });

      if (!res.ok) {
        throw new Error("Velora no pudo acceder a los registros akásicos.");
      }

      const data = await res.json();
      
      setResult(data);
      onServiceResult?.({
        input: {
          name: formData.name,
          birthdate: formData.birthdate,
        },
        ...data,
      });
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError("Error en la conexión. Verifica que el Backend esté encendido.");
      setLoading(false);
    }
  };

  const handleNewReading = () => {
    setResult(null);
    setError(null);
    onServiceResult?.(null);
  };

  const datos = result?.datos_tecnicos || {};
  const ambientNumbers = ['18', '3', '12', '21', '5', '7', '14', '22', '9', '11'];

  return (
    <div className="num-service p-6">
      <div className="num-hero-grid">
        <div className={`num-flip-card ${result ? 'is-flipped' : ''} ${loading ? 'is-loading' : ''}`}>
          <div className="num-flip-inner">
            <section
              className="num-form-card num-flip-face num-flip-face--front"
              aria-labelledby="num-title"
            >
              <div className="num-card-geometry" aria-hidden="true">
                {ambientNumbers.map((number, index) => (
                  <span key={`${number}-${index}`} className="num-floating-number">
                    {number}
                  </span>
                ))}
              </div>

              <div className="num-form-header">
                <span className="num-kicker">Numerología esencial</span>
                <h2 id="num-title" className="num-title">
                  Arquitectura del Alma
                </h2>
                <p>
                  Traza tu frecuencia base: nombre de nacimiento y fecha como llaves de lectura.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="num-form">
                <div className="num-form-row">
                  <div className="form-group-num num-field-primary">
                    <label htmlFor="num-name">
                      <span>01</span>
                      Nombre completo
                    </label>
                    <input
                      id="num-name"
                      type="text"
                      name="name"
                      placeholder="Nombre de nacimiento"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="form-group-num">
                    <label htmlFor="num-birthdate">
                      <span>02</span>
                      Fecha de nacimiento
                    </label>
                    <input
                      id="num-birthdate"
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="num-btn" disabled={loading}>
                  {loading ? 'Calculando vibración...' : 'Calcular vibración'}
                </button>

                {loading && (
                  <VeloraLoader message="Trazando líneas del destino..." compact />
                )}
              </form>
            </section>

            <section
              className="num-results num-flip-face num-flip-face--back"
              aria-hidden={!result}
              aria-live="polite"
            >
              {result && (
                <>
                  <div className="num-card-geometry num-card-geometry--result" aria-hidden="true">
                    {ambientNumbers.map((number, index) => (
                      <span key={`${number}-${index}`} className="num-floating-number">
                        {number}
                      </span>
                    ))}
                  </div>

                  <div className="num-result-hero">
                    <div className="num-number-seal" aria-hidden="true">
                      <span>{datos.camino_vida}</span>
                      <small>camino</small>
                    </div>

                    <div className="num-result-heading">
                      <span className="num-result-kicker">Lectura emitida</span>
                      <h3>{formData.name || 'Consultante'}</h3>
                      <p>
                        Una síntesis de tu camino de vida, destino nominal y ciclo activo.
                      </p>
                    </div>

                    <div className="num-result-cycle">
                      <span>Año personal</span>
                      <strong>{datos.ano_personal}</strong>
                    </div>
                  </div>

                  <div className="num-result-grid" aria-label="Datos principales de numerología">
                    <div className="num-data-tile num-data-tile--primary">
                      <span className="num-data-mark">01</span>
                      <span className="num-data-label">Esencia</span>
                      <span className="num-data-value">
                        {datos.camino_vida}
                        <small>{datos.arquetipo_vida}</small>
                      </span>
                    </div>

                    <div className="num-data-tile">
                      <span className="num-data-mark">02</span>
                      <span className="num-data-label">Destino</span>
                      <span className="num-data-value">
                        {datos.numero_destino}
                        <small>{datos.arquetipo_destino}</small>
                      </span>
                    </div>

                    <div className="num-data-tile">
                      <span className="num-data-mark">03</span>
                      <span className="num-data-label">Ciclo activo</span>
                      <span className="num-data-value">
                        {datos.ano_personal}
                        <small>Año personal</small>
                      </span>
                    </div>
                  </div>

                  <div className="sacred-triad" aria-hidden="true">
                    <div className="triad-point top-point">
                      <span className="point-label">Esencia</span>
                      <div className="point-number">{datos.camino_vida}</div>
                      <span className="point-archetype">{datos.arquetipo_vida}</span>
                    </div>

                    <div className="triad-point left-point">
                      <span className="point-label">Destino</span>
                      <div className="point-number">{datos.numero_destino}</div>
                      <span className="point-archetype">{datos.arquetipo_destino}</span>
                    </div>

                    <div className="triad-point right-point">
                      <span className="point-label">Ciclo {datos.ano_personal}</span>
                      <div className="point-number">{datos.ano_personal}</div>
                      <span className="point-archetype">Año personal</span>
                    </div>

                    <svg className="triad-lines">
                      <line x1="50%" y1="15%" x2="20%" y2="85%" />
                      <line x1="50%" y1="15%" x2="80%" y2="85%" />
                      <line x1="20%" y1="85%" x2="80%" y2="85%" />
                    </svg>
                  </div>

                  <button className="num-reset-btn" onClick={handleNewReading}>
                    Nueva lectura
                  </button>
                </>
              )}
            </section>
          </div>
        </div>

      </div>

      {error && <p className="num-error">Error: {error}</p>}
    </div>
  );
}
