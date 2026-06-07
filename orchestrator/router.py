import re
import json
import logging
from typing import Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel

# Importamos solo el cerebro narrativo, NO los servicios mecánicos
from orchestrator.velora_weaver import VeloraWeaver
from services.knowledge_service.store import knowledge_base

router = APIRouter()
weaver = VeloraWeaver()
logger = logging.getLogger("VeloraRouter")

# --- 1. CONFIGURACIÓN DE FACETAS ---
# Mapa central de personalidades. Velora consulta esto para saber "quién ser".
FACETAS = {
    "tarot": {
        "instruccion": "Adopta un tono simbólico, sobrio y claro. Enfócate en arquetipos y decisiones concretas.",
        "gatillos": [r"\btarot\b", r"\bprofec[ií]a\b", r"\bsecreto\b", r"\barcanos?\b", r"\bcartas?\b"],
    },
    "astrologia": {
        "instruccion": "Adopta un tono erudito y preciso. Usa lenguaje de ciclos, órbitas y patrones sin dramatizar.",
        "gatillos": [r"\bastrolog[ií]a\b", r"\bcarta nat[ae]l\b", r"\bazar celestial\b", r"\bplanetas?\b", r"\btránsito\b"],
    },
    "profecia": {
        "instruccion": "Adopta un tono prudente y orientativo. Habla de tendencias posibles, no de certezas cerradas.",
        "gatillos": [r"\bpredicci?on(?:es)?\b", r"\bmundial\b", r"\bfuturo\b", r"\bdestino\b"],
    },
    "ritual": {
        "instruccion": "Adopta un tono práctico y enfocado. Traduce el rito en intención, acción y cierre consciente.",
        "gatillos": [r"\bmagia\b", r"\britual\b", r"\bhechizo\b", r"\bvoluntad\b"],
    },
    "karma": {
        "instruccion": "Adopta un tono teosófico y educativo. Habla de ciclos, reencarnación, lecciones y causa-efecto espiritual.",
        "gatillos": [r"\bkarm[ae]\b", r"\breencarnaci[oó]n\b", r"\blecci[oó]n\b", r"\bvida pasada\b"],
    },
    "consejo": {
        "instruccion": "Adopta un tono de consejera cotidiana, directa y empática. Aterriza los símbolos en la vida real.",
        "gatillos": [r"\bconsejo\b", r"\bdirecci[oó]n\b", r"\bvida cotidiana\b", r"\bayuda\b"],
    },
    "hermetismo": {
        "instruccion": "Adopta un tono hermético pero comprensible. Explica principios y correspondencias con utilidad práctica.",
        "gatillos": [r"\bherm[eé]tico\b", r"\btalism[aá]n\b", r"\bprincipio\b", r"\bcorrespondencia\b"],
    },
    "salud": {
        "instruccion": "Adopta un tono de alquimia natural. Usa metáforas de purificación, plantas y equilibrio de elementos (sin dar consejos médicos reales).",
        "gatillos": [r"\bsalud\b", r"\balq?u?imia\b", r"\bhierbas\b", r"\bienestar\b"],
    },
}

# Precompilar regex para optimizar la detección
for key, datos in FACETAS.items():
    datos["gatillos"] = [re.compile(p, re.IGNORECASE) for p in datos["gatillos"]]

SALUDO_WORDS = {
    "hola",
    "buenas",
    "hey",
    "velora",
    "estas",
    "estás",
    "esta",
    "está",
    "aqui",
    "aquí",
    "presente",
    "con",
    "nosotros",
    "hay",
    "alguien",
}

class Mensaje(BaseModel):
    usuario: str
    current_service: Optional[str] = None
    service_context: Optional[dict[str, Any]] = None
    use_knowledge: Optional[bool] = None


def _compactar_contexto_servicio(contexto: Optional[dict[str, Any]], max_chars: int = 4200) -> str:
    if not contexto:
        return ""

    try:
        payload = json.dumps(contexto, ensure_ascii=False, indent=2, default=str)
    except TypeError:
        payload = str(contexto)

    if len(payload) <= max_chars:
        return payload

    return payload[: max_chars - 1].rsplit("\n", 1)[0].strip() + "\n…"


def _es_saludo_simple(texto: str) -> bool:
    palabras = re.findall(r"\w+", texto.lower())
    if len(palabras) > 12:
        return False

    palabras_set = set(palabras)
    tiene_saludo = bool(palabras_set & {"hola", "buenas", "hey"})
    pregunta_presencia = (
        "velora" in palabras_set
        and (palabras_set & {"esta", "está", "estas", "estás", "presente"})
    ) or {"hay", "alguien"}.issubset(palabras_set)

    return (tiene_saludo or pregunta_presencia) and palabras_set.issubset(SALUDO_WORDS)


def _respuesta_saludo() -> str:
    return (
        "Sí, estoy aquí.\n\n"
        "Puedo leer el resultado que tengas abierto en la aplicación y ayudarte a "
        "entenderlo con más claridad. Si no hay una lectura activa, puedo apoyarme "
        "en la bóveda de Velora para darte contexto, criterio y una respuesta útil."
    )

# --- 2. ENDPOINTS GENERALES ---

@router.get("/servicio/{nombre_servicio}/intro")
async def intro_servicio(nombre_servicio: str):
    """
    Endpoint Educativo [CAPA ETÉREA]:
    Velora explica el origen y utilidad de cualquier servicio al entrar.
    Este endpoint es genérico y sirve para Tarot, Astro, Runas, etc.
    """
    # Velora Weaver genera la explicación histórica/mística
    explicacion = weaver.narrar_introduccion(nombre_servicio)
    return {
        "velora_voice": explicacion,
        "servicio": nombre_servicio
    }

@router.post("/chat")
async def chat_generico(mensaje: Mensaje):
    """
    Endpoint de Chat Libre [CAPA ETÉREA]:
    El usuario habla con Velora sin estar usando una herramienta específica.
    Velora detecta la intención (Faceta) y responde acorde.
    """
    texto = mensaje.usuario.strip()
    contexto_servicio = _compactar_contexto_servicio(mensaje.service_context)

    if not contexto_servicio and _es_saludo_simple(texto):
        return {
            "velora_voice": _respuesta_saludo(),
            "reflejo": "",
            "faceta_usada": "consejo",
            "service_context_used": False,
            "current_service": mensaje.current_service,
        }
    
    # A. Detectar Faceta (Intención)
    faceta_detectada = "consejo" # Default
    instruccion_activa = FACETAS["consejo"]["instruccion"]

    for nombre, datos in FACETAS.items():
        for pattern in datos["gatillos"]:
            if pattern.search(texto):
                faceta_detectada = nombre
                instruccion_activa = datos["instruccion"]
                break
        if faceta_detectada != "consejo":
            break
            
    # B. Recuperar contexto local de la bóveda si existe y es relevante
    knowledge_sources = []
    contexto_conocimiento = ""
    if mensaje.use_knowledge is not False:
        try:
            knowledge_sources = knowledge_base.search(texto, limit=4)
            contexto_conocimiento = knowledge_base.format_context(knowledge_sources)
        except Exception as e:
            logger.warning(f"No se pudo consultar la bóveda de conocimiento: {e}")

    # C. Generar respuesta con IA.
    # Si el frontend envía un resultado de servicio, Velora lo ve y lo comenta.
    if contexto_servicio:
        respuesta_velora = weaver.chat_con_contexto_aplicacion(
            texto,
            instruccion_activa,
            servicio_actual=mensaje.current_service or mensaje.service_context.get("service") or "Servicio activo",
            contexto_servicio=contexto_servicio,
            contexto_conocimiento=contexto_conocimiento,
        )
    else:
        respuesta_velora = weaver.chat_libre(
            texto,
            instruccion_activa,
            contexto_conocimiento=contexto_conocimiento,
        )

    return {
        "velora_voice": respuesta_velora["texto"],
        "reflejo": "",
        "faceta_usada": faceta_detectada,
        "service_context_used": bool(contexto_servicio),
        "current_service": mensaje.current_service,
    }

# NOTA: El endpoint "/tarot/tirada" SE HA MOVIDO a:
# services/tarot_service/router.py
# Esto mantiene la lógica mecánica separada de la lógica conversacional.
