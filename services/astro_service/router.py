from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import date
import logging
from typing import Optional

# Importamos TU mecánica refactorizada
from services.astro_service.astro_service import AstroService
# Importamos el Cerebro de Velora
from orchestrator.velora_weaver import VeloraWeaver

router = APIRouter(prefix="/astro", tags=["astro"])
logger = logging.getLogger("AstroRouter")

# Instancias
try:
    mechanics = AstroService()
except Exception as e:
    logger.error(f"Error iniciando AstroService: {e}")
    mechanics = None

weaver = VeloraWeaver()

class NatalRequest(BaseModel):
    fecha_nacimiento: date
    hora_nacimiento: Optional[str] = None
    nombre: str = "Consultante"
    lugar: str = "Desconocido"
    coordenadas: Optional[str] = None


@router.get("/geocode")
async def resolver_lugar(q: str = Query(..., min_length=2)):
    if not mechanics:
        raise HTTPException(status_code=500, detail="Error mecánico.")

    coordinates = mechanics.resolve_place_coordinates(q)
    if not coordinates:
        raise HTTPException(status_code=404, detail="No se pudieron resolver coordenadas para ese lugar.")

    return coordinates

@router.post("/carta-natal")
async def calcular_carta_natal(datos: NatalRequest, include_ai: bool = False):
    if not mechanics:
        raise HTTPException(status_code=500, detail="Error mecánico.")

    # 1. MECÁNICA (Astro + Día Semana)
    astro_data = mechanics.get_sun_sign_entry(datos.fecha_nacimiento)
    if not astro_data:
        raise HTTPException(status_code=400, detail="Fecha inválida.")

    transito_hoy = mechanics.obtener_transito_actual()
    nombre_dia, regente_dia = mechanics.obtener_info_dia(datos.fecha_nacimiento) # <--- NUEVO CÁLCULO

    # 2. INTERPRETACIÓN IA OPCIONAL
    velora_voice = ""
    velora_reflection = ""

    if include_ai:
        try:
            lectura = weaver.interpretar_carta_astral(
                signo=astro_data.sign,
                elemento=astro_data.element,
                transito=transito_hoy,
                dia_semana=nombre_dia,
                ciudad=datos.lugar
            )
            velora_voice = lectura["texto"]
            velora_reflection = lectura["reflejo"]
        except Exception as e:
            logger.warning(f"Velora calló: {e}")

    # 3. RESPUESTA
    return {
        "datos_tecnicos": {
            "signo": astro_data.sign,
            "elemento": astro_data.element,
            "planeta_regente": astro_data.ruling_planet,
            "cualidad": astro_data.quality,
            "transito_activo": transito_hoy,
            # NUEVOS DATOS PARA EL FRONTEND
            "dia_nacimiento": nombre_dia,
            "regente_dia": regente_dia,
            "dia_del_mes": datos.fecha_nacimiento.day,
            "mes_nacimiento": datos.fecha_nacimiento.month,
            "lugar": datos.lugar,
            "hora_nacimiento": datos.hora_nacimiento,
            "coordenadas": datos.coordenadas
        },
        "velora_voice": velora_voice,
        "reflejo": velora_reflection
    }
