import os
import ephem
import math
from datetime import datetime, date
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from orchestrator.utils import get_velora_reflection

router = APIRouter(prefix="/moon-phase", tags=["Fases Lunares"])

# --- CONSTANTES Y UTILIDADES ---

ZODIAC_SIGNS = [
    "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", 
    "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
]

class MoonResponse(BaseModel):
    date: str
    phase_name: str
    illumination: float
    icon: str
    zodiac_sign: str
    velora_message: str

def get_moon_sign(date_obj):
    """Calcula el signo tropical de la luna."""
    observer = ephem.Observer()
    observer.date = date_obj
    moon = ephem.Moon(observer)
    degrees = math.degrees(moon.hlon)
    sign_index = int(degrees / 30)
    return ZODIAC_SIGNS[sign_index % 12]

def get_phase_details(date_obj):
    """
    Calcula la fase basándose en la 'lunación' (0.0 a 1.0),
    lo que permite distinguir Creciente de Menguante.
    """
    observer = ephem.Observer()
    observer.date = date_obj
    
    # Calculamos la lunación comparando con la Luna Nueva anterior y siguiente
    prev_new = ephem.previous_new_moon(date_obj)
    next_new = ephem.next_new_moon(date_obj)
    
    # Porcentaje del ciclo completado (0.0 = Nueva, 0.5 = Llena, 0.99 = Fin)
    lunation = (ephem.Date(date_obj) - prev_new) / (next_new - prev_new)
    
    # Mapeo preciso
    if lunation < 0.03: return "Luna Nueva", "🌑"
    if lunation < 0.22: return "Creciente", "🌒"
    if lunation < 0.28: return "Cuarto Creciente", "🌓"
    if lunation < 0.47: return "Gibosa Creciente", "🌔"
    if lunation < 0.53: return "Luna Llena", "🌕"
    if lunation < 0.72: return "Gibosa Menguante", "🌖"
    if lunation < 0.78: return "Cuarto Menguante", "🌗"
    return "Menguante", "🌘"

# --- ENDPOINT ---

@router.get("/current", response_model=MoonResponse)
def get_moon_phase(
    target_date: str = Query(None, description="Fecha YYYY-MM-DD (Opcional, por defecto HOY)", alias="date")
):
    """
    Devuelve la fase lunar, iluminación, signo y mensaje de Velora.
    Acepta una fecha opcional.
    """
    # 1. Gestionar Fecha
    try:
        if target_date:
            dt = datetime.strptime(target_date, "%Y-%m-%d")
        else:
            dt = datetime.now()
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato inválido. Usa YYYY-MM-DD")

    # 2. Cálculos Astronómicos (Ephem)
    observer = ephem.Observer()
    observer.date = dt
    moon = ephem.Moon(observer)
    
    illumination = round(moon.phase, 1) # Porcentaje de luz (0-100)
    phase_name, icon = get_phase_details(dt) # Nombre real (Creciente vs Menguante)
    zodiac_sign = get_moon_sign(dt) # Signo astrológico

    # 3. La Voz de Velora
    # Usamos la lente 'lunar_tides' que definimos en wisdom_lenses.json
    message = get_velora_reflection("lunar_tides")

    return MoonResponse(
        date=dt.strftime("%Y-%m-%d"),
        phase_name=phase_name,
        illumination=illumination,
        icon=icon,
        zodiac_sign=zodiac_sign,
        velora_message=message
    )