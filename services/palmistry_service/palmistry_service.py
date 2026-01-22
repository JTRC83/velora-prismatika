import json
import os
import random
from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel

BASE = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE, "palmistry.json")

router = APIRouter(prefix="/palmistry", tags=["Quiromancia"])

# Cargar datos
try:
    with open(DATA_PATH, encoding="utf-8") as f:
        PALM_DATA = json.load(f)
except FileNotFoundError:
    PALM_DATA = {"lines": []}

# Modelos
class PalmReading(BaseModel):
    line_id: str
    line_name: str
    description: str
    reading: str

@router.get("/lines", summary="Obtener lista de líneas disponibles")
def get_lines():
    """Devuelve las líneas que se pueden leer (sin la lectura final)."""
    return [
        {"id": l["id"], "name": l["name"], "description": l["description"]} 
        for l in PALM_DATA["lines"]
    ]

@router.get("/read/{line_id}", response_model=PalmReading, summary="Leer una línea específica")
def read_palm_line(line_id: str = Path(..., description="ID de la línea: heart, head, life, fate")):
    """
    Simula la lectura de una línea específica devolviendo una interpretación aleatoria.
    """
    line_info = next((l for l in PALM_DATA["lines"] if l["id"] == line_id), None)
    
    if not line_info:
        raise HTTPException(404, "Línea no encontrada en el mapa de la mano.")
    
    # Selección aleatoria de la lectura (Simulación Mística)
    reading_text = random.choice(line_info["readings"])
    
    return PalmReading(
        line_id=line_info["id"],
        line_name=line_info["name"],
        description=line_info["description"],
        reading=reading_text
    )