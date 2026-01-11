import React, { useState } from 'react';
import "./NumerologyService.css";

export default function NumerologyService() {
  const [birthdate, setBirthdate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!birthdate) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/numerology/life-path?birthdate=${birthdate}`);
      
      if (!res.ok) {
        throw new Error("Velora no pudo sintonizar la frecuencia.");
      }
      
      const data = await res.json();
      console.log("🔮 DATOS:", data); 
      setResult(data);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRevelationData = () => {
    if (!result) return null;
    
    // --- CORRECCIÓN AQUÍ ---
    // Buscamos dentro de 'sendero_de_vida' que es como lo envía tu backend ahora
    if (result.sendero_de_vida && result.sendero_de_vida.revelacion) {
      return {
        num: result.sendero_de_vida.numero,
        titulo: result.sendero_de_vida.revelacion.titulo,
        esencia: result.sendero_de_vida.revelacion.esencia,
        historia: result.sendero_de_vida.revelacion.historia,
        reflejo: result.sendero_de_vida.revelacion.reflejo
      };
    }
    
    // Soporte retroactivo (por si acaso)
    if (result.revelacion) {
        return {
            num: result.life_path,
            titulo: result.revelacion.titulo,
            esencia: result.revelacion.esencia,
            historia: result.revelacion.historia,
            reflejo: result.revelacion.reflejo
        };
    }

    // Si llegamos aquí, mostramos el error de estructura
    return {
        num: "?",
        titulo: "Estructura Desconocida",
        esencia: "Los datos llegaron pero no coinciden con la ruta esperada.",
        historia: JSON.stringify(result).substring(0, 100) + "...", 
        reflejo: "Revisa getRevelationData en tu código React."
    };
  };

  const data = getRevelationData();

  return (
    <div className="numerology-service">
      <h2 className="num-title">✨ Sendero de Vida</h2>
      <p className="num-subtitle">Descubre la vibración de tu llegada</p>
      
      <form onSubmit={handleSubmit} className="numerology-form">
        <label htmlFor="birthdate">Fecha de nacimiento:</label>
        <input
          id="birthdate"
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="num-input"
          required
        />
        <button type="submit" className="num-btn" disabled={loading}>
          {loading ? "Sintonizando..." : "Revelar Destino"}
        </button>
      </form>

      {error && <p className="num-error">❗ {error}</p>}

      {result && data && (
        <div className="num-result">
          <div className="num-result-header">
            {/* El número ahora se toma de data.num */}
            <span className="num-large-number">{data.num}</span>
            <div className="num-titles">
              <h3>{data.titulo}</h3>
              <p className="num-date-ref">Viajero del {birthdate}</p>
            </div>
          </div>
          
          <div className="num-content">
            <p className="num-esencia"><strong>Esencia:</strong> {data.esencia}</p>
            
            {data.historia && (
              <p className="num-historia"><em>{data.historia}</em></p>
            )}
            
            <div className="velora-reflection">
              <h4>El Reflejo de Velora</h4>
              <p>{data.reflejo}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}