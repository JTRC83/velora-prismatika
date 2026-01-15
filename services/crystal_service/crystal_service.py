import json
import os
import random
import re
from fastapi import APIRouter, Query
from pydantic import BaseModel

BASE = os.path.dirname(__file__)
MSG_PATH = os.path.join(BASE, "messages.json")

router = APIRouter(prefix="/crystal", tags=["Bola de Cristal"])

# Cargar datos al iniciar
try:
    with open(MSG_PATH, encoding="utf-8") as f:
        DATA = json.load(f)
        TOPICS = DATA.get("topics", {})
except FileNotFoundError:
    DATA = {}
    TOPICS = {}
    print("Error: messages.json no encontrado.")

# Modelo de respuesta
class CrystalResponse(BaseModel):
    category: str
    message: str
    is_clarity_high: bool # Para efectos visuales (niebla vs claridad)

def detect_topic(text: str):
    """
    Busca palabras clave en el texto para asignar un tema automático.
    Retorna la clave del tema (ej: 'love') o None.
    """
    text = text.lower()
    for topic_key, content in TOPICS.items():
        if topic_key in ["general", "yes_no"]: continue
        
        keywords = content.get("keywords", [])
        for kw in keywords:
            # Búsqueda simple de palabra completa o parcial
            if kw in text:
                return topic_key
    return None

@router.get("/gaze", response_model=CrystalResponse, summary="Consulta a la Bola de Cristal")
def gaze_crystal(
    focus: str = Query(None, description="Tema explícito: love, work, health, yes_no"),
    question: str = Query(None, description="Pregunta libre del usuario")
):
    """
    La Bola decide qué responder basándose en el 'focus' seleccionado
    o analizando la 'question' escrita.
    """
    
    selected_topic = "general"
    
    # 1. Prioridad: Foco explícito seleccionado por el usuario
    if focus and focus in TOPICS:
        selected_topic = focus
        
    # 2. Si no hay foco, intentamos detectar tema en la pregunta
    elif question:
        detected = detect_topic(question)
        if detected:
            selected_topic = detected
        else:
            # Si hay pregunta pero no detectamos tema, ¿es una pregunta de Sí/No?
            # Asumimos que preguntas cortas o sin keywords son para yes_no
            selected_topic = "yes_no"
    
    # 3. Obtener mensajes del tema seleccionado
    topic_data = TOPICS.get(selected_topic, TOPICS["general"])
    messages = topic_data.get("messages", [])
    
    if not messages:
        # Fallback de seguridad
        final_message = "La niebla es demasiado densa... intenta de nuevo."
    else:
        final_message = random.choice(messages)
    
    # Factor de 'claridad': Para el frontend, si es 'yes_no' o 'general', 
    # la visión puede ser más borrosa o más clara.
    # Simulamos aleatoriedad visual.
    clarity = random.choice([True, True, False]) if selected_topic != "yes_no" else True

    return CrystalResponse(
        category=selected_topic,
        message=final_message,
        is_clarity_high=clarity
    )