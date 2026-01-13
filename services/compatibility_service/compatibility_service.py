import json
import os
import math
import ephem  # 👈 Librería astronómica nueva
import random
from datetime import datetime
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

# --- Utiles Astronómicos (NUEVO) ---
ZODIAC_SIGNS = [
    "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", 
    "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
]

def get_planet_sign(planet_obj, date_now):
    """Calcula en qué signo está un planeta hoy."""
    observer = ephem.Observer()
    observer.date = date_now
    planet_obj.compute(observer)
    degrees = math.degrees(planet_obj.hlon)
    sign_index = int(degrees / 30)
    return ZODIAC_SIGNS[sign_index % 12]

# --- Carga de Datos ---
def load_compat_rules():
    """Carga las reglas con mensajes de error explícitos para depuración."""
    if not os.path.exists(DATA_PATH):
        print(f"❌ [Velora ERROR] ¡El archivo NO EXISTE! Asegúrate de que compatibility.json esté en la carpeta {BASE}")
        return {}
    
    try:
        with open(DATA_PATH, encoding="utf-8") as f:
            data = json.load(f)
            if "scores" not in data:
                print("⚠️ [Velora ALERTA] El JSON existe pero TIENE LA ESTRUCTURA ANTIGUA.")
                return {}
            print("✅ [Velora ÉXITO] Datos de compatibilidad cargados correctamente.")
            return data
            
    except json.JSONDecodeError as e:
        print(f"❌ [Velora ERROR] El JSON está mal escrito (error de sintaxis): {e}")
        return {}
    except Exception as e:
        print(f"❌ [Velora ERROR] Error desconocido leyendo archivo: {e}")
        return {}

COMPAT_DATA = load_compat_rules()

# --- Modelo de Respuesta (ACTUALIZADO) ---
class CompatibilityResponse(BaseModel):
    sign1_name: str
    sign1_element: str
    sign2_name: str
    sign2_element: str
    base_score: int       # Puntuación estática (lo que ya tenías)
    transit_bonus: int    # Puntuación dinámica (NUEVO)
    total_score: int      # Suma final (NUEVO)
    alchemy_title: str
    alchemy_text: str
    transit_message: str  # Explicación del clima (NUEVO)
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
    """Calcula la base estática respetando tu limpieza de strings."""
    # Limpiamos los strings (TU LÓGICA ORIGINAL)
    e1 = s1.element.split(',')[0].strip()
    e2 = s2.element.split(',')[0].strip()
    # Manejo robusto de puntuación
    q1 = s1.quality.replace('.', ':').split(':')[0].strip().split()[0]
    q2 = s2.quality.replace('.', ':').split(':')[0].strip().split()[0]

    scores = COMPAT_DATA.get("scores", {})
    
    if not scores:
        return 50, "Datos No Disponibles", "No se pudo leer la base de datos."

    # Intentamos buscar e1->e2, si no e2->e1
    base_score = scores.get(e1, {}).get(e2) or scores.get(e2, {}).get(e1, 50)

    q_key = "-".join(sorted([q1, q2]))
    bonus = COMPAT_DATA.get("quality_bonus", {}).get(q_key, 0)

    total_base = min(100, max(0, base_score + bonus))

    # Alchemy Text: AHORA ELEGIMOS UNO AL AZAR DE LA LISTA
    alchemy_dict = COMPAT_DATA.get("alchemy_text", {})
    
    key_forward = f"{e1}-{e2}"
    key_reverse = f"{e2}-{e1}"
    
    # Obtenemos la LISTA de frases (o una lista vacía si no hay)
    options = alchemy_dict.get(key_forward) or alchemy_dict.get(key_reverse, ["Una mezcla misteriosa de energías."])
    
    # Elegimos una frase aleatoria
    alchemy_desc = random.choice(options) # <--- 2. CAMBIO CLAVE
    
    # Para el título... (igual que antes)
    e_key = key_forward if alchemy_dict.get(key_forward) else key_reverse

    return total_base, e_key, alchemy_desc

def calculate_dynamic_transits(s1_name, s2_name):
    """
    (NUEVO) Calcula cómo afectan los planetas HOY a la relación.
    """
    now = datetime.now()
    
    # 1. Posiciones actuales
    try:
        venus_sign = get_planet_sign(ephem.Venus(), now)
        mars_sign = get_planet_sign(ephem.Mars(), now)
        sun_sign = get_planet_sign(ephem.Sun(), now)
    except Exception as e:
        print(f"Error calculando tránsitos: {e}")
        return 0, "Cielo nublado (error de cálculo)."
    
    bonus = 0
    msgs = []

    # 2. Reglas de Venus (Amor)
    if venus_sign in [s1_name, s2_name]:
        bonus += 15
        msgs.append(f"Venus transita por {venus_sign}, regalando magnetismo especial.")
    
    # 3. Reglas de Marte (Pasión)
    if mars_sign in [s1_name, s2_name]:
        bonus += 5
        msgs.append(f"Marte en {mars_sign} intensifica la pasión.")
        
    # 4. Reglas del Sol (Temporada)
    if sun_sign == s1_name or sun_sign == s2_name:
        bonus += 10
        msgs.append(f"Es la temporada de {sun_sign}, vuestra energía brilla.")

    if bonus == 0:
        msgs.append("El cielo está tranquilo; la afinidad depende solo de vosotros.")

    return bonus, " ".join(msgs)

@router.get("/check", response_model=CompatibilityResponse)
def check_compatibility(
    sign1: str = Query(..., description="Nombre o Fecha"),
    sign2: str = Query(..., description="Nombre o Fecha")
):
    # 1. Resolver signos
    s1 = get_sign_data(sign1)
    s2 = get_sign_data(sign2)
    
    # 2. Cálculo Base (Estático - Tu lógica)
    base_score, alchemy_key, alchemy_text = calculate_alchemy(s1, s2)
    
    # 3. Cálculo Dinámico (NUEVO - Tránsitos hoy)
    transit_bonus, transit_msg = calculate_dynamic_transits(s1.sign, s2.sign)

    # 4. Total (Tope 100%)
    total = min(100, max(0, base_score + transit_bonus))

    # 5. Mensaje Velora
    velora_msg = get_velora_reflection("zodiac_affinity")

    return CompatibilityResponse(
        sign1_name=s1.sign,
        sign1_element=s1.element,
        sign2_name=s2.sign,
        sign2_element=s2.element,
        base_score=base_score,
        transit_bonus=transit_bonus,
        total_score=total,
        alchemy_title=f"Unión {alchemy_key.replace('-', ' y ')}",
        alchemy_text=alchemy_text,
        transit_message=transit_msg,
        velora_message=velora_msg
    )