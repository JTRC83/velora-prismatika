import React, { useState } from 'react';
import './AstroService.css';
import ZodiacOrbit from './ZodiacOrbit';
import './ZodiacOrbit.css';

// El código \uFE0E fuerza al navegador a usar la versión "Texto" (Blanco y negro)
// en lugar de la versión "Emoji" (Color/Botón lila)
const zodiacMap = {
  Aries: '♈\uFE0E', 
  Tauro: '♉\uFE0E', 
  Géminis: '♊\uFE0E', 
  Cáncer: '♋\uFE0E',
  Leo: '♌\uFE0E', 
  Virgo: '♍\uFE0E', 
  Libra: '♎\uFE0E', 
  Escorpio: '♏\uFE0E',
  Sagitario: '♐\uFE0E', 
  Capricornio: '♑\uFE0E', 
  Acuario: '♒\uFE0E', 
  Piscis: '♓\uFE0E',
};

export default function AstroService({ onServiceResult, userData, onSaveUserData }) {
  const [formData, setFormData] = useState({
    birthdate: userData?.birthdate || '',
    birthtime: '',
    location: '',
    coordinates: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');
  
  // En 'result' guardaremos toda la respuesta unificada del nuevo backend
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'location' ? { coordinates: '' } : {})
    });

    if (name === 'location') {
      setGeoStatus(value.trim() ? 'pending' : 'idle');
    }
  };

  const handleNewReading = () => {
    setResult(null);
    setError(null);
    onServiceResult?.(null);
  };

  const resolveCoordinates = async (place) => {
    const trimmedPlace = place.trim();
    if (!trimmedPlace) {
      setGeoStatus('idle');
      return '';
    }

    setGeoStatus('loading');

    try {
      const response = await fetch(
        `/astro/geocode?q=${encodeURIComponent(trimmedPlace)}`
      );

      if (!response.ok) {
        throw new Error(`No se encontraron coordenadas para ${trimmedPlace}`);
      }

      const data = await response.json();
      const coordinates = data.coordinates || '';

      setFormData(prev => ({
        ...prev,
        location: data.label || prev.location,
        coordinates
      }));
      setGeoStatus(data.source === 'nominatim' ? 'online' : 'resolved');
      return coordinates;
    } catch (err) {
      console.warn('No se pudieron resolver coordenadas:', err);
      setGeoStatus('error');
      return '';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.birthdate) return;

    if (formData.birthdate && formData.birthdate !== userData?.birthdate) {
      onSaveUserData?.({ birthdate: formData.birthdate });
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const coordinates = formData.coordinates || (await resolveCoordinates(formData.location));

      // 1. LLAMADA AL NUEVO ENDPOINT UNIFICADO (POST)
      const res = await fetch('/astro/carta-natal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            fecha_nacimiento: formData.birthdate,
            hora_nacimiento: formData.birthtime || null,
            nombre: "Consultante", // Opcional, pero útil si el backend lo usa
            lugar: formData.location || "Un lugar lejano",
            coordenadas: coordinates || null
        })
      });
      
      if (!res.ok) {
        throw new Error(`Error en la conexión estelar (${res.status})`);
      }
      
      const data = await res.json();
      
      // Simulamos un pequeño tiempo de "cálculo" para la dramaturgia
      setTimeout(() => {
        setResult(data);
        onServiceResult?.({
          input: {
            birthdate: formData.birthdate,
            birthtime: formData.birthtime || null,
            location: formData.location || null,
            coordinates: coordinates || null,
          },
          ...data,
        });
        setLoading(false);
      }, 1500);

    } catch (err) {
      console.error("Error completo:", err);
      setError("Los astros guardan silencio... (Verifica que la aplicación esté iniciada)");
      setLoading(false);
    }
  };

  // Helper para extraer datos de forma segura (por si el backend varía ligeramente)
  const datos = result?.datos_tecnicos || {};
  const veloraParagraphs = result?.velora_voice?.split('\n').filter(line => line.trim()) || [];

  return (
    <div className="astro-service astro-service--natal p-6">
      <div className="astro-hero-grid">
        <div
          className={`astro-flip-card ${result ? 'is-flipped' : ''} ${loading ? 'is-loading' : ''}`}
        >
          <div className="astro-flip-inner">
            <section
              className="astro-form-card astro-flip-face astro-flip-face--front"
              aria-labelledby="astro-natal-title"
            >
              <div className="astro-form-header">
                <span className="astro-kicker">Carta natal y horóscopo</span>
                <h2 id="astro-natal-title" className="astro-title astro-title--panel">
                  Mecánica Celeste
                </h2>
                <p>
                  Traza el punto de entrada: fecha, hora si la conoces y ciudad como ancla simbólica.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="astro-form-col astro-form-col--natal">
                <div className="form-row astro-form-row--natal">
                  <div className="astro-field-primary form-group">
                    <label htmlFor="birthdate">
                      <span>01</span>
                      Fecha de llegada
                    </label>
                    <input
                      id="birthdate"
                      name="birthdate"
                      type="date"
                      value={formData.birthdate}
                      onChange={handleChange}
                      className="astro-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthtime">
                      <span>02</span>
                      Hora opcional
                    </label>
                    <input
                      id="birthtime"
                      name="birthtime"
                      type="time"
                      value={formData.birthtime}
                      onChange={handleChange}
                      className="astro-input"
                    />
                  </div>
                </div>

                <div className="form-row astro-form-row--natal astro-form-row--place">
                  <div className="form-group">
                    <label htmlFor="location">
                      <span>03</span>
                      Lugar
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Ej. Madrid"
                      value={formData.location}
                      onChange={handleChange}
                      onBlur={() => resolveCoordinates(formData.location)}
                      className="astro-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="coordinates">
                      <span>04</span>
                      Coordenadas
                    </label>
                    <input
                      id="coordinates"
                      name="coordinates"
                      type="text"
                      placeholder="Se calculan desde el lugar"
                      value={formData.coordinates}
                      className="astro-input"
                      readOnly
                    />
                    <small className={`astro-geo-status astro-geo-status--${geoStatus}`}>
                      {geoStatus === 'loading' && 'Calculando coordenadas...'}
                      {geoStatus === 'pending' && 'Se resolverán al salir del campo lugar.'}
                      {geoStatus === 'resolved' && 'Coordenadas resueltas localmente.'}
                      {geoStatus === 'online' && 'Coordenadas resueltas con OpenStreetMap.'}
                      {geoStatus === 'error' && 'No he podido resolverlas; prueba ciudad y país.'}
                    </small>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="astro-btn astro-btn--natal">
                  {loading ? 'Consultando los astros...' : 'Revelar mi carta'}
                </button>
              </form>
            </section>

            <section
              className="astro-card astro-result-card astro-flip-face astro-flip-face--back"
              aria-hidden={!result}
              aria-live="polite"
            >
              {result && (
                <>
                  <div className="astro-result-hero">
                    <div className="astro-sign-seal" aria-hidden="true">
                      <span className="astro-sign-symbol">{zodiacMap[datos.signo]}</span>
                    </div>

                    <div className="astro-result-heading">
                      <span className="astro-result-kicker">Lectura emitida</span>
                      <h3>{datos.signo}</h3>
                      <p>
                        Una síntesis de tu signo solar, el regente del día y el clima simbólico activo.
                      </p>
                    </div>

                    <div className="astro-result-date">
                      <div className="astro-date-copy">
                        <span>{datos.dia_nacimiento}</span>
                        <strong>{datos.regente_dia}</strong>
                      </div>
                      <b className="astro-month-number">{datos.dia_del_mes}</b>
                    </div>
                  </div>

                  <div className="astro-result-grid" aria-label="Datos principales de la carta">
                    <div className="astro-data-tile astro-data-tile--primary">
                      <span className="astro-data-mark">01</span>
                      <span className="astro-data-label">Elemento</span>
                      <span className="astro-data-value">
                        {datos.elemento?.split(',')[0]}
                      </span>
                    </div>

                    <div className="astro-data-tile">
                      <span className="astro-data-mark">02</span>
                      <span className="astro-data-label">Cualidad</span>
                      <span className="astro-data-value">
                        {datos.cualidad?.split(/[:.]/)[0]}
                      </span>
                    </div>

                    <div className="astro-data-tile">
                      <span className="astro-data-mark">03</span>
                      <span className="astro-data-label">Regente solar</span>
                      <span className="astro-data-value">{datos.planeta_regente}</span>
                    </div>

                    <div className="astro-data-tile astro-data-tile--wide astro-data-tile--origin">
                      <span className="astro-data-mark">04</span>
                      <span className="astro-data-label">Origen</span>
                      <span className="astro-data-value">
                        {datos.lugar}
                        {datos.coordenadas && (
                          <small>{datos.coordenadas}</small>
                        )}
                      </span>
                    </div>

                    <div className="astro-data-tile astro-data-tile--wide">
                      <span className="astro-data-mark">05</span>
                      <span className="astro-data-label">Tránsito activo</span>
                      <span className="astro-data-value">{datos.transito_activo}</span>
                    </div>
                  </div>

                  {veloraParagraphs.length > 0 && (
                    <div className="astro-reading-panel">
                      <div className="astro-reading-heading">
                        <span className="astro-reading-rule" />
                        <h4>Interpretación de Velora</h4>
                        <span className="astro-reading-rule" />
                      </div>

                      <div className="astro-reading-copy">
                        {veloraParagraphs.map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.reflejo && (
                    <div className="astro-reflection-card">
                      <span className="astro-reflection-label">El reflejo de hoy</span>
                      <p>{result.reflejo}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    className="astro-result-reset"
                    onClick={handleNewReading}
                  >
                    Nueva lectura
                  </button>
                </>
              )}
            </section>
          </div>
        </div>

        <aside className="astro-orbit-panel" aria-label="Reloj zodiacal animado decorativo">
          <ZodiacOrbit />
        </aside>
      </div>

      {error && <p className="astro-error">❗ {error}</p>}
    </div>
  );
}
