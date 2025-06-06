# orchestrator/router.py
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from orchestrator.mock_llm import respuesta_avatar, generar_reflejo

router = APIRouter()

# Definimos los avatares y sus gatillos temáticos
AVATARES = {
    "sibylla": {
        "firma": "Sibylla dixit.",
        "gatillos": [r"\btarot\b", r"\bprofec[ií]a\b", r"\bsecreto\b"],
    },
    "dee": {
        "firma": "Dee concluye el trazado estelar.",
        "gatillos": [r"\bastrolog[ií]a\b", r"\bcarta nat[ae]l\b", r"\bazar celestial\b"],
    },
    "nostradamus": {
        "firma": "—M.",
        "gatillos": [r"\bprediccion(?:es)?\b", r"\bmundial\b", r"\bfuturo\b"],
    },
    "crowley": {
        "firma": "Amor es la ley, amor bajo la voluntad.",
        "gatillos": [r"\btarot\b", r"\bmagia ceremonial\b", r"\britual\b"],
    },
    "blavatsky": {
        "firma": "Que la verdad sea tu religión.",
        "gatillos": [r"\bkarm[ae]\b", r"\breencarnaci[oó]n\b", r"\bkarma\b"],
    },
    "vanga": {
        "firma": "Así lo veo.",
        "gatillos": [r"\bconsejo\b", r"\bdirecci[oó]n\b", r"\bvida cotidiana\b"],
    },
    "hermes": {
        "firma": "Como es arriba, es abajo.",
        "gatillos": [r"\bherm[eé]tico\b", r"\btalism[aá]n\b", r"\brei?nigeria\b"],  # ajusta “rei?nigeria” si es necesario
    },
    "paracelso": {
        "firma": "In natura, la cura.",
        "gatillos": [r"\bsalud\b", r"\balq?u?imia\b", r"\bhierbas\b", r"\bemergencias?\b"],
    },
}

# Precompilar los patrones de gatillo para cada avatar
for datos in AVATARES.values():
    datos["gatillos"] = [re.compile(p, re.IGNORECASE) for p in datos["gatillos"]]

# Patrón para invocación directa: "Convocar a Sibylla" o "Consultar a Dee"
INVOCAR_DIRECTO = re.compile(r"\b(?:Convocar|Consultar)\s+a\s+([A-Za-záéíóúÁÉÍÓÚñÑ]+)\b", re.IGNORECASE)

class Mensaje(BaseModel):
    usuario: str

@router.post("/chat")
async def chat(mensaje: Mensaje):
    texto = mensaje.usuario.strip()

    # 1) Detectar invocación directa
    match = INVOCAR_DIRECTO.search(texto)
    if match:
        avatar_raw = match.group(1).lower()
        avatar = avatar_raw.encode("ascii", "ignore").decode().lower()  # normalizar
        if avatar not in AVATARES:
            raise HTTPException(status_code=404, detail=f"Avatar '{avatar_raw}' desconocido.")
        # Generar saludo de Velora
        velora_msg = f"Invoco a {avatar_raw.capitalize()}, guardián(a) de su arte eterno."
    else:
        # 2) Detectar gatillos temáticos
        avatar = None
        for nombre, datos in AVATARES.items():
            for pattern in datos["gatillos"]:
                if pattern.search(texto):
                    avatar = nombre
                    break
            if avatar:
                break

        if avatar:
            velora_msg = f"Velora escucha tu pregunta y convoca a {avatar.capitalize()}."
        else:
            # 3) Si no hay coincidencias, pedir aclaración
            return {
                "velora": "No he descifrado claramente tu intención. ¿Te interesa un consejo cabalístico, astrológico, profecía tajante…?",
                "avatar": None,
                "reflejo": None
            }

    # 4) Llamar al mock_llm para obtener la respuesta del avatar (texto + firma)
    respuesta = respuesta_avatar(avatar, texto)  # retorna cadena de varias líneas
    # 5) Generar el reflejo prismátiko
    reflejo = generar_reflejo(avatar, texto, respuesta)

    return {
        "velora": velora_msg,
        "avatar": respuesta,
        "reflejo": reflejo
    }