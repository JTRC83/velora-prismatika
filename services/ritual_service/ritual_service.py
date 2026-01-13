import os
import json
import ephem
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List

from orchestrator.utils import get_velora_reflection
from services.astro_service.astro_service import get_sun_sign_entry

BASE = os.path.dirname(__file__)
RITUALS_PATH = os.path.join(BASE, "rituals.json")

router = APIRouter(prefix="/ritual", tags=["Rituales"])

def load_rituals():
    if not os.path.exists(RITUALS_PATH):
        return {}
    with open(RITUALS_PATH, encoding="utf-8") as f:
        return json.load(f)

RITUALS_DB = load_rituals()

# Palabras clave para detectar materiales automáticamente en tu texto
MATERIAL_KEYWORDS = {
    "vela": "Vela (del color sugerido)",
    "papel": "Papel y pluma",
    "incienso": "Incienso",
    "cristal": "Cristal o piedra",
    "agua": "Agua purificada",
    "sal": "Sal marina",
    "espejo": "Un espejo",
    "planta": "Una planta o semilla",
    "flor": "Flores frescas",
    "aceite": "Aceites esenciales",
    "música": "Música ambiente",
    "baño": "Sales de baño"
}

# Modelo de Respuesta
class RitualResponse(BaseModel):
    sign: str
    moon_phase: str
    ritual_title: str
    ritual_materials: List[str]
    ritual_steps: List[str]
    ritual_mantra: str
    velora_message: str

def get_detailed_moon_phase(dt):
    """
    Calcula una de las 8 fases exactas que usas en tu JSON.
    """
    date_ephem = ephem.Date(dt)
    prev_new = ephem.previous_new_moon(date_ephem)
    next_new = ephem.next_new_moon(date_ephem)
    
    # Progreso del ciclo (0.0 a 1.0)
    lunation = (date_ephem - prev_new) / (next_new - prev_new)
    
    # Mapeo preciso a tus claves del JSON
    if lunation < 0.03: return "Luna Nueva"
    if lunation < 0.22: return "Creciente Iluminante" # Waxing Crescent
    if lunation < 0.28: return "Primer Cuarto"        # First Quarter
    if lunation < 0.47: return "Gibosa Iluminante"    # Waxing Gibbous
    if lunation < 0.53: return "Luna Llena"
    if lunation < 0.72: return "Gibosa Menguante"     # Waning Gibbous
    if lunation < 0.78: return "Último Cuarto"        # Last Quarter
    return "Menguante Iluminante"                     # Waning Crescent

def smart_parse_ritual(instruction_text, affirmation_text):
    """
    Convierte tus textos planos en estructura de Grimorio.
    Ej: "Ritual de raíz: planta una flor..." -> Title: "Ritual de Raíz", Step: "Planta una flor..."
    """
    # 1. Intentar extraer Título
    if ":" in instruction_text:
        parts = instruction_text.split(":", 1)
        title = parts[0].strip()
        step_text = parts[1].strip().capitalize()
    else:
        title = "Rito del Momento"
        step_text = instruction_text

    # 2. Detectar Materiales (Magia de Python)
    materials = []
    text_lower = instruction_text.lower()
    for key, label in MATERIAL_KEYWORDS.items():
        if key in text_lower:
            materials.append(label)
    
    if not materials:
        materials = ["Tu intención focalizada", "Un espacio tranquilo"]

    # 3. Formatear Pasos (Dividimos si hay puntos para que parezca una lista)
    steps = [s.strip() for s in step_text.split('.') if s.strip()]

    # 4. Limpiar Afirmación (quitar comillas si las hay)
    mantra = affirmation_text.replace("«", "").replace("»", "").replace('"', '').strip()
    if "Afirmación:" in mantra:
        mantra = mantra.split("Afirmación:")[1].strip()

    return title, materials, steps, mantra

@router.get("/daily", response_model=RitualResponse)
def get_daily_ritual(
    birthdate: str = Query(..., description="YYYY-MM-DD")
):
    # 1. Calcular Signo
    try:
        y, m, d = map(int, birthdate.split("-"))
        entry = get_sun_sign_entry(m, d)
        sign_name = entry.sign # Ej: "Aries"
    except:
        raise HTTPException(400, "Fecha inválida")

    # 2. Calcular Fase Lunar Exacta
    now = datetime.now()
    phase = get_detailed_moon_phase(now)

    # 3. Buscar en TU JSON
    sign_data = RITUALS_DB.get(sign_name, {})
    
    # Tu JSON es una lista: [Instruccion, Afirmacion]
    # Intentamos buscar la fase exacta
    ritual_pair = sign_data.get(phase)
    
    # Si por error de cálculo astronómico no coincide exacto, fallback a Luna Nueva
    if not ritual_pair:
        phase = "Luna Nueva" # Default seguro
        ritual_pair = sign_data.get(phase, [
            "Medita en silencio.", 
            "Afirmación: «Soy paz.»"
        ])

    instruction = ritual_pair[0]
    affirmation = ritual_pair[1]

    # 4. Transformación Inteligente
    title, mats, steps, mantra = smart_parse_ritual(instruction, affirmation)

    # 5. Mensaje Velora
    velora_msg = get_velora_reflection("radical_will")

    return RitualResponse(
        sign=sign_name,
        moon_phase=phase,
        ritual_title=title,
        ritual_materials=mats,
        ritual_steps=steps,
        ritual_mantra=mantra,
        velora_message=velora_msg
    )