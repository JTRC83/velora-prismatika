import ephem
import math
from datetime import datetime, date

class MoonService:
    def __init__(self):
        self.zodiac_signs = [
            "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", 
            "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"
        ]

    def _get_moon_sign(self, date_obj):
        """Calcula el signo tropical de la luna."""
        observer = ephem.Observer()
        observer.date = date_obj
        moon = ephem.Moon(observer)
        degrees = math.degrees(moon.hlon)
        sign_index = int(degrees / 30)
        return self.zodiac_signs[sign_index % 12]

    def _get_phase_details(self, date_obj):
        """Calcula nombre de fase e icono basado en la lunación (0.0 a 1.0)."""
        observer = ephem.Observer()
        observer.date = date_obj
        
        prev_new = ephem.previous_new_moon(date_obj)
        next_new = ephem.next_new_moon(date_obj)
        
        # Porcentaje del ciclo
        lunation = (ephem.Date(date_obj) - prev_new) / (next_new - prev_new)
        
        if lunation < 0.03: return "Luna Nueva", "🌑", "Inicios, siembra, vacío fértil."
        if lunation < 0.22: return "Creciente", "🌒", "Intención, brotes, primeros pasos."
        if lunation < 0.28: return "Cuarto Creciente", "🌓", "Acción, desafío, superación."
        if lunation < 0.47: return "Gibosa Creciente", "🌔", "Perfeccionamiento, ajuste."
        if lunation < 0.53: return "Luna Llena", "🌕", "Plenitud, cosecha, iluminación."
        if lunation < 0.72: return "Gibosa Menguante", "🌖", "Gratitud, compartir, introspección."
        if lunation < 0.78: return "Cuarto Menguante", "🌗", "Soltar, limpieza, perdón."
        return "Menguante", "🌘", "Descanso, curación, preparación."

    def calculate_moon_data(self, target_date: datetime = None):
        """
        Devuelve todos los datos astronómicos para la fecha dada.
        """
        if not target_date:
            target_date = datetime.now()

        observer = ephem.Observer()
        observer.date = target_date
        moon = ephem.Moon(observer)
        
        # Cálculos
        illumination = round(moon.phase, 1)
        phase_name, icon, desc_base = self._get_phase_details(target_date)
        zodiac_sign = self._get_moon_sign(target_date)

        return {
            "date": target_date.strftime("%Y-%m-%d"),
            "phase_name": phase_name,
            "illumination": illumination,
            "icon": icon,
            "zodiac_sign": zodiac_sign,
            "description_base": desc_base
        }