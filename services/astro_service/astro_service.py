import json
import os
import random
import unicodedata
import urllib.parse
import urllib.request
from datetime import date
from typing import List, Dict, Optional
from pydantic import BaseModel

# Rutas
BASE = os.path.dirname(__file__)
SIGNS_PATH = os.path.join(BASE, "sun_signs.json")
HORO_PATH = os.path.join(BASE, "horoscopes.json")

KNOWN_PLACES = {
    "madrid": ("Madrid, España", 40.4168, -3.7038),
    "barcelona": ("Barcelona, España", 41.3874, 2.1686),
    "palma": ("Palma, España", 39.5696, 2.6502),
    "palma de mallorca": ("Palma, España", 39.5696, 2.6502),
    "valencia": ("Valencia, España", 39.4699, -0.3763),
    "sevilla": ("Sevilla, España", 37.3891, -5.9845),
    "zaragoza": ("Zaragoza, España", 41.6488, -0.8891),
    "malaga": ("Málaga, España", 36.7213, -4.4214),
    "bilbao": ("Bilbao, España", 43.2630, -2.9350),
    "alicante": ("Alicante, España", 38.3452, -0.4810),
    "granada": ("Granada, España", 37.1773, -3.5986),
    "murcia": ("Murcia, España", 37.9922, -1.1307),
    "lisboa": ("Lisboa, Portugal", 38.7223, -9.1393),
    "paris": ("París, Francia", 48.8566, 2.3522),
    "londres": ("Londres, Reino Unido", 51.5072, -0.1276),
    "london": ("Londres, Reino Unido", 51.5072, -0.1276),
    "new york": ("Nueva York, Estados Unidos", 40.7128, -74.0060),
    "nueva york": ("Nueva York, Estados Unidos", 40.7128, -74.0060),
    "buenos aires": ("Buenos Aires, Argentina", -34.6037, -58.3816),
    "ciudad de mexico": ("Ciudad de México, México", 19.4326, -99.1332),
    "mexico df": ("Ciudad de México, México", 19.4326, -99.1332),
}

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

    def resolve_place_coordinates(self, place: str) -> Optional[Dict[str, str]]:
        query = place.strip()
        if not query:
            return None

        normalized = _normalize_place(query)
        local_match = KNOWN_PLACES.get(normalized)
        if not local_match:
            local_match = next(
                (
                    value
                    for key, value in KNOWN_PLACES.items()
                    if key in normalized or normalized in key
                ),
                None,
            )

        if local_match:
            label, latitude, longitude = local_match
            return _coordinate_payload(label, latitude, longitude, "local")

        return _resolve_place_online(query)


def _normalize_place(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value.strip())
    ascii_text = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    return " ".join(ascii_text.casefold().replace(",", " ").split())


def _coordinate_payload(label: str, latitude: float, longitude: float, source: str) -> Dict[str, str]:
    return {
        "label": label,
        "latitude": f"{latitude:.4f}",
        "longitude": f"{longitude:.4f}",
        "coordinates": f"{latitude:.4f}, {longitude:.4f}",
        "source": source,
    }


def _resolve_place_online(query: str) -> Optional[Dict[str, str]]:
    params = urllib.parse.urlencode({"format": "json", "limit": 1, "q": query})
    request = urllib.request.Request(
        f"https://nominatim.openstreetmap.org/search?{params}",
        headers={
            "User-Agent": "Velora-Prismatika/0.1 local symbolic app",
            "Accept": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=4) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception:
        return None

    if not payload:
        return None

    first = payload[0]
    try:
        latitude = float(first["lat"])
        longitude = float(first["lon"])
    except (KeyError, TypeError, ValueError):
        return None

    label = first.get("display_name") or query
    return _coordinate_payload(label, latitude, longitude, "nominatim")


_DEFAULT_ASTRO_SERVICE = AstroService()


def load_signs() -> List[SunSignData]:
    """
    Compatibilidad hacia servicios antiguos que consumen los signos como lista.
    """
    signs = []
    for entry in _DEFAULT_ASTRO_SERVICE.signs_cache:
        try:
            signs.append(
                SunSignData(
                    sign=entry["sign"],
                    element=entry["element"],
                    quality=entry["quality"],
                    ruling_planet=entry["ruling_planet"],
                    desc=entry["desc"],
                )
            )
        except KeyError:
            continue
    return signs


def get_sun_sign_entry(month_or_date, day: Optional[int] = None) -> Optional[SunSignData]:
    """
    Compatibilidad para llamadas con una fecha completa o con mes/día.
    """
    if isinstance(month_or_date, date) and day is None:
        target_date = month_or_date
    else:
        try:
            target_date = date(2000, int(month_or_date), int(day))
        except (TypeError, ValueError):
            return None

    return _DEFAULT_ASTRO_SERVICE.get_sun_sign_entry(target_date)
