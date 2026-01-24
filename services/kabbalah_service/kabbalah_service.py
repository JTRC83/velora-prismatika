import json
import os
import random
import unicodedata
from typing import List, Dict, Optional

class KabbalahService:
    def __init__(self):
        self.base_path = os.path.dirname(__file__)
        self.json_path = os.path.join(self.base_path, "sephiroth.json")
        self.sephiroth = self._load_data()

    def _load_data(self) -> List[Dict]:
        if not os.path.exists(self.json_path):
            return []
        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error cargando sephiroth: {e}")
            return []

    def get_all(self) -> List[Dict]:
        return self.sephiroth

    def get_by_id(self, sephira_id: int) -> Optional[Dict]:
        return next((s for s in self.sephiroth if s["id"] == sephira_id), None)

    # --- LÓGICA DE GEMATRÍA ---
    def calculate_gematria_latin(self, text: str) -> int:
        """Calcula valor simple (A=1...Z=26)"""
        total = 0
        normalized = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')
        for char in normalized.upper():
            if 'A' <= char <= 'Z':
                total += ord(char) - 64
        return total

    def reduce_to_1_10(self, number: int) -> int:
        """Reduce hasta llegar a 1-10"""
        if number == 0: return 10 # Fallback por seguridad
        while number > 10:
            number = sum(int(digit) for digit in str(number))
        return number

    def calculate_personal_sephira(self, name: str) -> Dict:
        """Devuelve {valor_original, valor_reducido, sephira}"""
        raw = self.calculate_gematria_latin(name)
        reduced = self.reduce_to_1_10(raw)
        sephira = self.get_by_id(reduced)
        
        return {
            "name_input": name,
            "raw_value": raw,
            "reduced_value": reduced,
            "sephira": sephira
        }