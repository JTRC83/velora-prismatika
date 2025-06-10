# services/horoscope_service/horoscope_service.py

import json, os, random
from fastapi import APIRouter, HTTPException, Query

BASE = os.path.dirname(__file__)
HORO_PATH = os.path.join(BASE, "daily_horoscope.json")

router = APIRouter(prefix="/horoscope", tags=["Horóscopo"])

with open(HORO_PATH, encoding="utf-8") as f:
    HOROS = json.load(f)  # dict: signo → [frases]

@router.get("/daily", summary="Horóscopo diario por signo")
def daily_horoscope(
    sign: str = Query(..., description="Signo solar (p.ej. Aries)")
):
    sign_cap = sign.capitalize()
    templates = HOROS.get(sign_cap)
    if not templates:
        raise HTTPException(400, f"Signo desconocido: {sign}")
    message = random.choice(templates)
    return {
        "sign": sign_cap,
        "message": message
    }