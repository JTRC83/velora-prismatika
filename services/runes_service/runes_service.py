# services/runes_service/runes_service.py

import json, os, random
from fastapi import APIRouter, HTTPException

BASE = os.path.dirname(__file__)
RUNES_PATH = os.path.join(BASE, "runes.json")

router = APIRouter(prefix="/runes", tags=["Runas"])

# Carga una sola vez
with open(RUNES_PATH, encoding="utf-8") as f:
    RUNES = json.load(f)

@router.get("/draw", summary="Tira un número de runas aleatorias")
def draw_runes(count: int = 3):
    """
    Extrae `count` runas al azar (sin repetición).
    Parámetros:
      - count: cuántas runas quieres (default=3)
    Respuesta:
      {
        "runes": [
          { "id": "...", "name":"...", "meaning":"..." },
          …
        ]
      }
    """
    if count < 1 or count > len(RUNES):
        raise HTTPException(400, f"count debe estar entre 1 y {len(RUNES)}")
    selection = random.sample(RUNES, count)
    return {"runes": selection}