# services/runes_service/runes_service.py

import json
import os
import random
from fastapi import APIRouter, HTTPException

BASE = os.path.dirname(__file__)
RUNES_PATH = os.path.join(BASE, "runes.json")

router = APIRouter(prefix="/runes", tags=["Runas"])

# Cargamos las runas al iniciar
try:
    with open(RUNES_PATH, encoding="utf-8") as f:
        RUNES = json.load(f)
except FileNotFoundError:
    # Fallback por seguridad si no encuentra el archivo al iniciar
    RUNES = []
    print(f"ADVERTENCIA: No se encontró {RUNES_PATH}")

@router.get("/draw", summary="Consulta el oráculo de las runas")
def draw_runes(count: int = 3):
    """
    Extrae `count` runas al azar con su respectiva orientación.
    
    Parámetros:
      - count: número de runas (1 = Consejo, 3 = Nornas, 5 = Cruz Rúnica). Default 3.
    
    Retorna:
      Lista de runas con su estado (invertida o no) y el significado correspondiente ya filtrado.
    """
    if not RUNES:
        raise HTTPException(500, "La base de datos de runas no está disponible.")
    
    if count < 1 or count > len(RUNES):
        raise HTTPException(400, f"El número de runas debe estar entre 1 y {len(RUNES)}")

    # 1. Selección aleatoria de las runas (sin repetir)
    selected_raw = random.sample(RUNES, count)
    
    result = []
    
    for rune in selected_raw:
        # 2. Determinar si sale invertida (probabilidad del 30-40% aprox es realista)
        is_inverted = random.choice([True, False])
        
        # 3. Lógica de interpretación
        # Si la runa es simétrica, visualmente no se invierte, pero energéticamente puede estar bloqueada.
        # Aquí decidimos si usar el texto 'reversed' o el normal.
        
        interpretation_text = rune["meaning"]
        
        # Si sale invertida Y tiene un significado inverso definido:
        if is_inverted and rune.get("reversed"):
            interpretation_text = rune["reversed"]
        
        result.append({
            "id": rune["id"],
            "name": rune["name"],
            "symbol": rune["symbol"],
            "keywords": rune["keywords"],
            "symmetrical": rune.get("symmetrical", False), # Importante para el frontend
            
            # Estado de la tirada
            "is_inverted": is_inverted,
            
            # El texto exacto que Velora debe 'decir' o mostrar
            "interpretation": interpretation_text,
            
            # Data cruda por si el frontend quiere mostrar ambos lados
            "meaning_upright": rune["meaning"],
            "meaning_reversed": rune.get("reversed", "")
        })

    return {
        "count": count,
        "runes": result
    }