import json
import os
from datetime import date
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/numerology", tags=["Numerología"])

# Ruta dinámica para el JSON
MEANINGS_PATH = os.path.join(os.path.dirname(__file__), "meanings.json")

def load_meanings():
    try:
        with open(MEANINGS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

MEANINGS = load_meanings()

def mistic_reduction(number: int) -> int:
    """Reduce un número a un solo dígito (1-9) respetando los Maestros (11, 22)."""
    while number > 9 and number not in [11, 22]:
        number = sum(int(d) for d in str(number))
    return number

def name_to_number(name: str) -> int:
    """Convierte un nombre a su vibración numérica (Gematría Pitagórica)."""
    alphabet_map = {
        'a': 1, 'j': 1, 's': 1, 'b': 2, 'k': 2, 't': 2, 'c': 3, 'l': 3, 'u': 3,
        'd': 4, 'm': 4, 'v': 4, 'e': 5, 'n': 5, 'w': 5, 'f': 6, 'o': 6, 'x': 6,
        'g': 7, 'p': 7, 'y': 7, 'h': 8, 'q': 8, 'z': 8, 'i': 9, 'r': 9
    }
    total = sum(alphabet_map.get(char.lower(), 0) for char in name if char.isalpha())
    return mistic_reduction(total)



@router.get("/life-path")
def get_life_path(
    birthdate: date = Query(..., description="Fecha de nacimiento YYYY-MM-DD"),
    name: str = Query(None, description="Nombre completo para calcular el Destino")
):
    # 1. Sendero de Vida (Birthdate)
    life_path_num = mistic_reduction(sum(int(d) for d in birthdate.strftime("%Y%m%d")))
    life_path_data = MEANINGS.get(str(life_path_num))

    # 2. Año Personal (Vibración del año actual 2024 = 8, 2025 = 9)
    current_year = date.today().year
    year_vibration = mistic_reduction(current_year)
    personal_year_num = mistic_reduction(life_path_num + year_vibration)
    
    # 3. Número de Destino (Si proporciona nombre)
    destiny_data = None
    if name:
        destiny_num = name_to_number(name)
        destiny_data = {
            "valor": destiny_num,
            "arquetipo": MEANINGS.get(str(destiny_num), {}).get("titulo")
        }

    if not life_path_data:
        raise HTTPException(status_code=404, detail="La frecuencia no pudo ser sintonizada.")

    return {
        "usuario": name or "Buscador",
        "sendero_de_vida": {
            "numero": life_path_num,
            "revelacion": life_path_data
        },
        "vibracion_temporal": {
            "año_actual": current_year,
            "numero_personal": personal_year_num,
            "mensaje": f"En este ciclo solar, tu energía resuena con el {personal_year_num}."
        },
        "destino": destiny_data,
        "voz_de_velora": "Los números son las cuerdas de un arpa cósmica. Escucha tu melodía."
    }