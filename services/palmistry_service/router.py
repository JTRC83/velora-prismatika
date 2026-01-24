from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from typing import List
import logging

from services.palmistry_service.palmistry_service import PalmistryService
from orchestrator.velora_weaver import VeloraWeaver

router = APIRouter(prefix="/palmistry", tags=["palmistry"])
logger = logging.getLogger("PalmistryRouter")

mechanics = PalmistryService()
weaver = VeloraWeaver()

# Modelos
class LineInfo(BaseModel):
    id: str
    name: str
    description: str

class PalmReadingResponse(BaseModel):
    line_name: str
    base_reading: str
    velora_voice: str
    reflejo: str

@router.get("/lines", response_model=List[LineInfo])
def get_lines():
    return mechanics.get_lines_info()

@router.get("/read/{line_id}", response_model=PalmReadingResponse)
async def read_palm(line_id: str = Path(..., description="ID: heart, head, life, fate")):
    
    # 1. MECÁNICA
    data = mechanics.read_line(line_id)
    if not data:
        raise HTTPException(status_code=404, detail="Esa línea se ha borrado de tu piel.")

    # 2. MAGIA
    velora_voice = "Tus manos cuentan una historia..."
    velora_reflection = "El destino está en tus manos."

    try:
        lectura = weaver.interpretar_quiromancia(
            linea=data["line_name"],
            significado=data["description"],
            lectura_base=data["base_reading"]
        )
        velora_voice = lectura["texto"]
        velora_reflection = lectura["reflejo"]
    except Exception as e:
        logger.warning(f"Velora no pudo leer la mano: {e}")

    return {
        "line_name": data["line_name"],
        "base_reading": data["base_reading"],
        "velora_voice": velora_voice,
        "reflejo": velora_reflection
    }