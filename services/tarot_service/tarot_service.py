# tarot_service/tarot_service.py

import json
import os
import random

BASE = os.path.dirname(__file__)
CARDS_PATH = os.path.join(BASE, "cards.json")
TEMPLATES_PATH = os.path.join(BASE, "templates", "three_card_reading.json")

class TarotService:
    def __init__(self):
        # Cargar todas las cartas con sus significados y significados_invertido
        with open(CARDS_PATH, "r", encoding="utf-8") as f:
            self.cards = json.load(f)
        # Cargar plantillas de lectura
        with open(TEMPLATES_PATH, "r", encoding="utf-8") as f:
            self.templates = json.load(f)

    def shuffle_deck(self) -> None:
        """Baraja aleatoriamente el mazo."""
        random.shuffle(self.cards)

    def draw_three(self) -> list[dict]:
        """Extrae las primeras tres cartas del mazo ya barajado."""
        if len(self.cards) < 3:
            raise ValueError("No hay suficientes cartas para una tirada de tres cartas.")
        # Tomamos copia para no modificar self.cards directamente
        drawn = self.cards[:3]
        return drawn

    def interpret_three_card(self, cards: list[dict]) -> str:
        """
        Para cada una de las tres cartas:
        1) Decide aleatoriamente si sale invertida.
        2) Elige el campo "significado" o "significado_invertido".
        3) Formatea el texto con la plantilla correspondiente.
        """
        posiciones = ["Pasado", "Presente", "Futuro"]
        lectura_parts = []

        for idx, card in enumerate(cards):
            # 1) Determinar si la carta sale invertida (50% probabilidad)
            carta_sale_invertida = random.choice([True, False])

            # 2) Elegir el texto según si está invertida o no
            if carta_sale_invertida:
                texto_carta = card["significado_invertido"]
            else:
                texto_carta = card["significado"]

            # 3) Rellenar la plantilla para esta posición
            plantilla = random.choice(self.templates["lecturas"])
            texto_final = plantilla.format(
                posicion=posiciones[idx],
                carta=card["name"],
                significado=texto_carta
            )
            lectura_parts.append(texto_final)

        return "\n\n".join(lectura_parts)