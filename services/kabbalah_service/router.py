from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from services.kabbalah_service.kabbalah_service import KabbalahService
from orchestrator.velora_weaver import VeloraWeaver

router = APIRouter(prefix="/kabbalah", tags=["kabbalah"])
logger = logging.getLogger("KabbalahRouter")

mechanics = KabbalahService()
weaver = VeloraWeaver()

class GematriaRequest(BaseModel):
    name: str

@router.get("/tree")
def get_tree():
    return mechanics.get_all()

@router.post("/calculate")
async def calculate_gematria(datos: GematriaRequest):
    """
    Calcula la Sephirá personal y pide interpretación a Velora.
    """
    if not datos.name.strip():
        raise HTTPException(status_code=400, detail="El nombre es necesario.")

    # 1. MECÁNICA
    resultado = mechanics.calculate_personal_sephira(datos.name)
    sephira = resultado["sephira"]
    
    if not sephira:
        raise HTTPException(status_code=404, detail="La esfera está oculta.")

    # 2. MAGIA
    velora_voice = "El Árbol susurra tu nombre."
    velora_reflection = "Todo es Uno."

    try:
        lectura = weaver.interpretar_cabala(
            nombre_usuario=datos.name,
            sephira=sephira["name"],
            virtud=sephira["virtue"],
            angel=sephira["angel"]
        )
        velora_voice = lectura["texto"]
        velora_reflection = lectura["reflejo"]
    except Exception as e:
        logger.warning(f"Velora calló en cábala: {e}")

    return {
        "calculation": resultado,
        "velora_voice": velora_voice,
        "reflejo": velora_reflection
    }