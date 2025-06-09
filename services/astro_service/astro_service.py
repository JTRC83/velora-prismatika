from pathlib import Path
from datetime import date
from functools import lru_cache
from typing import List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

# ——— Definición de modelos Pydantic ———
class SunSign(BaseModel):
    sign: str
    start_month: int
    start_day:   int
    end_month:   int
    end_day:     int
    element:     str
    quality:     str
    desc:        str
    ruling_planet: str

class SunSignResponse(BaseModel):
    birthdate:    date
    sun_sign:     str
    element:      str
    quality:      str
    description:  str
    ruling_planet: str

# ——— Router y carga de datos ———
router = APIRouter(prefix="/astro", tags=["Astrología"])

@lru_cache()
def load_signs() -> List[SunSign]:
    path = Path(__file__).parent / "sun_signs.json"
    raw = path.read_text(encoding="utf-8")
    entries = BaseModel.parse_raw(f'[{raw}]')  # pierde comas exteriores si las hay
    # En su lugar, parseamos manualmente:
    import json
    data = json.loads(path.read_text(encoding="utf-8"))
    # Convertimos cada dict en SunSign
    return [SunSign(
        sign=e["sign"],
        start_month=int(e["start"].split("-")[0]),
        start_day=  int(e["start"].split("-")[1]),
        end_month=  int(e["end"].split("-")[0]),
        end_day=    int(e["end"].split("-")[1]),
        element=e["element"],
        quality=e["quality"],
        desc=e["desc"],
        ruling_planet=e["ruling_planet"]
    ) for e in data]

# ——— Lógica refinada de búsqueda ———
def get_sun_sign_entry(month: int, day: int) -> SunSign:
    today_ordinal = date(2000, month, day).timetuple().tm_yday
    for e in load_signs():
        start_ordinal = date(2000, e.start_month, e.start_day).timetuple().tm_yday
        end_ordinal   = date(2000, e.end_month,   e.end_day).timetuple().tm_yday
        # rango normal o cruza fin de año
        if start_ordinal <= end_ordinal:
            in_range = start_ordinal <= today_ordinal <= end_ordinal
        else:
            in_range = today_ordinal >= start_ordinal or today_ordinal <= end_ordinal
        if in_range:
            return e
    # nunca debería pasar
    raise HTTPException(500, "Error interno: signo no encontrado.")

# ——— Endpoint con validación automática de fecha ———
@router.get(
    "/sun-sign",
    response_model=SunSignResponse,
    summary="Calcula tu signo solar a partir de tu fecha de nacimiento"
)
def sun_sign(
    birthdate: date = Query(
        ...,
        description="Fecha de nacimiento en formato YYYY-MM-DD"
    )
):
    """
    Devuelve el signo solar, elemento, modalidad, descripción y planeta regente.
    """
    entry = get_sun_sign_entry(birthdate.month, birthdate.day)
    return SunSignResponse(
        birthdate=birthdate,
        sun_sign=entry.sign,
        element=entry.element,
        quality=entry.quality,
        description=entry.desc,
        ruling_planet=entry.ruling_planet
    )