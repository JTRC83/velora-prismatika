from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date
import logging

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
    nombre: str = "Consultante"
    lugar: str = "Desconocido"

@router.post("/carta-natal")
async def calcular_carta_natal(datos: NatalRequest):
    if not mechanics:
        raise HTTPException(status_code=500, detail="Error mecánico.")

    # 1. MECÁNICA (Astro + Día Semana)
    astro_data = mechanics.get_sun_sign_entry(datos.fecha_nacimiento)
    if not astro_data:
        raise HTTPException(status_code=400, detail="Fecha inválida.")

    transito_hoy = mechanics.obtener_transito_actual()
    nombre_dia, regente_dia = mechanics.obtener_info_dia(datos.fecha_nacimiento) # <--- NUEVO CÁLCULO

    # 2. MAGIA (Velora con contexto geográfico y temporal)
    frase_backup = mechanics.obtener_horoscopo_base(astro_data.sign)
    velora_voice = frase_backup
    velora_reflection = "El tiempo es un círculo."

    try:
        lectura = weaver.interpretar_carta_astral(
            signo=astro_data.sign,
            elemento=astro_data.element,
            transito=transito_hoy,
            dia_semana=nombre_dia,   # <--- PASAMOS EL DÍA
            ciudad=datos.lugar       # <--- PASAMOS LA CIUDAD
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
            "lugar": datos.lugar
        },
        "velora_voice": velora_voice,
        "reflejo": velora_reflection
    }