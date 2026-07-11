import json
import os
import random
from pathlib import Path
from typing import List, Dict, Any

class TarotService:
    def __init__(self):
        self.base_path = os.path.dirname(__file__)
        self.json_path = os.path.join(self.base_path, "cards.json")
        self.cards = self._load_data()
        self.card_assets_path = self._resolve_card_assets_path()
        self.available_image_ids = self._load_available_image_ids()
        self.drawable_cards = self._filter_drawable_cards()
        
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

    def _resolve_card_assets_path(self) -> Path:
        repo_root = Path(__file__).resolve().parents[2]
        return repo_root / "frontend" / "public" / "assets" / "tarot_cards"

    def _load_available_image_ids(self):
        if not self.card_assets_path.exists():
            print(f"⚠️ [TarotService] No encuentro imágenes del tarot en: {self.card_assets_path}")
            return set()

        available = set()
        for image_path in self.card_assets_path.glob("*.png"):
            if image_path.stem.isdigit():
                available.add(int(image_path.stem))

        return available

    def _filter_drawable_cards(self):
        if not self.cards or not self.available_image_ids:
            return self.cards

        drawable = [
            card for card in self.cards
            if int(card.get("id", -1)) in self.available_image_ids
        ]

        if drawable:
            return drawable

        print("⚠️ [TarotService] Ninguna carta del JSON coincide con las imágenes disponibles.")
        return self.cards

    def _refresh_drawable_cards(self):
        latest_image_ids = self._load_available_image_ids()
        if latest_image_ids != self.available_image_ids:
            self.available_image_ids = latest_image_ids
            self.drawable_cards = self._filter_drawable_cards()

    def tirar_cartas(self, cantidad: int = 3) -> List[Dict[str, Any]]:
        """
        Método Principal llamado por el Router.
        Retorna la lista de cartas formateada para que el Frontend las pinte
        y Velora las lea.
        """
        self._refresh_drawable_cards()
        deck = self.drawable_cards or self.cards

        if not deck:
            # Fallback de emergencia si no hay JSON, para no romper la app
            return self._mazo_emergencia(cantidad)

        drawn = random.sample(deck, min(cantidad, len(deck)))
        posiciones = ["El Origen (Pasado)", "El Foco (Presente)", "El Destino (Futuro)"]
        
        resultado = []
        
        for i, card in enumerate(drawn):
            is_inverted = random.choice([True, False])
            keywords = card.get("keywords", [])
            reversed_keywords = card.get("keywords_rev") or keywords
            meaning = card.get("significado_invertido") if is_inverted else card.get("significado")
            
            # Construimos el objeto que espera el Frontend y Velora
            carta_procesada = {
                "id": card.get("id"),
                "nombre": card.get("name", "Arcano"),
                "img": f"{card.get('id')}.png", 
                "invertida": is_inverted,
                "position": posiciones[i] if i < len(posiciones) else f"Posición {i+1}",
                
                # Datos para ayudar a Velora a interpretar mejor
                "palabras_clave": keywords if not is_inverted else reversed_keywords,
                "elemento": card.get("element", "Éter"),
                "significado_texto": meaning or "",
                "imagen_disponible": int(card.get("id", -1)) in self.available_image_ids
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
