# ✨ Velora Prismátika

_Asistente esotérico modular inspirado en los 22 Caminos del Árbol de la Vida._

Velora Prismátika es un prisma viviente que refleja la verdad simbólica a través de múltiples planos: tarot, astrología, cábala, numerología y más. Inspirado en la tradición de Thélēma y guiado por avatares arquetípicos, este proyecto local-first combina mística antigua con tecnología moderna.

🌀 Filosofía

“Aquel que camina con propósito, ve revelarse el Sendero.”

Velora no predice. Velora refleja.

Reflejo Prismátiko:
Nombrar el propósito es abrir el portal; lo escrito da forma al poder que lo habita.
---

## 🌐 Arquitectura

Proyecto **monorepo** con backend en FastAPI y frontend React (modo local-first):

velora-prismatika/
├── orchestrator/      # FastAPI backend + lógica de enrutado
├── services/          # tarot_service, astro_service, etc.
├── nlu/               # clasificación de intención
├── db/                # SQLite local
├── frontend/          # React + Tailwind + WebSocket (pendiente)
├── docker-compose.yml

---

## 🔮 Avatares incluidos

| Avatar         | Dominio                          | Firma final                              |
|----------------|----------------------------------|------------------------------------------|
| Sibylla        | Profecía enigmática              | `Sibylla dixit.`                         |
| John Dee       | Astrología y cálculo astral      | `Dee concluye el trazado estelar.`       |
| Nostradamus    | Predicciones veladas             | `—M.`                                    |
| A. Crowley     | Magia ceremonial, tarot profundo | `Amor es la ley, amor bajo la voluntad.` |
| Blavatsky      | Karma, reencarnación             | `Que la verdad sea tu religión.`         |
| Baba Vanga     | Consejo cotidiano directo        | `Así lo veo.`                            |
| Hermes         | Talismán, sabiduría hermética    | `Como es arriba, es abajo.`              |
| Paracelso      | Salud alquímica, herbolaria      | `In natura, la cura.`                    |

---

## 🛠 Servicios disponibles

Velora Prismätika expone múltiples microservicios, cada uno un prisma para explorar aspectos esotéricos:

- **Tarot** (`/tarot`): tirada de 3 cartas, interpretaciones de Pasado, Presente y Futuro.
- **Astrología natal** (`/astro/sun-sign`): calcula tu signo solar, elemento, modalidad, regente y descripción.
- **Horóscopo diario** (`/horoscope/daily?sign=...`): mensajes de orientación para tu signo.
- **Numerología** (`/numerology/number?date=YYYY-MM-DD`): tu Número de Sendero de Vida y su significado.
- **Runas** (`/runes/draw?count=N`): selección aleatoria de runas con símbolo, significado y reverso.
- **I Ching** (`/iching/hexagram`): genera un hexagrama (1–64) y devuelve nombre y significado.
- **Oráculo de Cristal** (`/crystal/message[?topic=...]`): mensajes mágicos genéricos o temáticos.
- **Chakras** (`/chakra/`, `/chakra/advice`, `/chakra/session`): guía de los 7 chakras, consejos y mini-sesiones.
- **Compatibilidad** (`/compatibility?sign1=...&sign2=...`): afinidad astrológica entre dos signos o fechas.
- **Fases de Luna** (`/moon-phase?date=YYYY-MM-DD`): fase lunar, icono y significado simbólico.
- **Tránsitos Planetarios** (`/transits?date=YYYY-MM-DD`): posiciones eclípticas del Sol, Luna y planetas con aspectos mayores.
- **Árbol de la Vida (Cábala)** (`/kabbalah/`, `/kabbalah/{id}`, `/kabbalah/random`): recorrido por las 10 Sephiroth y mini-lecturas.
- **Rituales y Afirmaciones** (`/ritual?birthdate=...&date=...`): rituales personalizados según tu signo y fase lunar.

---

## 🧪 Primeros pasos

### 1. Clona y prepara el entorno

```bash
git clone https://github.com/tuusuario/velora-prismatika.git
cd velora-prismatika
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

## 🛠 Roadmap

Estas son algunas de las mejoras y expansiones planeadas para futuras versiones:

- **Integración de Voz**: soporte STT/TTS local-first con Whisper‑cpp y Coqui TTS para consultas habladas.
- **Oráculos Adicionales**: incluir Runas Vikingas y Lectura de Cartas de Ángeles.
- **Soporte Multi-idioma**: traducir mensajes y descripciones a varios idiomas (inglés, francés, alemán).
- **Autenticación y Perfiles**: permitir registro de usuarios, guardar historiales y lecturas personalizadas.
- **Notificaciones**: recordatorios configurables para horóscopo diario, afirmaciones y prácticas de chakra.
- **Integración de APIs Externas**: activar transiciones a backend OpenAI o Google Calendar / Twilio para SMS.
- **Aplicación Móvil**: front‑end React Native para acceso offline y notificaciones push.
- **Dashboard de Métricas**: panel admin con estadísticas de uso, servicios más populares y rendimiento.