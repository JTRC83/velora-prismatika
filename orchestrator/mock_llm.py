import random
import json
import os
import re
import logging
from typing import Dict, List, Optional
from collections import Counter

from orchestrator.constantes import PLANTILLAS_PATH, PROMPTS_DIR

try:
    import spacy  # type: ignore
except Exception:  # pragma: no cover - spacy may be optional
    spacy = None

_NLP = None

def _get_nlp():
    global _NLP
    if _NLP is None and spacy is not None:
        try:
            _NLP = spacy.load("es_core_news_sm", disable=["parser", "ner"])
        except Exception as e:  # pragma: no cover - model missing
            logger.warning(f"No se pudo cargar el modelo spaCy: {e}")
            _NLP = False
    return _NLP if _NLP not in (None, False) else None
logger = logging.getLogger(__name__)

def cargar_config_plantillas() -> Dict:
    """
    Carga y retorna la configuración de plantillas desde PLANTILLAS_PATH.
    Si el archivo no existe o no es JSON válido, retorna estructura vacía.
    """
    try:
        with open(PLANTILLAS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning(f"Archivo de plantillas no encontrado: {PLANTILLAS_PATH}")
        return {"plantillas": [], "fragmentos": {}}
    except json.JSONDecodeError as e:
        logger.warning(f"Error decodeando JSON de plantillas: {e}")
        return {"plantillas": [], "fragmentos": {}}

CONFIG = cargar_config_plantillas()

# Precompilar listas de fragmentos para rendimiento
TEMAS = CONFIG.get("fragmentos", {}).get("tema", ["destino"])
ELEMENTOS = CONFIG.get("fragmentos", {}).get("elemento", ["sol"])
METAFORAS = CONFIG.get("fragmentos", {}).get("metáfora", ["solo quien osa ve más allá"])

# Compilar expresiones regulares para detectar temas
REGEX_TEMAS = [(re.compile(rf"\b{re.escape(tema)}\b", re.IGNORECASE), tema) for tema in TEMAS]

# Caché para respuestas estáticas
_CACHE_PROMPTS: Dict[str, List[str]] = {}

def cargar_respuestas_estaticas(avatar: str) -> List[str]:
    """
    Retorna la lista de respuestas estáticas para un avatar.
    Si ya está en caché, la devuelve directamente.
    """
    if avatar in _CACHE_PROMPTS:
        return _CACHE_PROMPTS[avatar]
    ruta = os.path.join(PROMPTS_DIR, f"{avatar}.json")
    try:
        with open(ruta, "r", encoding="utf-8") as f:
            data = json.load(f)
            opciones = data.get("respuestas", [])
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.warning(f"Error cargando prompts para {avatar}: {e}")
        opciones = []
    _CACHE_PROMPTS[avatar] = opciones
    return opciones

AVATAR_FIRMAS = {
    "sibylla": "Sibylla dixit.",
    "dee": "Dee concluye el trazado estelar.",
    "nostradamus": "—M.",
    "crowley": "Amor es la ley, amor bajo la voluntad.",
    "blavatsky": "Que la verdad sea tu religión.",
    "vanga": "Así lo veo.",
    "hermes": "Como es arriba, es abajo.",
    "paracelso": "In natura, la cura."
}

TIPS_AVATAR = {
    "sibylla": {
        "consejos": [
            "sigue la senda que aún no ha sido hollada",
            "confía en el color oculto tras la sombra",
            "deja que el velo revele su matiz interno"
        ],
        "consejos_capital": [
            "El enigma florece al caer la noche",
            "Solo en lo incierto nace lo nuevo",
            "La semilla duerme esperando tu llave"
        ]
    },
    "dee": {
        "consejos": [
            "observa las casas donde danzan tus planetas",
            "los astros son ecos de tu propia alma",
            "permite que el cielo guíe tu palabra"
        ],
        "consejos_capital": [
            "El trazado estelar desvela tu propósito",
            "Marte y Venus conspirarán para tu impulso",
            "La Luna revela aquello que el Sol oculta"
        ]
    },
    "nostradamus": {
        "consejos": [
            "cuando el cuervo cruce tu horizonte, atiende al presagio",
            "guarda silencio al percibir la señal del fuego",
            "la sombra del pasado nutre tu mañana incierto"
        ],
        "consejos_capital": [
            "En el año tres y veinte vendrá la noche sin luna",
            "El lobo cantará cuando las torres se inclinen",
            "Cuatro coroas caerán bajo el signo del halcón"
        ]
    },
    "crowley": {
        "consejos": [
            "atrévete a labrar tu rito en el crisol de tu mente",
            "rompe el espejo que refleja tu propia duda",
            "que tu voluntad no tema rasgar el velo prohibido"
        ],
        "consejos_capital": [
            "Desata la rueda de tu Ser: el caos es creación",
            "Conjura el fuego interno y haz de tu sombra luz",
            "Ni la prisión mental retiene al mago libre"
        ]
    },
    "blavatsky": {
        "consejos": [
            "comprende que cada vida siembra la siguiente",
            "karma y dharma se entrelazan con tu enseñanza",
            "busca la raíz que nutre tu llama espiritual"
        ],
        "consejos_capital": [
            "La reencarnación teje el tapiz del destino",
            "Cada acto reverbera en la rueda eterna",
            "Que la verdad discipule tu viaje sin fin"
        ]
    },
    "vanga": {
        "consejos": [
            "mallorca se alinea cuando el corazón calla",
            "escucha el murmullo de tu intuición cotidiana",
            "relaja tus hombros, lo que debe venir llegará"
        ],
        "consejos_capital": [
            "Así lo veo: el río curvo revelará tu camino",
            "El viento del norte trae cambio inesperado",
            "No temas al puente oscuro: cruza sin dudar"
        ]
    },
    "hermes": {
        "consejos": [
            "como es arriba, es abajo; toma tu esencia y actúa",
            "cada talismán nace del pensamiento persistente",
            "eleva tu mente para que reine la correspondencia"
        ],
        "consejos_capital": [
            "La vibración une lo visible con lo invisible",
            "Todo talismán surge del principio de correspondencia",
            "La mente ordenada conjura el orden en la materia"
        ]
    },
    "paracelso": {
        "consejos": [
            "una infusión de salvia y romero restablecerá tu pulso",
            "para cada fiebre, existe un hálito de manzanilla",
            "equilibra tus humores con aceite de lavanda y sol"
        ],
        "consejos_capital": [
            "In natura: el reino vegetal es el médico silente",
            "El cuerpo habla en fiebre; atiende su mensaje",
            "Que tu brebaje cure la herida antes de que hunda"
        ]
    }
}

def respuesta_avatar(avatar: str, pregunta: str) -> str:
    """
    Genera una respuesta dinámica para el avatar según plantillas y tips.
    Si falla, recurre a la respuesta estática.
    """
    try:
        return construir_respuesta_dinamica(avatar, pregunta)
    except Exception as e:
        logger.warning(f"Error en respuesta dinámica para {avatar}: {e}")
        return construir_respuesta_estatica(avatar)

def construir_respuesta_dinamica(avatar: str, pregunta: str) -> str:
    plantillas = CONFIG.get("plantillas", [])
    # 1) Detectar tema usando regex precompilados
    tema_detectado: Optional[str] = None
    for pattern, tema in REGEX_TEMAS:
        if pattern.search(pregunta):
            tema_detectado = tema
            break

    # 2) Elegir fragmentos al azar
    ele = random.choice(ELEMENTOS)
    met = random.choice(METAFORAS)

    # 3) Obtener consejo según avatar (o fallback)
    if avatar in TIPS_AVATAR:
        cons = TIPS_AVATAR[avatar].get("consejos", [])
        cons_cap = TIPS_AVATAR[avatar].get("consejos_capital", [])
        if cons and cons_cap:
            consejo = random.choice(cons)
            consejo_cap = random.choice(cons_cap)
        else:
            consejo = "permite al prisma revelar su matiz"
            consejo_cap = "El mensaje surge en silencio"
    else:
        consejo = "permite al prisma revelar su matiz"
        consejo_cap = "El mensaje surge en silencio"

    # 4) Elegir una plantilla y rellenar
    if not plantillas:
        texto = "El prisma calla cuando no hay luz suficiente."
    else:
        tpl = random.choice(plantillas)
        try:
            texto = tpl.format(
                elemento=ele,
                tema=tema_detectado or random.choice(TEMAS),
                metáfora=met,
                consejo=consejo,
                consejo_capital=consejo_cap
            )
        except KeyError as e:
            logger.warning(f"Plantilla mal formada: falta clave {e}")
            texto = "El prisma se fragmenta cuando el verbo falla."

    # 5) Agregar firma
    firma = AVATAR_FIRMAS.get(avatar, "")
    return f"{texto}\n\n{firma}"

def construir_respuesta_estatica(avatar: str) -> str:
    opciones = cargar_respuestas_estaticas(avatar)
    if not opciones:
        return f"{avatar.capitalize()} no tiene nada que decir ahora."
    eleccion = random.choice(opciones)
    firma = AVATAR_FIRMAS.get(avatar, "")
    return f"{eleccion}\n\n{firma}"

def generar_reflejo(avatar: str, pregunta: str, respuesta: str) -> str:
    """
        Genera un resumen simbólico de la respuesta.
    """
    # Intentar usar spaCy para POS tagging si está disponible
    try:
        nlp = _get_nlp()
        if nlp:
            doc = nlp(respuesta)
            sustantivos = [
                token.text.lower()
                for token in doc
                if token.pos_ == "NOUN" and len(token.text) > 3
            ]
            cuenta = Counter(sustantivos)
            top = [pal for pal, _ in cuenta.most_common(3)]
            if top:
                base = " ".join(top)
            else:
                raise ValueError("Sin sustantivos relevantes")
        else:
            raise ValueError("spaCy no disponible")
    except Exception:
        # Fallback: contar tokens largos
        tokens = [t.lower() for t in re.findall(r"\b[a-zA-ZáéíóúñÑ]{4,}\b", respuesta)]
        stopwords = {"que", "más", "solo", "todo", "cuando", "cara", "mira"}
        tokens = [t for t in tokens if t not in stopwords]
        cuenta = Counter(tokens)
        top = [pal for pal, _ in cuenta.most_common(3)]
        base = " ".join(top) if top else (respuesta.split()[0] if respuesta.split() else "")

    # Asegurar longitud < 25 palabras
    reflejo = f"{base} destilan luz en tu prisma interior." if base else "El prisma guarda su secreto."
    palabras = reflejo.split()
    if len(palabras) > 25:
        reflejo = " ".join(palabras[:25])
    return reflejo