from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import logging

from services.runes_service.runes_service import RunesService
from orchestrator.velora_weaver import VeloraWeaver

router = APIRouter(prefix="/runes", tags=["runes"])
logger = logging.getLogger("RunesRouter")

mechanics = RunesService()
weaver = VeloraWeaver()

class RuneCastRequest(BaseModel):
    tipo: str = "three" # "one" (Consejo), "three" (Nornas), "five" (Cruz)

@router.post("/cast")
async def lanzar_runas(datos: RuneCastRequest):
    # 1. Configuración de la tirada
    cantidad = 1
    nombres_posicion = ["El Consejo de Odín"]
    nombre_tirada = "La Runa Única"

    if datos.tipo == "three":
        cantidad = 3
        nombres_posicion = ["Urd (Lo que fue)", "Verdandi (Lo que es)", "Skuld (Lo que será)"]
        nombre_tirada = "Tirada de las Nornas"
    elif datos.tipo == "five":
        cantidad = 5
        nombres_posicion = ["El Yo", "El Desafío", "El Camino", "El Sacrificio", "El Destino"]
        nombre_tirada = "La Cruz de Thor"

    # 2. MECÁNICA
    try:
        runas_sacadas = mechanics.cast_runes(cantidad)
        
        # Asignar nombres de posición
        for i, r in enumerate(runas_sacadas):
            if i < len(nombres_posicion):
                r["position_desc"] = nombres_posicion[i]
            else:
                r["position_desc"] = f"Posición {i+1}"

    except Exception as e:
        logger.error(f"Error lanzando runas: {e}")
        raise HTTPException(status_code=500, detail="Las piedras se han roto.")

    # 3. MAGIA (Velora)
    velora_voice = "El viento del norte guarda silencio."
    velora_reflection = "El destino es ineludible."

    try:
        # Usamos el método que ya pegaste en velora_weaver.py
        lectura = weaver.interpretar_runas(runas_sacadas, tipo_tirada=nombre_tirada)
        velora_voice = lectura["texto"]
        velora_reflection = lectura["reflejo"]
    except Exception as e:
        logger.warning(f"Velora calló en runas: {e}")

    return {
        "visual_data": runas_sacadas,
        "velora_voice": velora_voice,
        "reflejo": velora_reflection,
        "tipo_tirada": nombre_tirada
    }