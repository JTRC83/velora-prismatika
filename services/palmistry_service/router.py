from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from typing import Dict, List, Optional
import logging

from services.palmistry_service.palmistry_service import PalmistryService
from orchestrator.velora_weaver import get_weaver

router = APIRouter(prefix="/palmistry", tags=["palmistry"])
logger = logging.getLogger("PalmistryRouter")

mechanics = PalmistryService()
weaver = get_weaver()

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

class PalmScanRequest(BaseModel):
    hand_side: str
    source: str
    image_name: Optional[str] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None

class PalmFocusLine(BaseModel):
    line_id: str
    line_name: str
    description: str
    base_reading: str

class PalmScanResponse(BaseModel):
    hand_side: str
    hand_label: str
    hand_meaning: str
    source: str
    source_label: str
    image_note: str
    base_reading: str
    focus_lines: List[PalmFocusLine]
    reflejo: str

@router.get("/lines", response_model=List[LineInfo])
def get_lines():
    return mechanics.get_lines_info()

@router.get("/read/{line_id}", response_model=PalmReadingResponse)
async def read_palm(line_id: str = Path(..., description="ID: heart, head, life, fate"), include_ai: bool = False):
    
    # 1. MECÁNICA
    data = mechanics.read_line(line_id)
    if not data:
        raise HTTPException(status_code=404, detail="Esa línea se ha borrado de tu piel.")

    # 2. Interpretación IA opcional. La app genera la explicación aparte.
    velora_voice = ""
    velora_reflection = ""

    if include_ai:
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

@router.post("/scan", response_model=PalmScanResponse)
async def scan_palm(payload: PalmScanRequest):
    if payload.hand_side not in {"left", "right"}:
        raise HTTPException(status_code=422, detail="Selecciona mano izquierda o derecha.")

    image_meta: Dict[str, int] = {}
    if payload.image_width:
        image_meta["width"] = payload.image_width
    if payload.image_height:
        image_meta["height"] = payload.image_height

    return mechanics.read_photo(
        hand_side=payload.hand_side,
        source=payload.source,
        image_meta=image_meta,
    )
