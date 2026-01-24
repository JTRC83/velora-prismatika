import React, { useState } from 'react';
import './NumerologyService.css';

export default function NumerologyService() {
  // Ahora necesitamos nombre y fecha
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
      
      // Pequeño retardo para dar dramatismo al cálculo
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Error en la conexión. Verifica que el Backend esté encendido.");
      setLoading(false);
    }
  };

  // Helper para acceder a los datos técnicos de forma segura
  const datos = result?.datos_tecnicos || {};

  return (
    <div className="num-container">
      <h2 className="num-title">Arquitectura del Alma</h2>
      
      {/* FORMULARIO (Solo se muestra si no hay resultado o cargando) */}
      {!result && !loading && (
        <form onSubmit={handleSubmit} className="num-form fade-in">
          <div className="form-group-num">
            <label>Nombre Completo</label>
            <input 
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
            <label>Fecha de Nacimiento</label>
            <input 
              type="date" 
              name="birthdate" 
              value={formData.birthdate}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="num-btn">Calcular Vibración</button>
        </form>
      )}

      {/* ERROR */}
      {error && <p className="num-error">❗ {error}</p>}

      {/* LOADING (Animación Geométrica) */}
      {loading && (
        <div className="num-loading">
          <div className="geometry-spinner">
            <div className="triangle"></div>
            <div className="circle"></div>
          </div>
          <p>Trazando líneas del destino...</p>
        </div>
      )}

      {/* RESULTADOS */}
      {result && (
        <div className="num-results fade-in-up">
          
          {/* LA TRÍADA SAGRADA (Visualización Geométrica) */}
          <div className="sacred-triad">
            
            {/* CÚSPIDE: CAMINO DE VIDA */}
            <div className="triad-point top-point">
              <span className="point-label">Esencia</span>
              <div className="point-number">{datos.camino_vida}</div>
              <span className="point-archetype">{datos.arquetipo_vida}</span>
            </div>

            {/* BASE IZQ: DESTINO */}
            <div className="triad-point left-point">
              <span className="point-label">Destino</span>
              <div className="point-number">{datos.numero_destino}</div>
              <span className="point-archetype">{datos.arquetipo_destino}</span>
            </div>

            {/* BASE DER: AÑO PERSONAL */}
            <div className="triad-point right-point">
              <span className="point-label">Ciclo {datos.ano_personal}</span>
              <div className="point-number">{datos.ano_personal}</div>
              <span className="point-archetype">Año Personal</span>
            </div>
            
            {/* LÍNEAS DECORATIVAS SVG */}
            <svg className="triad-lines">
              <line x1="50%" y1="15%" x2="20%" y2="85%" />
              <line x1="50%" y1="15%" x2="80%" y2="85%" />
              <line x1="20%" y1="85%" x2="80%" y2="85%" />
            </svg>
          </div>

          {/* LA VOZ DE VELORA */}
          <div className="num-velora-box">
            <h4>La Resonancia</h4>
            {/* Procesamos el texto para respetar los párrafos de la IA */}
            {result.velora_voice && result.velora_voice.split('\n').map((line, i) => (
              line.trim() && <p key={i}>{line}</p>
            ))}
            
            <div className="num-reflection">
              ✨ "{result.reflejo}"
            </div>
          </div>

          <button className="num-reset-btn" onClick={() => setResult(null)}>
            Realizar otro cálculo
          </button>
        </div>
      )}
    </div>
  );
}