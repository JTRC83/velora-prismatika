import os
import ephem
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime

BASE = os.path.dirname(__file__)
router = APIRouter(prefix="/moon-phase", tags=["Fases Lunares"])

PHASES = [
    (0.0, 12.5, "Luna Nueva", "🌑", "Tiempo de nuevos comienzos y renovación."),
    (12.5, 25.0, "Creciente Iluminante", "🌒", "Paso inicial hacia la claridad interior."),
    (25.0, 37.5, "Primer Cuarto", "🌓", "Momento de tomar decisiones equilibradas."),
    (37.5, 50.0, "Gibosa Iluminante", "🌔", "Cultiva la luz que crece en tu interior."),
    (50.0, 62.5, "Luna Llena", "🌕", "Punto de culminación y plenitud energética."),
    (62.5, 75.0, "Gibosa Menguante", "🌖", "Reflexiona sobre lo aprendido hasta ahora."),
    (75.0, 87.5, "Último Cuarto", "🌗", "Momento de soltar y cerrar ciclos."),
    (87.5, 100.0, "Menguante Iluminante", "🌘", "Transición suave hacia el descanso interno.")
]

@router.get("/",
            summary="Obtiene la fase lunar para una fecha dada",
            description="Devuelve nombre, icono, porcentaje de iluminación y significado simbólico.")
def moon_phase(
    date: str = Query(..., description="Fecha en formato YYYY-MM-DD")
):
    # Parsear fecha
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato inválido, use YYYY-MM-DD")
    # Calcular fase con PyEphem
    try:
        moon = ephem.Moon(dt)
        illum = float(moon.phase)  # porcentaje iluminado
    except Exception:
        raise HTTPException(status_code=500, detail="Error al calcular fase lunar")
    # Determinar fase
    for start, end, name, icon, meaning in PHASES:
        if start <= illum < end:
            return {
                "date": date,
                "phase_name": name,
                "icon": icon,
                "illumination": round(illum, 1),
                "meaning": meaning
            }
    # En caso borde
    name, icon, meaning = PHASES[0][2], PHASES[0][3], PHASES[0][4]
    return {
        "date": date,
        "phase_name": name,
        "icon": icon,
        "illumination": round(illum, 1),
        "meaning": meaning
    }
