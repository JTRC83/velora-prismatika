import os
import json
import random
import logging

# Configuración de logs
logger = logging.getLogger("Velora-Utils")

# Rutas dinámicas (funciona en Mac, Linux y Windows)
BASE_DIR = os.path.dirname(__file__)
LENSES_PATH = os.path.join(BASE_DIR, "data", "wisdom_lenses.json")

# 1. FRASES DE EMERGENCIA (Hardcoded)
# Si el archivo JSON falla o no existe, Velora usará esto para no quedarse muda.
BACKUP_QUOTES = [
    "Como es arriba, es abajo; como es adentro, es afuera.",
    "El silencio es el lenguaje de los dioses; todo lo demás es una pobre traducción.",
    "No busques fuera lo que yace oculto en tu propio centro.",
    "Los astros inclinan, pero no obligan.",
    "En la oscuridad del misterio, la intención es tu única lámpara.",
    "El azar no existe; solo es un patrón que aún no comprendes."
]

def load_lenses_data():
    """
    Carga el JSON maestro de sabiduría en memoria.
    Si falla, retorna None para usar el backup.
    """
    if not os.path.exists(LENSES_PATH):
        logger.warning(f"⚠️ [Utils] No se encuentra wisdom_lenses.json en {LENSES_PATH}")
        return None

    try:
        with open(LENSES_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except json.JSONDecodeError:
        logger.error(f"❌ [Utils] wisdom_lenses.json está corrupto.")
        return None
    except Exception as e:
        logger.error(f"❌ [Utils] Error cargando lentes: {e}")
        return None

# Cargamos los datos una sola vez al iniciar la app (Caché en memoria)
_WISDOM_CACHE = load_lenses_data()

def get_velora_reflection(lens_id="default"):
    """
    Devuelve una frase aleatoria.
    Prioridad:
    1. Archivo JSON (wisdom_lenses.json) si existe y tiene la categoría.
    2. Archivo JSON categoría 'hermetic_base' (fallback interno del JSON).
    3. Lista BACKUP_QUOTES en código (si falla el archivo).
    """
    # Intentar recargar si la caché falló al inicio (reintento lazy)
    global _WISDOM_CACHE
    if _WISDOM_CACHE is None:
        _WISDOM_CACHE = load_lenses_data()

    # Si logramos cargar el JSON
    if _WISDOM_CACHE:
        # Buscamos la categoría específica (ej: 'tarot', 'astro')
        lens_data = _WISDOM_CACHE.get(lens_id)
        
        # Si no existe esa categoría, buscamos una genérica
        if not lens_data:
            lens_data = _WISDOM_CACHE.get("hermetic_base") or _WISDOM_CACHE.get("default")

        # Si encontramos datos y hay frases, elegimos una
        if lens_data and "quotes" in lens_data and isinstance(lens_data["quotes"], list):
            if len(lens_data["quotes"]) > 0:
                return random.choice(lens_data["quotes"])

    # SI TODO FALLA (JSON borrado, vacío o error de disco):
    return random.choice(BACKUP_QUOTES)