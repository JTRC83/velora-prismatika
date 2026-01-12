import json
import os
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

# Importamos herramientas centrales
from orchestrator.utils import get_velora_reflection
from services.astro_service.astro_service import load_signs, get_sun_sign_entry

# Definimos la ruta y DEPURAMOS
BASE = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE, "compatibility.json")

print(f"\n🔍 [Velora Diagnóstico] Iniciando servicio de Compatibilidad...")
print(f"📂 [Velora Diagnóstico] Buscando archivo de datos en: {DATA_PATH}")

router = APIRouter(prefix="/compatibility", tags=["Compatibilidad"])

def load_compat_rules():
    """Carga las reglas con mensajes de error explícitos para depuración."""
    if not os.path.exists(DATA_PATH):
        print(f"❌ [Velora ERROR] ¡El archivo NO EXISTE! Asegúrate de que compatibility.json esté en la carpeta {BASE}")
        return {}
    
    try:
        with open(DATA_PATH, encoding="utf-8") as f:
            data = json.load(f)
            # Verificamos si tiene la estructura nueva
            if "scores" not in data:
                print("⚠️ [Velora ALERTA] El JSON existe pero TIENE LA ESTRUCTURA ANTIGUA (falta clave 'scores').")
                print("   -> Solución: Copia el contenido JSON nuevo que te pasé.")
                return {}
            
            print("✅ [Velora ÉXITO] Datos de compatibilidad cargados correctamente.")
            return data
            
    except json.JSONDecodeError as e:
        print(f"❌ [Velora ERROR] El JSON está mal escrito (error de sintaxis): {e}")
        return {}
    except Exception as e:
        print(f"❌ [Velora ERROR] Error desconocido leyendo archivo: {e}")
        return {}

# Cargamos los datos al iniciar (verás el resultado en la terminal)
COMPAT_DATA = load_compat_rules()

# --- Modelo de Respuesta ---
class CompatibilityResponse(BaseModel):
    sign1_name: str
    sign1_element: str
    sign2_name: str
    sign2_element: str
    score: int
    alchemy_title: str
    alchemy_text: str
    velora_message: str

def get_sign_data(query_val: str):
    # 1. Si es fecha
    if "-" in query_val and query_val.count("-") == 2:
        try:
            y, m, d = map(int, query_val.split("-"))
            return get_sun_sign_entry(m, d)
        except Exception:
            raise HTTPException(400, "Formato de fecha inválido. Usa YYYY-MM-DD")
    
    # 2. Si es nombre
    all_signs = load_signs()
    found = next((s for s in all_signs if s.sign.lower() == query_val.lower()), None)
    if found:
        return found
        
    raise HTTPException(404, f"El signo '{query_val}' no existe en el zodiaco.")

def calculate_alchemy(s1, s2):
    # Limpiamos los strings (ej: "Fuego, ..." -> "Fuego")
    # Tomamos la primera palabra o lo que haya antes de una coma/dos puntos
    e1 = s1.element.split(',')[0].strip()
    e2 = s2.element.split(',')[0].strip()
    # Manejo robusto de puntuación (. o :)
    q1 = s1.quality.replace('.', ':').split(':')[0].strip().split()[0]
    q2 = s2.quality.replace('.', ':').split(':')[0].strip().split()[0]

    scores = COMPAT_DATA.get("scores", {})
    
    # Si scores está vacío, devolvemos 50
    if not scores:
        return 50, "Datos No Disponibles", "No se pudo leer la base de datos de compatibilidad."

    base_score = scores.get(e1, {}).get(e2) or scores.get(e2, {}).get(e1, 50)

    q_key = "-".join(sorted([q1, q2]))
    bonus = COMPAT_DATA.get("quality_bonus", {}).get(q_key, 0)

    total_score = min(100, max(0, base_score + bonus))

    # Alchemy Text: Probamos ambas combinaciones (Fuego-Aire y Aire-Fuego)
    # porque el orden en el JSON puede variar
    alchemy_dict = COMPAT_DATA.get("alchemy_text", {})
    
    key_forward = f"{e1}-{e2}"
    key_reverse = f"{e2}-{e1}"
    
    alchemy_desc = alchemy_dict.get(key_forward) or alchemy_dict.get(key_reverse, "Una mezcla misteriosa de energías.")
    
    # Para el título, usamos el orden visualmente agradable (o el que encontramos)
    e_key = key_forward if alchemy_dict.get(key_forward) else key_reverse

    return total_score, e_key, alchemy_desc

@router.get("/check", response_model=CompatibilityResponse)
def check_compatibility(
    sign1: str = Query(..., description="Nombre o Fecha"),
    sign2: str = Query(..., description="Nombre o Fecha")
):
    s1 = get_sign_data(sign1)
    s2 = get_sign_data(sign2)
    
    score, alchemy_key, alchemy_text = calculate_alchemy(s1, s2)
    velora_msg = get_velora_reflection("zodiac_affinity")

    return CompatibilityResponse(
        sign1_name=s1.sign,
        sign1_element=s1.element,
        sign2_name=s2.sign,
        sign2_element=s2.element,
        score=score,
        alchemy_title=f"Unión {alchemy_key.replace('-', ' y ')}",
        alchemy_text=alchemy_text,
        velora_message=velora_msg
    )