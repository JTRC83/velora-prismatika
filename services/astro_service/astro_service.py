import json
import os
import random
from datetime import date
from functools import lru_cache
from typing import List

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

# 👇 Importamos el cerebro de Velora
from orchestrator.utils import get_velora_reflection

BASE = os.path.dirname(__file__)
SIGNS_PATH = os.path.join(BASE, "sun_signs.json")
# HORO_PATH ya no es necesario si usamos las lentes de Velora

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
    desc:          List[str]
    ruling_planet: str

class SunSignResponse(BaseModel):
    birthdate:     date
    sun_sign:      str
    element:       str
    quality:       str
    description:   List[str]
    ruling_planet: str

class HoroscopeResponse(BaseModel):
    birthdate: date
    sun_sign:  str
    message:   str

# ——— Carga en memoria (y cache) ———
@lru_cache()
def load_signs() -> List[SunSign]:
    """Carga los datos de los signos solares para calcular cuál eres."""
    if not os.path.exists(SIGNS_PATH):
        print(f"⚠️ Error: No se encuentra {SIGNS_PATH}")
        return []
        
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

# ——— Lógica de signo ———
def get_sun_sign_entry(month: int, day: int) -> SunSign:
    """Busca el signo correspondiente a una fecha."""
    ordinal = date(2000, month, day).timetuple().tm_yday
    signs = load_signs()
    
    if not signs:
        raise HTTPException(500, "Error interno: Base de datos de signos no cargada.")

    for e in signs:
        start_ord = date(2000, e.start_month, e.start_day).timetuple().tm_yday
        end_ord   = date(2000, e.end_month,   e.end_day).timetuple().tm_yday
        
        # Lógica para manejar el cambio de año (Capricornio)
        if start_ord <= end_ord:
            in_range = start_ord <= ordinal <= end_ord
        else:
            in_range = ordinal >= start_ord or ordinal <= end_ord
            
        if in_range:
            return e
            
    raise HTTPException(500, "Signo no encontrado (fecha inválida).")

# ——— Endpoints ———

@router.get("/sun-sign", response_model=SunSignResponse, summary="Calcula tu signo solar")
def sun_sign(birthdate: date = Query(...)):
    """
    Devuelve tu signo solar y atributos.
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

@router.get("/horoscope", response_model=HoroscopeResponse, summary="Horóscopo diario estilo Velora")
def daily_horoscope(birthdate: date = Query(..., description="YYYY-MM-DD")):
    """
    Calcula el signo y devuelve una reflexión basada en la mecánica celeste
    usando la voz unificada de Velora (Lente: astro_mechanic).
    """
    # 1. Calculamos el signo real
    entry = get_sun_sign_entry(birthdate.month, birthdate.day)
    
    # 2. Obtenemos la sabiduría de Velora (Lente 'John Dee' / astro_mechanic)
    mensaje_velora = get_velora_reflection("astro_mechanic")
    
    # 3. Retornamos la respuesta
    return HoroscopeResponse(
        birthdate=birthdate,
        sun_sign=entry.sign,
        message=mensaje_velora
    )