# numerology_service/numerology_service.py

import json
import os
from datetime import date
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/numerology")
MEANINGS_PATH = os.path.join(os.path.dirname(__file__), "meanings.json")

# meanings.json:
# {
#   "1": "Líder, independiente, pionero.",
#   "2": "Cooperación, sensibilidad, armonía.",
#    … hasta "9": "Sabiduría, humanitarismo, compasión."
# }

with open(MEANINGS_PATH, encoding="utf-8") as f:
    MEANINGS = json.load(f)

def calculate_life_path(birthdate: str) -> int:
    # Asegura formato YYYY-MM-DD
    try:
        parts = birthdate.split("-")
        nums = sum(int(d) for part in parts for d in part)
    except ValueError:
        raise HTTPException(400, "Fecha debe ser YYYY-MM-DD")
    # Reducir a un solo dígito
    while nums > 9:
        nums = sum(int(d) for d in str(nums))
    return nums

@router.get("/life-path")
def get_life_path(birthdate: str):
    num = calculate_life_path(birthdate)
    meaning = MEANINGS.get(str(num), "No disponible.")
    return {
        "birthdate": birthdate,
        "life_path": num,
        "meaning": meaning
    }