import json
import os
import random
from collections import Counter
from typing import List, Dict, Any

# Importamos el orquestador para el mensaje final
from orchestrator.utils import get_velora_reflection

BASE = os.path.dirname(__file__)
CARDS_PATH = os.path.join(BASE, "cards.json")

class TarotService:
    def __init__(self):
        self.cards = self._load_data()
        # Mapa rápido para buscar por ID
        self.deck_map = {c["id"]: c for c in self.cards}

    def _load_data(self):
        if not os.path.exists(CARDS_PATH):
            return []
        with open(CARDS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def _calculate_quintessence(self, drawn_cards: List[Dict]) -> Dict:
        """
        Suma los valores de las cartas para encontrar el Arcano Mayor oculto (La Sombra).
        Regla: Se suman los IDs (o números). Si es > 21, se reducen los dígitos (ej: 25 = 2+5 = 7).
        """
        total_val = sum(c.get("id", 0) for c in drawn_cards)
        
        # Reducción numerológica si supera 21 (El Mundo)
        while total_val > 21:
            digits = [int(d) for d in str(total_val)]
            total_val = sum(digits)
            
        # Buscamos esa carta en el mazo (debe ser Arcano Mayor)
        # Nota: Asumimos que IDs 0-21 son los Mayores.
        shadow_card = self.deck_map.get(total_val)
        
        if shadow_card:
            return {
                "name": shadow_card["name"],
                "meaning": shadow_card["significado"],
                "archetype": "La Lección Oculta"
            }
        return None

    def _analyze_elements(self, drawn_cards: List[Dict]) -> str:
        """Analiza qué elemento predomina en la tirada."""
        elements = [c.get("element", "Éter") for c in drawn_cards]
        counts = Counter(elements)
        most_common, qty = counts.most_common(1)[0]
        
        if qty >= 2:
            if most_common == "Fuego": return "🔥 El clima es intenso y de acción rápida."
            if most_common == "Agua": return "💧 Las emociones profundas dominan la lectura."
            if most_common == "Aire": return "🌪️ La mente, la lógica y la verdad prevalecen."
            if most_common == "Tierra": return "🌿 El enfoque está en lo material y tangible."
        
        return "✨ Hay un equilibrio alquímico entre los elementos."

    def draw_reading(self) -> Dict[str, Any]:
        """Realiza la tirada completa con análisis profundo."""
        # 1. Sacar 3 cartas
        drawn = random.sample(self.cards, 3)
        posiciones = ["El Origen (Pasado)", "El Foco (Presente)", "El Destino (Futuro)"]
        
        reading_cards = []
        
        for i, card in enumerate(drawn):
            is_inverted = random.choice([True, False])
            reading_cards.append({
                "position": posiciones[i],
                "name": card["name"],
                "image_id": card["id"], # Para el frontend
                "is_inverted": is_inverted,
                "keywords": card.get("keywords", []),
                "text": card["significado_invertido"] if is_inverted else card["significado"],
                "element": card.get("element", "Misterio")
            })

        # 2. Cálculos Metafísicos
        quintessence = self._calculate_quintessence(drawn)
        elemental_vibe = self._analyze_elements(drawn)
        
        # 3. Reflexión de Velora
        velora_msg = get_velora_reflection("tarot_reading")

        return {
            "cards": reading_cards,
            "analysis": {
                "elemental_climate": elemental_vibe,
                "quintessence": quintessence
            },
            "velora_message": velora_msg
        }

# Instancia global para importar en main.py
tarot_service = TarotService()