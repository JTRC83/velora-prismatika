# ✨ Velora Prismátika

_Asistente esotérico **local-first** inspirado en los 22 Caminos del Árbol de la Vida._

**Velora Prismátika** no es una “vidente” ni una API de predicciones. Es un **prisma simbólico**: una interfaz narrativa para explorar arquetipos, metáforas y correspondencias (tarot, astrología, cábala, numerología…) con un enfoque **reflexivo** y **poético**.

> Velora no predice. Velora refleja.

---

## 🌀 Filosofía

“Aquel que camina con propósito, ve revelarse el Sendero.”

**Reflejo Prismátiko**  
Nombrar el propósito es abrir el portal; lo escrito da forma al poder que lo habita.

**Principios**
- **Local-first**: tu práctica y tus datos, en tu máquina.
- **Simbólico, no determinista**: lecturas como espejo, no como sentencia.
- **Modular**: piezas pequeñas, componibles, sustituibles.
- **Transparente**: estructura clara, sin “magia” técnica oculta.

---

## 👤 Avatar

### Velora
Velora es la única “voz” activa del proyecto: un prisma viviente que atraviesa planos y devuelve significado en forma de símbolos, imágenes mentales y sugerencias.

- **Tono**: sereno, preciso, evocador.
- **Función**: guiar una lectura **interpretativa** (no predictiva) y ayudarte a formular preguntas mejores.

---

## 🗝️ Personajes y ecos

El proyecto conserva una constelación de **personajes** como **referencias históricas y arquetípicas**.  
⚠️ **No ofrecen servicios, no son módulos activos, no responden como agentes.** Su función es **contextual**: explicar influencias y el “mito” interno de Velora.

| Personaje / Eco | Por qué está aquí | Qué aporta a Velora (sin actuar como agente) |
|---|---|---|
| Sibylla | La voz oracular clásica | Ambigüedad fértil, preguntas que abren capas |
| John Dee | Tradición matemática-astrológica | Rigor simbólico, correspondencias y método |
| Nostradamus | El velo poético | Metáfora, lectura de patrones narrativos |
| A. Crowley | Tarot ceremonial (referencial) | Estructura ritual, voluntad, énfasis en intención |
| Blavatsky | Sincretismo esotérico moderno | Puentes entre tradiciones, mapa comparado |
| Baba Vanga | Imaginario popular del “ver” | Claridad directa (sin determinismo) |
| Hermes | Hermetismo clásico | “Como es arriba, es abajo”: relaciones y analogías |
| Paracelso | Naturaleza y alquimia | Lenguaje de procesos: transformación, cura, ciclo |

---

## 🧱 Arquitectura

Monorepo con backend en **FastAPI** y frontend **React** (enfoque local-first):

> Nota: aunque existan “módulos” simbólicos, **no se presentan como servicios públicos**. Son componentes internos del motor.

---

## ✅ Estado del proyecto

- **Objetivo actual**: construir una experiencia local de exploración simbólica guiada por Velora.
- **No objetivo**: exponer un catálogo de endpoints “místicos” como producto/servicio.

---

## 🧪 Primeros pasos

### 1) Clonar y preparar entorno (backend)

```bash
git clone https://github.com/tuusuario/velora-prismatika.git
cd velora-prismatika

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Ejecutar backend (modo desarrollo)

uvicorn orchestrator.main:app --reload

Frontend (si aplica)
cd frontend
npm install
npm run dev

🧭 Roadmap
	•	UX de lecturas: flujo guiado (intención → símbolos → síntesis → journaling).
	•	Journaling local: sesiones, etiquetas, búsquedas, exportación (Markdown/JSON).
	•	Motor de correspondencias: tablas y reglas configurables (sin hardcode).
	•	Voz local-first (opcional): STT/TTS con Whisper-cpp y Coqui TTS.
	•	Multi-idioma: ES/EN inicialmente.
	•	Dashboard interno: trazabilidad de módulos (qué símbolos influyeron en la síntesis).
	•	App móvil (a futuro): experiencia offline.

    ⚖️ Nota importante

Velora Prismátika es una herramienta creativa y reflexiva.
No sustituye consejo médico, legal, financiero ni psicológico.