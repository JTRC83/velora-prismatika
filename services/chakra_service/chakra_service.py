import json
import os
import random
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

# Importamos la voz de Velora
from orchestrator.utils import get_velora_reflection

BASE = os.path.dirname(__file__)
CHAKRAS_PATH = os.path.join(BASE, "chakras.json")

router = APIRouter(prefix="/chakra", tags=["Chakras"])

def load_data():
    if not os.path.exists(CHAKRAS_PATH):
        return []
    with open(CHAKRAS_PATH, encoding="utf-8") as f:
        return json.load(f)

CHAKRAS = load_data()

# Modelo de respuesta para que la documentación sea clara
class ChakraDetail(BaseModel):
    id: int
    name: str
    sanskrit: str
    symbol: str
    element: str
    location: str
    color: str
    hex: str
    mantra: str
    frequency: int
    crystals: List[str]
    imbalance: List[str]
    advice: str
    visualization: str
    velora_message: str

@router.get("/", summary="Lista todos los chakras")
def list_chakras():
    return CHAKRAS

@router.get("/diagnose", summary="Encuentra tu bloqueo por síntoma")
def diagnose_imbalance(symptom: str = Query(..., description="Ej: miedo, ansiedad, creatividad")):
    """Busca qué chakra maneja ese síntoma."""
    symptom = symptom.lower()
    matches = []
    
    for c in CHAKRAS:
        # Buscamos coincidencias en la lista de desequilibrios
        if any(symptom in i.lower() for i in c["imbalance"]):
            matches.append(c)
    
    if not matches:
        # Si no encuentra nada exacto, devuelve uno aleatorio sugerido
        return {"found": False, "suggestion": random.choice(CHAKRAS)}
        
    return {"found": True, "matches": matches}

@router.get("/{chakra_id}", response_model=ChakraDetail)
def get_chakra_details(chakra_id: int):
    entry = next((c for c in CHAKRAS if c["id"] == chakra_id), None)
    if not entry:
        raise HTTPException(404, "Chakra no encontrado (1–7)")
    
    # Inyectamos mensaje de Velora (Estilo Paracelso/Elemental)
    entry["velora_message"] = get_velora_reflection("elemental_balance")
    return entry