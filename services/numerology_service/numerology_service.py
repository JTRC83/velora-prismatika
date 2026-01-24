import json
import os
from datetime import date
from typing import Dict, Optional

class NumerologyService:
    def __init__(self):
        # Ruta dinámica para el JSON de significados (Respaldo)
        self.meanings_path = os.path.join(os.path.dirname(__file__), "meanings.json")
        self.meanings = self._load_meanings()

        # Mapa Pitagórico (Tu código original)
        self.alphabet_map = {
            'a': 1, 'j': 1, 's': 1, 'b': 2, 'k': 2, 't': 2, 'c': 3, 'l': 3, 'u': 3,
            'd': 4, 'm': 4, 'v': 4, 'e': 5, 'n': 5, 'w': 5, 'f': 6, 'o': 6, 'x': 6,
            'g': 7, 'p': 7, 'y': 7, 'h': 8, 'q': 8, 'z': 8, 'i': 9, 'r': 9
        }

    def _load_meanings(self) -> Dict:
        try:
            with open(self.meanings_path, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def mistic_reduction(self, number: int) -> int:
        """Reduce un número respetando los Maestros (11, 22, 33)."""
        while number > 9 and number not in [11, 22, 33]:
            number = sum(int(d) for d in str(number))
        return number

    def calculate_life_path(self, birthdate: date) -> int:
        """Sendero de Vida basado en la fecha."""
        # Suma directa de dígitos YYYYMMDD
        total = sum(int(d) for d in birthdate.strftime("%Y%m%d"))
        return self.mistic_reduction(total)

    def calculate_destiny(self, name: str) -> int:
        """Número de Destino basado en el nombre."""
        total = sum(self.alphabet_map.get(char.lower(), 0) for char in name if char.isalpha())
        return self.mistic_reduction(total)

    def calculate_personal_year(self, life_path: int) -> int:
        """Calcula la vibración del año actual para el usuario."""
        current_year = date.today().year
        year_vibration = self.mistic_reduction(current_year)
        # Año personal = Camino de Vida + Año Universal
        return self.mistic_reduction(life_path + year_vibration)

    def get_meaning(self, number: int) -> str:
        """Recupera el significado del JSON (Respaldo)."""
        data = self.meanings.get(str(number))
        if isinstance(data, dict):
            return data.get("titulo", "El Misterio") # Ajusta según tu JSON real
        return str(data) if data else "Vibración Desconocida"