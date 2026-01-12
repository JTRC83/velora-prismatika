import os
import json
import random

# Definimos las rutas relativas a este archivo
BASE_DIR = os.path.dirname(__file__)
PROMPTS_PATH = os.path.join(BASE_DIR, "prompts", "core_identity.txt")
LENSES_PATH = os.path.join(BASE_DIR, "data", "wisdom_lenses.json")

# 1. Cargar la Identidad (System Prompt)
def get_velora_voice():
    """Lee el archivo core_identity.txt para inyectarlo en LLMs futuros."""
    try:
        with open(PROMPTS_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "ERROR: La consciencia de Velora no se encuentra (core_identity.txt missing)."

# 2. Cargar las Lentes (Frases Predefinidas)
def load_lenses_data():
    """Carga el JSON maestro de sabiduría en memoria de forma segura."""
    if not os.path.exists(LENSES_PATH):
        print(f"⚠️ [Velora] Archivo no encontrado: {LENSES_PATH}")
        return {}

    try:
        with open(LENSES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"❌ [Velora Error] El archivo {LENSES_PATH} está vacío o mal formado.")
        return {} # Retorna vacío para no romper el servidor
    except Exception as e:
        print(f"❌ [Velora Error] Error desconocido cargando lentes: {e}")
        return {}

# Cargamos los datos una sola vez al iniciar
_WISDOM_CACHE = load_lenses_data()

def get_velora_reflection(lens_id="hermetic_base"):
    """
    Devuelve una frase aleatoria basada en la 'lente' solicitada.
    """
    # Si la caché está vacía, intentamos recargar (útil si arreglas el archivo sin reiniciar)
    data = _WISDOM_CACHE if _WISDOM_CACHE else load_lenses_data()
    
    # Busca la lente, si no existe usa 'hermetic_base'
    lens = data.get(lens_id, data.get("hermetic_base"))
    
    if lens and "quotes" in lens and len(lens["quotes"]) > 0:
        return random.choice(lens["quotes"])
    
    return "Como es arriba, es abajo. (Sistema de respaldo activo)"