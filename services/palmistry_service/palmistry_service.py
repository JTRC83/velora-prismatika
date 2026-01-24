import json
import os
import random
from typing import List, Dict, Optional

class PalmistryService:
    def __init__(self):
        self.base_path = os.path.dirname(__file__)
        self.json_path = os.path.join(self.base_path, "palmistry.json")
        self.data = self._load_data()

    def _load_data(self) -> Dict:
        if not os.path.exists(self.json_path):
            return {"lines": []}
        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error cargando quiromancia: {e}")
            return {"lines": []}

    def get_lines_info(self) -> List[Dict]:
        """Devuelve la lista de líneas disponibles para el menú."""
        return [
            {"id": l["id"], "name": l["name"], "description": l["description"]} 
            for l in self.data.get("lines", [])
        ]

    def read_line(self, line_id: str) -> Optional[Dict]:
        """
        Busca la línea y selecciona una lectura aleatoria de su lista.
        """
        lines = self.data.get("lines", [])
        line_info = next((l for l in lines if l["id"] == line_id), None)
        
        if not line_info:
            return None

        # Seleccionamos una lectura base aleatoria del JSON
        base_reading = random.choice(line_info["readings"])

        return {
            "line_id": line_info["id"],
            "line_name": line_info["name"],
            "description": line_info["description"],
            "base_reading": base_reading
        }