from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

# IMPORTANTE: Ajustado a tu nombre de carpeta 'crystal_service'
from services.crystal_service.crystal_service import CrystalService
from orchestrator.velora_weaver import VeloraWeaver

router = APIRouter(prefix="/crystal", tags=["crystal"])
logger = logging.getLogger("CrystalRouter")

mechanics = CrystalService()
weaver = VeloraWeaver()

class VisionRequest(BaseModel):
    question: str

@router.post("/gaze")
async def consultar_bola(datos: VisionRequest):
    if not datos.question.strip():
        raise HTTPException(status_code=400, detail="La bola requiere una pregunta.")

    # 1. MECÁNICA
    seed = mechanics.get_vision_seed(datos.question)

    # 2. MAGIA (Velora)
    velora_voice = "La niebla se arremolina..."
    velora_reflection = "El futuro no está escrito."

    try:
        # Usamos la función que ya tienes en velora_weaver.py
        lectura = weaver.interpretar_vision_cristal(
            pregunta=datos.question,
            tema=seed["topic"],
            mensaje_base=seed["base_message"]
        )
        velora_voice = lectura["texto"]
        velora_reflection = lectura["reflejo"]
    except Exception as e:
        logger.warning(f"Velora calló en la bola: {e}")

    return {
        "topic": seed["topic"],
        "velora_voice": velora_voice,
        "reflejo": velora_reflection
    }