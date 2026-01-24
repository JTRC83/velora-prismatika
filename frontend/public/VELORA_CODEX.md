# VELORA_CODEX: La Constitución de Velora Prismätika

## 1. IDENTIDAD Y FILOSOFÍA (DIRECTRICES DE TONO)
**Entidad:** Velora es una asistente virtual esotérica unificada. NO tiene avatares múltiples. Es una sola voz.
**Principio Rector:** "El Principio del Reflejo". Velora no predice el futuro de forma determinista; interpreta símbolos para iluminar el presente del usuario.
**Tono de Respuesta:** Sereno, místico, elegante, no dogmático y sin jerga técnica en el frontend.
**Mantra:** "Nombrar la intención abre el portal. Interpretar el símbolo revela el camino."

## 2. ARQUITECTURA TÉCNICA (STACK)
* **Tipo:** Local-first, modular.
* **Backend (Orchestrator):** FastAPI (Python). Estructura modular donde cada servicio esotérico es independiente.
* **Frontend:** React + Vite. Una sola página (SPA) con transiciones suaves.
* **Estilos:** CSS puro / Modules. Estética Art Nouveau, dorados, oscuros, texturas de pergamino.
* **IA Futura:** Integración con LLM local (Gemma 2: 27b vía Ollama) para chat libre.

## 3. ESTRUCTURA DEL PROYECTO (MAPA VITAL)
velora-prismatika/
├── VELORA_CODEX.md      # ESTE ARCHIVO (Verdad única del proyecto)
├── orchestrator/        # FastAPI: API principal
│   └── main.py
├── services/            # Lógica de negocio aislada
│   ├── tarot/           # Lógica de tirada y significados (JSON)
│   ├── astro_service/   # Efemérides y cálculo natal
│   ├── numerology/      # Cálculos pitagóricos
│   ├── runes/           # Aleatoriedad rúnica
│   ├── kabbalah/        # Árbol de la vida
│   └── ... (otros servicios definidos en roadmap)
├── frontend/            # React
│   ├── public/images/   # Assets (Tarot, Iconos)
│   └── src/components/  # Curtain, Header, ChatWindow
└── assets/              # Recursos crudos (prompts de arte, pdfs)

## 4. DEFINICIÓN DE SERVICIOS (REGLAS DE NEGOCIO)
Cada servicio expone endpoints REST y tiene su propia base de datos (JSON/Dict).

1.  **Tarot:**
    * *Visual:* Cartas estilo "Art Nouveau Alquímico" (Bordes dorados, fondo pergamino).
    * *Mecánica:* Tirada de 3 cartas. Soporta inversión (invertida = significado distinto).
    * *Backend:* `is_inverted` bool.
2.  **Astrología:**
    * *Base:* Occidente tropical.
    * *Output:* Signo Solar + Horóscopo del día (basado en tránsitos simples).
3.  **Numerología:**
    * *Método:* Pitagórica (Reducción a 1-9, 11, 22).
    * *Cálculo:* Suma fecha nacimiento (Camino de vida).
4.  **Runas:**
    * *Visual:* Piedras grabadas.
    * *Sonido:* Referencia a "susurros" o choque de piedras.
5.  **Cábala:**
    * *Foco:* Árbol de la Vida (Sephiroth). Meditación y virtudes, no predicción.
6.  **Bola de Cristal:**
    * *UX:* Generación de metáforas visuales o mensajes oraculares poéticos.

## 5. REGLAS DE UI/UX (FRONTEND)
* **Navegación:** NO hay rutas de navegador tradicionales visibles. La navegación es circular mediante iconos superiores.
* **Las Cortinas:** Cada cambio de servicio activa una animación de "Cortinas de Nubes Art Nouveau" que cubren la pantalla, cargan el nuevo estado y se abren.
* **Paleta:** Oro viejo (#C5A059), Azul Noche, Burdeos, Pergamino.
* **Tipografía:** Elegante, serif para títulos, sans limpia para lectura.

## 6. ROADMAP Y ESTADO ACTUAL
- [x] Definición de Arquitectura.
- [x] Diseño de Cartas de Tarot (Prompts definidos).
- [ ] Implementación de estructura de carpetas Backend.
- [ ] Creación de componente "Curtain" (Transición).
- [ ] Servicio Básico Tarot (Endpoint + JSON).
- [ ] Integración LLM (Gemma 2) en `orchestrator`.
- [ ] Sistema de Voz (TTS/STT).

## 7. CONVENCIONES DE CÓDIGO
* **Python:** Type hints obligatorios. Docstrings en funciones principales.
* **React:** Componentes funcionales. Hooks para lógica. Nombres de archivos PascalCase (`TarotCard.jsx`).
* **General:** Mantener la separación de intereses. El Frontend solo "pinta", el Backend "calcula".