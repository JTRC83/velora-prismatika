from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from services.chakra_service.chakra_service import ChakraService
from orchestrator.velora_weaver import VeloraWeaver

router = APIRouter(prefix="/chakra", tags=["chakra"])
logger = logging.getLogger("ChakraRouter")

mechanics = ChakraService()
weaver = VeloraWeaver()

# Modelos de entrada
class DiagnosisRequest(BaseModel):
    symptom: str

@router.get("/list")
def listar_chakras():
    return mechanics.get_all()

@router.post("/align")
async def alinear_chakra(datos: DiagnosisRequest):
    """
    Recibe un síntoma (o el nombre de un chakra) y devuelve la cura.
    """
    # 1. MECÁNICA (Diagnóstico)
    sintoma = datos.symptom
    resultado = mechanics.diagnose_by_symptom(sintoma)
    
    # Si el usuario escribió el nombre de un chakra directamente (ej: "corona"), lo buscamos manual
    if not resultado["found"]:
        for c in mechanics.get_all():
            if c["name"].lower() in sintoma.lower() or c["sanskrit"].lower() in sintoma.lower():
                resultado = {"found": True, "chakra": c}
                break

    target_chakra = resultado["chakra"]
    if not target_chakra:
         raise HTTPException(status_code=404, detail="Energía no encontrada.")

    # 2. MAGIA (Sanación)
    velora_voice = "Respira profundo..."
    velora_reflection = "La energía fluye donde va la atención."

    try:
        lectura = weaver.interpretar_sanacion_chakra(
            chakra_nombre=target_chakra["name"],
            sintoma=sintoma if resultado["found"] else "",
            mantra=target_chakra["mantra"]
        )
        velora_voice = lectura["texto"]
        velora_reflection = lectura["reflejo"]
    except Exception as e:
        logger.warning(f"Velora calló en chakras: {e}")

    return {
        "chakra": target_chakra,
        "velora_voice": velora_voice,
        "reflejo": velora_reflection,
        "diagnostico_exitoso": resultado["found"]
    }