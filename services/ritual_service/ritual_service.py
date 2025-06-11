import os, json, random
import ephem
import math
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from services.astro_service.astro_service import get_sun_sign_entry

BASE = os.path.dirname(__file__)
RITUALS_PATH = os.path.join(BASE, "rituals.json")

router = APIRouter(prefix="/ritual", tags=["Rituales"])

with open(RITUALS_PATH, encoding="utf-8") as f:
    RITUALS = json.load(f)

# Reutilizamos la lógica de fases del moon_phase_service
PHASES = [
  (0.0, 12.5, "Luna Nueva"),
  (12.5, 25.0, "Creciente Iluminante"),
  (25.0, 37.5, "Primer Cuarto"),
  (37.5, 50.0, "Gibosa Iluminante"),
  (50.0, 62.5, "Luna Llena"),
  (62.5, 75.0, "Gibosa Menguante"),
  (75.0, 87.5, "Último Cuarto"),
  (87.5, 100.0, "Menguante Iluminante")
]

def get_moon_phase_name(dt: datetime) -> str:
    """Calcula la fase lunar y devuelve su nombre."""
    m = ephem.Moon(dt)
    illum = float(m.phase)
    for start, end, name in PHASES:
        if start <= illum < end:
            return name
    return PHASES[0][2]

@router.get("/", summary="Ritual o afirmación según signo y fase lunar")
def daily_ritual(
    birthdate: str = Query(None, description="Fecha de nacimiento YYYY-MM-DD"),
    sign: str      = Query(None, description="Signo solar (Aries, Tauro…)"),
    date: str      = Query(None, description="Fecha de la lectura YYYY-MM-DD")
):
    """
    Devuelve un ritual o afirmación:
      - Si se pasa `birthdate`, calcula signo solar.
      - Si se pasa `sign`, lo usa directamente.
      - Si no se da `date`, usa hoy.
      - Luego calcula fase lunar y elige una sugerencia aleatoria.
    """
    # Determinar signo
    if birthdate:
        try:
            dt_birth = datetime.strptime(birthdate, "%Y-%m-%d")
            entry = get_sun_sign_entry(dt_birth.month, dt_birth.day)
            sign_name = entry["sign"]
        except Exception:
            raise HTTPException(400, "Fecha de nacimiento inválida.")
    elif sign:
        sign_name = sign.capitalize()
        if sign_name not in RITUALS:
            raise HTTPException(400, f"Signo desconocido: {sign}")
    else:
        raise HTTPException(400, "Debes pasar 'birthdate' o 'sign'.")

    # Determinar fecha para fase lunar
    dt = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()
    phase = get_moon_phase_name(dt)

    # Obtener lista de rituales
    sign_rituals = RITUALS.get(sign_name, {})
    phase_rituals = sign_rituals.get(phase)
    if not phase_rituals:
        # Fallback genérico
        fallback = [f"Medita en tu energía de {sign_name} bajo la {phase}."]
        phase_rituals = fallback

    choice = random.choice(phase_rituals)
    return {
        "sign": sign_name,
        "MoonPhase": phase,
        "ritual": choice
    }