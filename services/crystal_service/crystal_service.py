# services/crystal_service/crystal_service.py

import json, os, random
from fastapi import APIRouter, HTTPException, Query

BASE = os.path.dirname(__file__)
MSG_PATH = os.path.join(BASE, "messages.json")

router = APIRouter(prefix="/crystal", tags=["Bola de Cristal"])

with open(MSG_PATH, encoding="utf-8") as f:
    data = json.load(f)
GENERIC = data["generic"]
TEMPLATES = data["topic_templates"]
ALLOWED = set(data["allowed_topics"])

@router.get("/message", summary="Mensaje de la Bola de Cristal (opcional tema)")
def get_crystal_message(
    topic: str = Query(
        None,
        description="Tema opcional (‘amor’, ‘salud’, ‘dinero’, ‘trabajo’)"
    )
):
    # Sin tema o tema no reconocido → frase genérica
    if not topic or topic.lower() not in ALLOWED:
        return {"message": random.choice(GENERIC)}

    # Con tema válido → usar plantilla
    template = random.choice(TEMPLATES)
    msg = template.format(topic=topic.lower())
    return {"message": msg}