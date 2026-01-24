import json
import os
import random
from typing import List, Dict, Any

class TarotService:
    def __init__(self):
        # 1. Definimos la ruta del mazo. 
        # Asegúrate de que tu archivo 'cards.json' esté en esta carpeta o ajusta la ruta.
        self.base_path = os.path.dirname(__file__)
        self.json_path = os.path.join(self.base_path, "cards.json")
        
        # Si decidiste moverlo a una carpeta data, descomenta esto:
        # self.json_path = os.path.join(self.base_path, "data", "tarot_deck.json")

        self.cards = self._load_data()
        
        # Mapa rápido por si necesitamos buscar quintasencias
        self.deck_map = {c["id"]: c for c in self.cards} if self.cards else {}

    def _load_data(self):
        """Carga el JSON de cartas de forma segura."""
        if not os.path.exists(self.json_path):
            print(f"⚠️ [TarotService] No encuentro el mazo en: {self.json_path}")
            return []
        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ [TarotService] Error leyendo JSON: {e}")
            return []

    def tirar_cartas(self, cantidad: int = 3) -> List[Dict[str, Any]]:
        """
        Método Principal llamado por el Router.
        Retorna la lista de cartas formateada para que el Frontend las pinte
        y Velora las lea.
        """
        if not self.cards:
            # Fallback de emergencia si no hay JSON, para no romper la app
            return self._mazo_emergencia(cantidad)

        drawn = random.sample(self.cards, cantidad)
        posiciones = ["El Origen (Pasado)", "El Foco (Presente)", "El Destino (Futuro)"]
        
        resultado = []
        
        for i, card in enumerate(drawn):
            is_inverted = random.choice([True, False])
            
            # Construimos el objeto que espera el Frontend y Velora
            carta_procesada = {
                "id": card.get("id"),
                "nombre": card.get("name", "Arcano"),
                # Esto asume que tus imágenes se llaman "0.jpg", "1.jpg", etc.
                "img": f"{card.get('id')}.png", 
                "invertida": is_inverted,
                "position": posiciones[i] if i < len(posiciones) else f"Posición {i+1}",
                
                # Datos para ayudar a Velora a interpretar mejor
                "palabras_clave": card.get("keywords", []) if not is_inverted else card.get("keywords_rev", []),
                "elemento": card.get("element", "Éter"),
                "significado_texto": card.get("significado", "") # Opcional, por si Velora lo necesita
            }
            resultado.append(carta_procesada)

        return resultado

    def _mazo_emergencia(self, n):
        """Retorna cartas dummy si falla la carga del archivo, para debug."""
        return [{
            "id": 0, 
            "nombre": "El Loco (Backup)", 
            "img": "0.png", 
            "invertida": False, 
            "palabras_clave": ["Inicio", "Caos"],
            "position": "Fallo de Carga"
        }] * n

    # --- LÓGICA PRESERVADA (Para uso futuro o interno) ---
    
    def _calculate_quintessence(self, drawn_cards: List[Dict]) -> Dict:
        """Suma numerológica de la tirada."""
        total_val = sum(c.get("id", 0) for c in drawn_cards)
        while total_val > 21:
            total_val = sum(int(d) for d in str(total_val))
        
        shadow_card = self.deck_map.get(total_val)
        return shadow_card if shadow_card else None

    def _analyze_elements(self, drawn_cards: List[Dict]) -> str:
        """Analiza el clima elemental de la tirada."""
        # Esta lógica es genial, la guardamos aquí. 
        # En el futuro podemos pasar este string a Velora en el Router.
        from collections import Counter
        elements = [c.get("element", "Éter") for c in drawn_cards]
        counts = Counter(elements)
        if not counts: return "Vacío"
        most_common, qty = counts.most_common(1)[0]
        
        if qty >= 2:
            if most_common == "Fuego": return "Intenso y rápido"
            if most_common == "Agua": return "Emocional y profundo"
            if most_common == "Aire": return "Mental y lógico"
            if most_common == "Tierra": return "Material y tangible"
        return "Equilibrio alquímico"