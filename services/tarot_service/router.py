from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging
from typing import List, Dict, Any 

from services.tarot_service.tarot_service import TarotService
from orchestrator.velora_weaver import VeloraWeaver

# 👇 ESTA ES LA VARIABLE QUE TE FALTABA 👇
router = APIRouter(prefix="/tarot", tags=["tarot"])
logger = logging.getLogger("TarotRouter")

# CONFIGURACIÓN DE TIRADAS
TIRADAS_CONFIG = {
    "one-card": {"cantidad": 1, "nombre": "Consejo del Día"},
    "three-card": {"cantidad": 3, "nombre": "Pasado, Presente y Futuro"},
    "five-card": {"cantidad": 5, "nombre": "La Estrella de la Verdad"}
}

try:
    mechanics = TarotService()
except Exception as e:
    mechanics = None

weaver = VeloraWeaver()

class TiradaRequest(BaseModel):
    tipo: str = "three-card"

@router.post("/tirada")
async def realizar_tirada(datos: TiradaRequest):
    if not mechanics:
        raise HTTPException(status_code=500, detail="Error mecánico en el Tarot.")

    config = TIRADAS_CONFIG.get(datos.tipo)
    if not config:
        config = TIRADAS_CONFIG["three-card"]

    try:
        cartas = mechanics.tirar_cartas(cantidad=config["cantidad"])
    except Exception as e:
        logger.error(f"Fallo mecánico: {e}")
        raise HTTPException(status_code=500, detail="Error al barajar.")

    # FASE MAGIA (Velora)
    velora_voice = "El velo está denso. Las cartas hablan por sí mismas."
    velora_reflection = "Observa en silencio."

    try:
        interpretacion = weaver.interpretar_tirada_tarot(cartas, tipo_tirada=config["nombre"])
        velora_voice = interpretacion["texto"]
        velora_reflection = interpretacion["reflejo"]
    except Exception as e:
        logger.warning(f"Velora calló: {e}")

    return {
        "visual_data": cartas,
        "velora_voice": velora_voice,
        "reflejo": velora_reflection,
        "tipo_tirada": datos.tipo
    }