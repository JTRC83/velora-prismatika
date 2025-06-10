import json, os, random
from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel

BASE = os.path.dirname(__file__)
SEPH_PATH = os.path.join(BASE, "sephiroth.json")

router = APIRouter(prefix="/kabbalah", tags=["Cábala"])

with open(SEPH_PATH, encoding="utf-8") as f:
    SEPHIROTH = json.load(f)

# Modelos Pydantic
class Sephira(BaseModel):
    id: int
    name: str
    path: str
    color: str
    hex: str
    planet: str
    virtue: str
    meaning: str
    mantra: str
    angel: str
    meditation: str
    keywords: list[str]

class MiniSephira(BaseModel):
    id: int
    name: str
    meaning: str
    advice: str

@router.get(
    "/",
    response_model=list[Sephira],
    summary="Lista las 10 Sephiroth con atributos extendidos"
)
def list_sephiroth():
    """
    Devuelve la lista completa de Sephiroth enriquecida.
    """
    return SEPHIROTH

@router.get(
    "/{sephira_id}",
    response_model=Sephira,
    summary="Detalle de una Sephirá concreta"
)
def get_sephira(
    sephira_id: int = Path(..., ge=1, le=10, description="ID de Sephirá (1–10)")
):
    """
    Retorna toda la información de la Sephirá indicada.
    """
    entry = next((s for s in SEPHIROTH if s["id"] == sephira_id), None)
    if not entry:
        raise HTTPException(404, f"Sephirá {sephira_id} no encontrada.")
    return entry

@router.get(
    "/random",
    response_model=MiniSephira,
    summary="Mini-lectura aleatoria de una Sephirá"
)
def random_sephira():
    """
    Elige al azar una Sephirá y devuelve un consejo breve.
    """
    entry = random.choice(SEPHIROTH)
    advice = (
        f"Medita en {entry['name']} "
        f"para experimentar su virtud de {entry['virtue'].lower()}."
    )
    return MiniSephira(
        id=entry["id"],
        name=entry["name"],
        meaning=entry["meaning"],
        advice=advice
    )