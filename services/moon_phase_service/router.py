from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime
import logging

from services.moon_phase_service.moon_phase_service import MoonService
from orchestrator.velora_weaver import VeloraWeaver

router = APIRouter(prefix="/moon-phase", tags=["moon"])
logger = logging.getLogger("MoonRouter")

mechanics = MoonService()
weaver = VeloraWeaver()

class MoonResponse(BaseModel):
    date: str
    phase_name: str
    illumination: float
    icon: str
    zodiac_sign: str
    velora_message: str
    velora_reflection: str

@router.get("/current", response_model=MoonResponse)
async def get_moon_phase(
    target_date: str = Query(None, description="Fecha YYYY-MM-DD (Opcional)")
):
    # 1. Gestionar Fecha
    try:
        if target_date:
            dt = datetime.strptime(target_date, "%Y-%m-%d")
        else:
            dt = datetime.now()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato inválido. Usa YYYY-MM-DD")

    # 2. MECÁNICA (Ephem)
    try:
        data = mechanics.calculate_moon_data(dt)
    except Exception as e:
        logger.error(f"Error cálculo lunar: {e}")
        raise HTTPException(status_code=500, detail="Nubes oscuras cubren el cielo.")

    # 3. MAGIA (Velora)
    # Enriquecemos el contexto para Velora: Fase + Signo
    contexto_velora = f"{data['description_base']} La Luna transita por el signo de {data['zodiac_sign']}."
    
    velora_voice = f"La Luna brilla en {data['zodiac_sign']}."
    velora_reflection = "Como es arriba, es abajo."

    try:
        lectura = weaver.interpretar_fase_lunar(
            fase=data['phase_name'],
            iluminacion=data['illumination'],
            descripcion_base=contexto_velora 
        )
        velora_voice = lectura["texto"]
        velora_reflection = lectura["reflejo"]
    except Exception as e:
        logger.warning(f"Velora calló en la luna: {e}")

    return MoonResponse(
        date=data["date"],
        phase_name=data["phase_name"],
        illumination=data["illumination"],
        icon=data["icon"],
        zodiac_sign=data["zodiac_sign"],
        velora_message=velora_voice,
        velora_reflection=velora_reflection
    )