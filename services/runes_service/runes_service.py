import json
import os
import random
from typing import List, Dict, Any

class RunesService:
    def __init__(self):
        # Carga segura del JSON
        self.base_path = os.path.dirname(__file__)
        self.json_path = os.path.join(self.base_path, "runes.json")
        self.runes = self._load_data()

    def _load_data(self) -> List[Dict]:
        if not os.path.exists(self.json_path):
            return []
        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error cargando runas: {e}")
            return []

    def cast_runes(self, amount: int = 3) -> List[Dict[str, Any]]:
        """
        Saca runas al azar. 
        Maneja la inversión (merkstave) si la runa no es simétrica.
        """
        if not self.runes:
            return []

        # Seleccionamos sin reemplazo (la bolsa se vacía)
        selected = random.sample(self.runes, amount)
        cast_result = []

        for rune in selected:
            # Si 'reversed' es null en el JSON, es simétrica (ej: Isa, Gebo)
            # Si no es simétrica, tiene 40% de probabilidad de salir invertida
            is_inverted = False
            if rune.get("reversed") is not None:
                is_inverted = random.choice([True, False, False, False, False]) 
            
            # Decidimos qué significado enviar al frontend
            meaning_text = rune["meaning"]
            if is_inverted:
                meaning_text = rune["reversed"]

            cast_result.append({
                "id": rune["id"],
                "name": rune["name"],
                "symbol": rune["symbol"],
                "element": rune.get("element", "Tierra"),
                "inverted": is_inverted,
                "meaning_text": meaning_text, # El significado ya filtrado
                "position_desc": "N/A"
            })

        return cast_result