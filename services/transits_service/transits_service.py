import os, json
import ephem
import math
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

BASE = os.path.dirname(__file__)
BODIES_PATH = os.path.join(BASE, "bodies.json")

router = APIRouter(prefix="/transits", tags=["Tránsitos Planetarios"])

# Cargar lista de cuerpos
with open(BODIES_PATH, encoding="utf-8") as f:
    BODIES = json.load(f)

# Aspectos mayores y su ángulo en grados
ASPECTS = {
    0:   "Conjunción",
    60:  "Sextil",
    90:  "Cuadratura",
    120: "Trígono",
    180: "Oposición"
}
ORB = 5.0  # tolerancia en grados

class BodyPosition(BaseModel):
    body: str
    longitude: float = Field(..., description="Longitud eclíptica en grados")

class Aspect(BaseModel):
    body1: str
    body2: str
    aspect: str
    exact_angle: float = Field(..., description="Ángulo exacto observado")

class TransitResponse(BaseModel):
    date: datetime
    positions: list[BodyPosition]
    aspects: list[Aspect]

@router.get("/", response_model=TransitResponse, summary="Calcula tránsitos para una fecha")
def get_transits(
    date: str = Query(..., description="Fecha en formato YYYY-MM-DD"),
):
    # Parsear fecha
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(400, "Fecha inválida, use YYYY-MM-DD")
    eph_date = ephem.Date(dt)

    # Calcular posiciones
    positions = []
    for entry in BODIES:
        body_cls = getattr(ephem, entry["id"])
        obj = body_cls(eph_date)
        # convertir a eclípticas
        ecl = ephem.Ecliptic(obj)
        lon = math.degrees(ecl.lon) % 360
        positions.append(BodyPosition(body=entry["name"], longitude=round(lon,2)))

    # Detectar aspectos
    aspects = []
    n = len(positions)
    for i in range(n):
        for j in range(i+1, n):
            lon1 = positions[i].longitude
            lon2 = positions[j].longitude
            diff = abs((lon2 - lon1 + 180) % 360 - 180)
            for angle, name in ASPECTS.items():
                if abs(diff - angle) <= ORB:
                    aspects.append(Aspect(
                        body1=positions[i].body,
                        body2=positions[j].body,
                        aspect=name,
                        exact_angle=round(diff,2)
                    ))
                    break

    return TransitResponse(date=dt, positions=positions, aspects=aspects)