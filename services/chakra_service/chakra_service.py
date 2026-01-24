import json
import os
import random
from typing import List, Dict, Optional

class ChakraService:
    def __init__(self):
        self.base_path = os.path.dirname(__file__)
        self.json_path = os.path.join(self.base_path, "chakras.json")
        self.chakras = self._load_data()

    def _load_data(self) -> List[Dict]:
        if not os.path.exists(self.json_path):
            return []
        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error cargando chakras: {e}")
            return []

    def get_all(self) -> List[Dict]:
        return self.chakras

    def get_by_id(self, chakra_id: int) -> Optional[Dict]:
        return next((c for c in self.chakras if c["id"] == chakra_id), None)

    def diagnose_by_symptom(self, symptom: str) -> Dict:
        """
        Busca chakras relacionados con un síntoma.
        Retorna el mejor candidato.
        """
        symptom = symptom.lower()
        matches = []
        
        for c in self.chakras:
            # Buscamos en la lista de desequilibrios
            if any(symptom in i.lower() for i in c["imbalance"]):
                matches.append(c)
        
        if matches:
            return {"found": True, "chakra": matches[0]} # Devuelve el primero que coincida
        
        # Si no encuentra nada, sugerimos el Corazón o Raíz por defecto para calmar
        return {"found": False, "chakra": self.get_by_id(1)}