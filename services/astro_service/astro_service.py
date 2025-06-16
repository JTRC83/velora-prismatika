import json
import os
import random
from datetime import date
from functools import lru_cache
from typing import List

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

BASE = os.path.dirname(__file__)
SIGNS_PATH = os.path.join(BASE, "sun_signs.json")
HORO_PATH  = os.path.join(BASE, "horoscope_service", "daily_horoscope.json")

router = APIRouter(prefix="/astro", tags=["Astrología"])

# ——— Modelos Pydantic ———
class SunSign(BaseModel):
    sign:          str
    start_month:   int
    start_day:     int
    end_month:     int
    end_day:       int
    element:       str
    quality:       str
    desc:          str
    ruling_planet: str

class SunSignResponse(BaseModel):
    birthdate:     date
    sun_sign:      str
    element:       str
    quality:       str
    description:   str
    ruling_planet: str

class HoroscopeResponse(BaseModel):
    birthdate: date
    sun_sign:  str
    message:   str

# ——— Carga en memoria (y cache) ———
@lru_cache()
def load_signs() -> List[SunSign]:
    raw = open(SIGNS_PATH, encoding="utf-8").read()
    data = json.loads(raw)
    result = []
    for e in data:
        sm, sd = map(int, e["start"].split("-"))
        em, ed = map(int, e["end"].split("-"))
        result.append(SunSign(
            sign=e["sign"],
            start_month=sm,
            start_day=  sd,
            end_month=  em,
            end_day=    ed,
            element=e["element"],
            quality=e["quality"],
            desc=e["desc"],
            ruling_planet=e["ruling_planet"],
        ))
    return result

# Precargamos plantillas de horóscopo
with open(HORO_PATH, encoding="utf-8") as f:
    DAILY_TEMPLATES = json.load(f)  # dict: sign → [frases]

# ——— Lógica de signo ———
def get_sun_sign_entry(month: int, day: int) -> SunSign:
    ordinal = date(2000, month, day).timetuple().tm_yday
    for e in load_signs():
        start_ord = date(2000, e.start_month, e.start_day).timetuple().tm_yday
        end_ord   = date(2000, e.end_month,   e.end_day).timetuple().tm_yday
        if start_ord <= end_ord:
            in_range = start_ord <= ordinal <= end_ord
        else:
            in_range = ordinal >= start_ord or ordinal <= end_ord
        if in_range:
            return e
    raise HTTPException(500, "Signo no encontrado (error interno).")

# ——— Endpoints ———

@router.get(
    "/sun-sign",
    response_model=SunSignResponse,
    summary="Calcula tu signo solar a partir de tu fecha de nacimiento"
)
def sun_sign(
    birthdate: date = Query(..., description="YYYY-MM-DD")
):
    """
    Devuelve tu signo solar y atributos: elemento, modalidad,
    descripción y planeta regente.
    """
    entry = get_sun_sign_entry(birthdate.month, birthdate.day)
    return SunSignResponse(
        birthdate=birthdate,
        sun_sign=entry.sign,
        element=entry.element,
        quality=entry.quality,
        description=entry.desc,
        ruling_planet=entry.ruling_planet,
    )

@router.get(
    "/horoscope",
    response_model=HoroscopeResponse,
    summary="Horóscopo diario: usa tu fecha de nacimiento para signo + mensaje"
)
def daily_horoscope(
    birthdate: date = Query(..., description="YYYY-MM-DD")
):
    """
    Partimos de la fecha de nacimiento:
    1) calculamos tu signo solar,
    2) seleccionamos aleatoriamente un mensaje para ese signo.
    """
    entry = get_sun_sign_entry(birthdate.month, birthdate.day)
    sign = entry.sign
    # plantillas para el signo
    templates = DAILY_TEMPLATES.get(sign)
    if not templates:
        raise HTTPException(400, f"No hay horóscopo diario para {sign}.")
    message = random.choice(templates)
    return HoroscopeResponse(
        birthdate=birthdate,
        sun_sign=sign,
        message=message
    )