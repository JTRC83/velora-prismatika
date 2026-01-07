# numerology_service/numerology_service.py

import json
import os
from datetime import date
from fastapi import APIRouter, HTTPException
from fastapi import Query

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

def calculate_life_path(birthdate: date) -> int:
    digits = birthdate.strftime("%Y%m%d")
    total = sum(int(d) for d in digits)
    while total > 9:
        total = sum(int(d) for d in str(total))
    return total

@router.get("/life-path")
def get_life_path(birthdate: date = Query(...)):
    num = calculate_life_path(birthdate)
    meaning = MEANINGS.get(str(num), "No disponible.")
    return {
        "birthdate": birthdate,
        "life_path": num,
        "meaning": meaning
    }