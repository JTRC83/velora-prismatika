import os, json
import ephem
import math
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

BASE = os.path.dirname(__file__)
BODIES_PATH = os.path.join(BASE, "bodies.json")

router = APIRouter(prefix="/transits", tags=["Tránsitos Planetarios"])

# --- CARGA DE DATOS ---
try:
    with open(BODIES_PATH, encoding="utf-8") as f:
        BODIES = json.load(f)
except FileNotFoundError:
    BODIES = []

# --- CONSTANTES ASTROLÓGICAS ---
ZODIAC_SIGNS = [
    "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", 
    "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
]

ASPECTS = {
    0:   {"name": "Conjunción", "nature": "Intensidad / Fusión", "type": "neutral"},
    60:  {"name": "Sextil",     "nature": "Oportunidad / Flujo", "type": "soft"},
    90:  {"name": "Cuadratura", "nature": "Tensión / Acción",    "type": "hard"},
    120: {"name": "Trígono",    "nature": "Armonía / Suerte",    "type": "soft"},
    180: {"name": "Oposición",  "nature": "Polaridad / Espejo",  "type": "hard"}
}

# Orbes permitidos (margen de error en grados)
ORB_LUMINARIES = 8.0 # Sol y Luna tienen más influencia
ORB_PLANETS = 6.0

# --- MODELOS DE RESPUESTA ---
class BodyPosition(BaseModel):
    id: str
    name: str
    sign: str
    degree: int
    minute: int
    retrograde: bool
    archetype: str

class Aspect(BaseModel):
    planet_a: str
    planet_b: str
    aspect_name: str
    orb: float
    interpretation: str

class TransitResponse(BaseModel):
    date: str
    zodiac_positions: list[BodyPosition]
    aspects: list[Aspect]
    retrograde_alert: list[str] # Lista de planetas retrógrados para avisos rápidos

# --- UTILIDADES ---

def get_zodiac_position(lon_deg):
    """Convierte longitud absoluta (0-360) a Signo + Grados."""
    # Cada signo son 30 grados
    index = int(lon_deg / 30)
    sign = ZODIAC_SIGNS[index % 12]
    
    degree_total = lon_deg % 30
    degree = int(degree_total)
    minute = int((degree_total - degree) * 60)
    
    return sign, degree, minute

def is_body_retrograde(body_cls, eph_date):
    """
    Detecta si un cuerpo está retrógrado comparando su posición
    en T con su posición en T - delta (1 hora antes).
    Si la longitud disminuye, está yendo 'hacia atrás' (desde la Tierra).
    """
    # Instante actual
    b1 = body_cls(eph_date)
    lon1 = ephem.Ecliptic(b1).lon
    
    # Instante anterior (1 hora antes)
    dt_prev = eph_date.datetime() - timedelta(hours=1)
    b2 = body_cls(ephem.Date(dt_prev))
    lon2 = ephem.Ecliptic(b2).lon
    
    # Si la posición actual es MENOR que la anterior, es retrógrado
    # (Cuidado con el cruce 0/360, lo ignoramos para simplificar en este caso raro)
    return lon1 < lon2

def generate_interpretation(p1_name, p2_name, aspect_info, p1_keys, p2_keys):
    """Genera una frase mística combinando las energías."""
    nature = aspect_info["nature"]
    # Ejemplo: "Tensión (Cuadratura) entre el Ego (Sol) y la Acción (Marte)"
    k1 = p1_keys[0] if p1_keys else "Energía"
    k2 = p2_keys[0] if p2_keys else "Energía"
    
    return f"{nature} entre {p1_name} ({k1}) y {p2_name} ({k2})."

# --- ENDPOINT PRINCIPAL ---

@router.get("/", response_model=TransitResponse)
def calculate_transits(date: str = Query(..., description="YYYY-MM-DD")):
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        # Añadimos las 12:00 UTC para tener una media del día
        dt = dt.replace(hour=12)
    except ValueError:
        raise HTTPException(400, "Formato fecha inválido. Use YYYY-MM-DD")
    
    eph_date = ephem.Date(dt)
    
    calculated_bodies = []
    positions_raw = [] # Para calcular aspectos después
    retrograde_list = []

    # 1. CALCULAR POSICIONES
    for entry in BODIES:
        try:
            # ephem.Mars, ephem.Sun, etc.
            body_cls = getattr(ephem, entry["id"])
        except AttributeError:
            continue # Si no existe en ephem (raro)
            
        # Calcular posición
        body_obj = body_cls(eph_date)
        ecl = ephem.Ecliptic(body_obj)
        lon_rad = ecl.lon
        lon_deg = math.degrees(lon_rad) % 360
        
        # Calcular signo
        sign, deg, min_val = get_zodiac_position(lon_deg)
        
        # Calcular retrógrado (Sol y Luna nunca retrogradan)
        retro = False
        if entry["id"] not in ["Sun", "Moon"]:
            retro = is_body_retrograde(body_cls, eph_date)
            if retro:
                retrograde_list.append(entry["name"])

        # Guardar datos procesados
        calculated_bodies.append(BodyPosition(
            id=entry["id"],
            name=entry["name"],
            sign=sign,
            degree=deg,
            minute=min_val,
            retrograde=retro,
            archetype=entry.get("archetype", "")
        ))
        
        # Guardar raw para aspectos
        positions_raw.append({
            "id": entry["id"],
            "name": entry["name"],
            "lon": lon_deg,
            "keywords": entry.get("keywords", [])
        })

    # 2. CALCULAR ASPECTOS
    detected_aspects = []
    n = len(positions_raw)
    
    for i in range(n):
        for j in range(i + 1, n):
            p1 = positions_raw[i]
            p2 = positions_raw[j]
            
            # Diferencia angular absoluta
            diff = abs(p1["lon"] - p2["lon"])
            if diff > 180: diff = 360 - diff
            
            # Determinar Orbe (si uno es Sol/Luna, usamos orbe amplio)
            current_orb = ORB_LUMINARIES if (p1["id"] in ["Sun","Moon"] or p2["id"] in ["Sun","Moon"]) else ORB_PLANETS
            
            for angle, info in ASPECTS.items():
                orb_dist = abs(diff - angle)
                if orb_dist <= current_orb:
                    # ¡Aspecto encontrado!
                    interp = generate_interpretation(
                        p1["name"], p2["name"], info, p1["keywords"], p2["keywords"]
                    )
                    
                    detected_aspects.append(Aspect(
                        planet_a=p1["name"],
                        planet_b=p2["name"],
                        aspect_name=info["name"],
                        orb=round(orb_dist, 2),
                        interpretation=interp
                    ))
                    break # Solo un aspecto posible por par

    return TransitResponse(
        date=date,
        zodiac_positions=calculated_bodies,
        aspects=detected_aspects,
        retrograde_alert=retrograde_list
    )