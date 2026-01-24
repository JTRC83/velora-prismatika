import re
from fastapi import APIRouter
from pydantic import BaseModel

# Importamos solo el cerebro narrativo, NO los servicios mecánicos
from orchestrator.velora_weaver import VeloraWeaver

router = APIRouter()
weaver = VeloraWeaver()

# --- 1. CONFIGURACIÓN DE FACETAS ---
# Mapa central de personalidades. Velora consulta esto para saber "quién ser".
FACETAS = {
    "tarot": {
        "instruccion": "Adopta un tono ceremonial y solemne. Enfócate en el simbolismo arquetípico y la voluntad.",
        "gatillos": [r"\btarot\b", r"\bprofec[ií]a\b", r"\bsecreto\b", r"\barcanos?\b", r"\bcartas?\b"],
    },
    "astrologia": {
        "instruccion": "Adopta un tono erudito y preciso. Usa metáforas de relojería celeste, órbitas y geometría sagrada.",
        "gatillos": [r"\bastrolog[ií]a\b", r"\bcarta nat[ae]l\b", r"\bazar celestial\b", r"\bplanetas?\b", r"\btránsito\b"],
    },
    "profecia": {
        "instruccion": "Adopta un tono críptico y atemporal. Habla en enigmas suaves o sentencias breves sobre el destino.",
        "gatillos": [r"\bpredicci?on(?:es)?\b", r"\bmundial\b", r"\bfuturo\b", r"\bdestino\b"],
    },
    "ritual": {
        "instruccion": "Adopta un tono voluntariaso y mágico. Enfócate en la acción, el rito y la transformación de la realidad.",
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
        "instruccion": "Adopta un tono hermético y axiomático. Basa tus respuestas en principios universales ('como es arriba es abajo').",
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

class Mensaje(BaseModel):
    usuario: str

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
            
    # B. Generar respuesta con IA (Pasamos la instrucción invisible al usuario)
    respuesta_velora = weaver.chat_libre(texto, instruccion_activa)

    return {
        "velora_voice": respuesta_velora["texto"],
        "reflejo": respuesta_velora["reflejo"],
        "faceta_usada": faceta_detectada 
    }

# NOTA: El endpoint "/tarot/tirada" SE HA MOVIDO a:
# services/tarot_service/router.py
# Esto mantiene la lógica mecánica separada de la lógica conversacional.