import json
import os
import random
from typing import Dict

class CrystalService:
    def __init__(self):
        # Ruta absoluta para evitar confusiones
        self.base_path = os.path.dirname(os.path.abspath(__file__))
        self.json_path = os.path.join(self.base_path, "messages.json")
        
        print(f"🔮 CRISTAL DEBUG: Buscando JSON en: {self.json_path}")
        
        self.data = self._load_data()
        self.topics = self.data.get("topics", {})
        
        # Comprobación de carga
        if self.topics:
            print(f"🔮 CRISTAL DEBUG: ¡Carga Éxitosa! {len(self.topics)} temas encontrados.")
        else:
            print("🔮 CRISTAL ERROR: No se cargaron temas. Revisa el archivo messages.json")

    def _load_data(self) -> Dict:
        if not os.path.exists(self.json_path):
            print(f"🔮 CRISTAL ERROR: El archivo NO EXISTE en la ruta especificada.")
            return {}
        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"🔮 CRISTAL ERROR: JSON inválido o corrupto: {e}")
            return {}

    def detect_topic(self, text: str) -> str:
        text = text.lower()
        for topic_key, content in self.topics.items():
            if topic_key in ["general", "yes_no"]: continue
            
            keywords = content.get("keywords", [])
            for kw in keywords:
                if kw in text:
                    return topic_key
        return "general"

    def get_vision_seed(self, question: str) -> Dict:
        topic = self.detect_topic(question)
        
        # Lógica Yes/No para preguntas cortas
        if topic == "general" and (len(question.split()) < 5 or "?" in question):
             if random.random() > 0.5:
                 topic = "yes_no"

        topic_data = self.topics.get(topic, self.topics.get("general", {}))
        messages = topic_data.get("messages", [])
        
        if not messages:
            print(f"🔮 CRISTAL WARNING: No hay mensajes para el tema '{topic}'. Usando Fallback.")
            base_message = "El destino es una niebla cambiante."
        else:
            base_message = random.choice(messages)
            print(f"🔮 CRISTAL: Tema '{topic}' seleccionado. Mensaje base: '{base_message[:15]}...'")

        return {
            "topic": topic,
            "base_message": base_message
        }