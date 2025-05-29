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

## 🧪 Primeros pasos

### 1. Clona y prepara el entorno

```bash
git clone https://github.com/tuusuario/velora-prismatika.git
cd velora-prismatika
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt