import json, os, random
from fastapi import APIRouter, HTTPException, Query

BASE = os.path.dirname(__file__)
CHAKRAS_PATH = os.path.join(BASE, "chakras.json")

router = APIRouter(prefix="/chakra", tags=["Chakras"])

with open(CHAKRAS_PATH, encoding="utf-8") as f:
    CHAKRAS = json.load(f)

@router.get("/", summary="Lista los 7 chakras y sus atributos")
def list_chakras():
    return {"chakras": CHAKRAS}

@router.get("/{chakra_id}", summary="Info completa de un chakra")
def get_chakra(chakra_id: int):
    entry = next((c for c in CHAKRAS if c["id"] == chakra_id), None)
    if not entry:
        raise HTTPException(404, "Chakra no encontrado (1–7)")
    return entry

@router.get("/session", summary="Mini-sesión para varios chakras")
def chakra_session(
    ids: str = Query(
        ...,
        regex="^[1-7](,[1-7])*$",
        description="Lista de IDs separados por comas, p.ej. '1,4,7'"
    )
):
    chosen = []
    for part in ids.split(","):
        cid = int(part)
        entry = next((c for c in CHAKRAS if c["id"] == cid), None)
        if entry:
            chosen.append({
                "id": cid,
                "name": entry["name"],
                "mantra": entry["mantra"],
                "pose": entry["yoga_pose"],
                "crystal": entry["crystals"][0] if entry["crystals"] else None
            })
    return {"session": chosen}

@router.get("/advice", summary="Consejo rápido para un chakra")
def chakra_advice(
    chakra_id: int | None = Query(
        None,
        ge=1,
        le=7,
        description="ID de chakra (1–7). Si se omite, se elige uno al azar."
    )
):
    if chakra_id is None:
        entry = random.choice(CHAKRAS)
    else:
        entry = next((c for c in CHAKRAS if c["id"] == chakra_id), None)
        if not entry:
            raise HTTPException(400, "chakra_id debe estar entre 1 y 7")
    return {
        "id": entry["id"],
        "name": entry["name"],
        "advice": entry["advice"]
    }