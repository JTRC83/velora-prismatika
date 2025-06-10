# services/iching_service/iching_service.py

import json, os, random
from fastapi import APIRouter

BASE = os.path.dirname(__file__)
HEX_PATH = os.path.join(BASE, "hexagrams.json")

router = APIRouter(prefix="/iching", tags=["I Ching"])

with open(HEX_PATH, encoding="utf-8") as f:
    HEXAGRAMS = json.load(f)

def toss_coins() -> int:
    """Tira 3 monedas: cara=3, cruz=2 → suma 6–9 devuelve línea."""
    total = sum(random.choice([2,3]) for _ in range(3))
    # 6 o 8 = línea partida (yin), 7 o 9 = línea entera (yang)
    return 0 if total % 2 == 1 else 1  # 1=yang, 0=yin

@router.get("/hexagram", summary="Tira un hexagrama de I Ching de 6 líneas")
def get_hexagram():
    """
    Devuelve:
      - lines: lista de 6 valores (1=yang ⎯ , 0=yin ␣␣)
      - hexagram_number: 1–64
      - name, meaning: del JSON
    """
    # Generar las 6 líneas de abajo a arriba
    lines = [toss_coins() for _ in range(6)]
    # Calcular número de hexagrama: treat lines as bits (yang=1, yin=0), MSB = top line
    num = sum(val << idx for idx, val in enumerate(lines[::-1])) + 1
    entry = next((h for h in HEXAGRAMS if h["id"] == num), None)
    if not entry:
        entry = {"id": num, "name": "Desconocido", "meaning": ""}
    return {
        "lines": lines,
        "hexagram_number": num,
        "name": entry["name"],
        "meaning": entry["meaning"]
    }