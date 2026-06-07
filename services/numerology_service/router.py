from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date
import logging

from services.numerology_service.numerology_service import NumerologyService

router = APIRouter(prefix="/numerology", tags=["numerology"])
logger = logging.getLogger("NumerologyRouter")

# Instancias
mechanics = NumerologyService()

class NumerologyRequest(BaseModel):
    nombre: str
    fecha_nacimiento: date

@router.post("/informe")
async def calcular_numerologia(datos: NumerologyRequest):
    # 1. MECÁNICA (Cálculos exactos con tu lógica)
    try:
        path_num = mechanics.calculate_life_path(datos.fecha_nacimiento)
        destiny_num = mechanics.calculate_destiny(datos.nombre)
        personal_year = mechanics.calculate_personal_year(path_num)
        
        # Obtenemos títulos/arquetipos de tu JSON (Fallback)
        arq_path = mechanics.get_meaning(path_num)
        arq_destiny = mechanics.get_meaning(destiny_num)
        
    except Exception as e:
        logger.error(f"Error cálculo numerología: {e}")
        raise HTTPException(status_code=500, detail="Error en los cálculos numéricos.")

    # 2. RESPUESTA AL FRONTEND
    # La interpretación de Velora se genera después desde el chat contextual,
    # para no bloquear ni deformar la card principal del servicio.
    return {
        "datos_tecnicos": {
            "camino_vida": path_num,
            "arquetipo_vida": arq_path,
            "numero_destino": destiny_num,
            "arquetipo_destino": arq_destiny,
            "ano_personal": personal_year
        }
    }
