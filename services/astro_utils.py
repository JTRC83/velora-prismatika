"""
Utilidades astronómicas compartidas por los servicios de Velora.

Centraliza constantes y cálculos astronómicos que antes estaban duplicados
entre moon_phase_service, ritual_service, transits_service y
compatibility_service.

Los nombres de las fases lunares son los canónicos del JSON de rituales
(rituals.json), que coinciden con la nomenclografía astrológica tradicional.
"""

import math
import ephem
from datetime import datetime

# --- CONSTANTE ZODIACAL ---

ZODIAC_SIGNS = [
    "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
    "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis",
]

# --- FASES LUNARES (8 FASES CANÓNICAS) ---

# Cada entrada: (nombre_canónico, icono, descripción_base, umbral_superior_lunation)
# Los nombres coinciden con las claves de rituals.json.
MOON_PHASES = [
    ("Luna Nueva",            "🌑", "Inicios, siembra, vacío fértil.",          0.03),
    ("Creciente Iluminante",   "🌒", "Intención, brotes, primeros pasos.",      0.22),
    ("Primer Cuarto",          "🌓", "Acción, desafío, superación.",            0.28),
    ("Gibosa Iluminante",      "🌔", "Perfeccionamiento, ajuste.",              0.47),
    ("Luna Llena",             "🌕", "Plenitud, cosecha, iluminación.",        0.53),
    ("Gibosa Menguante",       "🌖", "Gratitud, compartir, introspección.",     0.72),
    ("Último Cuarto",          "🌗", "Soltar, limpieza, perdón.",              0.78),
    ("Menguante Iluminante",   "🌘", "Descanso, curación, preparación.",       1.01),
]


def get_lunation(date_obj) -> float:
    """Calcula el porcentaje del ciclo lunar (0.0 a 1.0) para una fecha dada."""
    date_ephem = ephem.Date(date_obj)
    prev_new = ephem.previous_new_moon(date_ephem)
    next_new = ephem.next_new_moon(date_ephem)
    return (date_ephem - prev_new) / (next_new - prev_new)


def get_moon_phase(date_obj) -> tuple:
    """
    Devuelve (nombre, icono, descripcion) de la fase lunar para una fecha dada.
    Usa los 8 nombres canónicos que coinciden con rituals.json.
    """
    lunation = get_lunation(date_obj)
    for name, icon, desc, threshold in MOON_PHASES:
        if lunation < threshold:
            return name, icon, desc
    return MOON_PHASES[-1][0], MOON_PHASES[-1][1], MOON_PHASES[-1][2]


def get_planet_sign(planet_obj, date_now) -> str:
    """
    Calcula en qué signo zodiacal está un planeta (o la Luna) para una fecha dada.
    Acepta cualquier objeto de ephem (ephem.Venus(), ephem.Moon(), etc.).
    """
    observer = ephem.Observer()
    observer.date = date_now
    planet_obj.compute(observer)
    degrees = math.degrees(ephem.Ecliptic(planet_obj).lon)
    sign_index = int(degrees / 30)
    return ZODIAC_SIGNS[sign_index % 12]


def get_moon_sign(date_obj) -> str:
    """Calcula el signo tropical de la Luna para una fecha dada."""
    return get_planet_sign(ephem.Moon(), date_obj)


def get_zodiac_position(lon_deg: float) -> tuple:
    """
    Convierte longitud absoluta (0-360) a (signo, grado, minuto).
    Usado por transits_service para posiciones planetarias.
    """
    index = int(lon_deg / 30)
    sign = ZODIAC_SIGNS[index % 12]

    degree_total = lon_deg % 30
    degree = int(degree_total)
    minute = int((degree_total - degree) * 60)

    return sign, degree, minute