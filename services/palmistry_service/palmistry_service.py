import json
import os
import random
from typing import Any, Dict, List, Optional

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

    def read_photo(self, hand_side: str, source: str, image_meta: Optional[Dict[str, Any]] = None) -> Dict:
        """
        Genera una lectura preliminar a partir de la mano indicada y metadatos de imagen.
        La inspección visual profunda queda preparada para un modelo de visión posterior.
        """
        image_meta = image_meta or {}
        normalized_side = hand_side if hand_side in {"left", "right"} else "right"
        side_label = "Mano izquierda" if normalized_side == "left" else "Mano derecha"
        side_meaning = (
            "patrones heredados, memoria emocional y mundo interno"
            if normalized_side == "left"
            else "hábitos activos, voluntad cotidiana y modo de actuar en el mundo"
        )

        lines = self.data.get("lines", [])
        sampled_lines = random.sample(lines, k=min(3, len(lines))) if lines else []
        focus_lines = [
            {
                "line_id": line["id"],
                "line_name": line["name"],
                "description": line["description"],
                "base_reading": random.choice(line["readings"]),
            }
            for line in sampled_lines
        ]

        width = image_meta.get("width") or 0
        height = image_meta.get("height") or 0
        short_edge = min(width, height) if width and height else 0
        quality_note = (
            "La imagen tiene resolución suficiente para una primera lectura simbólica."
            if short_edge >= 900
            else "La imagen sirve como entrada, aunque una foto más grande y nítida ayudaría a distinguir mejor los trazos."
        )

        source_label = "captura de cámara" if source == "camera" else "imagen subida"

        return {
            "hand_side": normalized_side,
            "hand_label": side_label,
            "hand_meaning": side_meaning,
            "source": source,
            "source_label": source_label,
            "image_note": quality_note,
            "base_reading": (
                f"{side_label} registrada mediante {source_label}. En quiromancia se observa como un mapa de "
                f"{side_meaning}. {quality_note}"
            ),
            "focus_lines": focus_lines,
            "reflejo": "La mano no sentencia: muestra hábitos, ritmos y posibilidades que puedes afinar con atención."
        }
