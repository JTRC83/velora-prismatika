import json
import os
import random
from datetime import date
from typing import List, Dict, Optional
from pydantic import BaseModel

# Rutas
BASE = os.path.dirname(__file__)
SIGNS_PATH = os.path.join(BASE, "sun_signs.json")
HORO_PATH = os.path.join(BASE, "horoscopes.json")

class SunSignData(BaseModel):
    sign: str
    element: str
    quality: str
    ruling_planet: str
    desc: List[str]

class AstroService:
    def __init__(self):
        self.signs_cache = self._load_json(SIGNS_PATH)
        self.horo_cache = self._load_json(HORO_PATH)

    def _load_json(self, path) -> List[Dict]:
        if not os.path.exists(path):
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def get_sun_sign_entry(self, birthdate: date) -> Optional[SunSignData]:
        if not self.signs_cache:
             self.signs_cache = self._load_json(SIGNS_PATH)
        
        day = birthdate.day
        month = birthdate.month
        # Usamos año bisiesto 2000 para facilitar cálculos
        ordinal = date(2000, month, day).timetuple().tm_yday

        for e in self.signs_cache:
            sm, sd = map(int, e["start"].split("-"))
            em, ed = map(int, e["end"].split("-"))
            
            start_ord = date(2000, sm, sd).timetuple().tm_yday
            end_ord = date(2000, em, ed).timetuple().tm_yday
            
            if start_ord > end_ord:
                # Caso Capricornio (cruce de año)
                in_range = ordinal >= start_ord or ordinal <= end_ord
            else:
                in_range = start_ord <= ordinal <= end_ord
                
            if in_range:
                return SunSignData(
                    sign=e["sign"],
                    element=e["element"],
                    quality=e["quality"],
                    ruling_planet=e["ruling_planet"],
                    desc=e["desc"]
                )
        return None

    def obtener_horoscopo_base(self, signo: str) -> str:
        """Devuelve una frase predefinida si la IA falla."""
        if not self.horo_cache:
            return "Los astros te invitan a la reflexión silenciosa."
        
        frases = self.horo_cache.get(signo, [])
        if frases:
            return random.choice(frases)
        return "Tu luz interior guía el camino hoy."

    def obtener_transito_actual(self):
        transitos = [
            "Sol en cuadratura con Marte",
            "Luna Llena en tránsito",
            "Mercurio retrógrado",
            "Venus en conjunción con Júpiter",
            "Saturno exigiendo disciplina"
        ]
        return random.choice(transitos)

    def obtener_info_dia(self, fecha: date):
        """
        Calcula el día de la semana y su planeta regente.
        """
        dias_semana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        
        regentes_dia = {
            "Lunes": "La Luna",
            "Martes": "Marte",
            "Miércoles": "Mercurio",
            "Jueves": "Júpiter",
            "Viernes": "Venus",
            "Sábado": "Saturno",
            "Domingo": "El Sol"
        }
        
        # 0=Lunes, 6=Domingo
        nombre_dia = dias_semana[fecha.weekday()]
        regente = regentes_dia.get(nombre_dia, "Desconocido")
        
        return nombre_dia, regente