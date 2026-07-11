from datetime import datetime

from services.astro_utils import get_moon_phase, get_moon_sign
import ephem


class MoonService:
    def calculate_moon_data(self, target_date: datetime = None):
        """
        Devuelve todos los datos astronómicos para la fecha dada.
        """
        if not target_date:
            target_date = datetime.now()

        observer = ephem.Observer()
        observer.date = target_date
        moon = ephem.Moon(observer)

        illumination = round(moon.phase, 1)
        phase_name, icon, desc_base = get_moon_phase(target_date)
        zodiac_sign = get_moon_sign(target_date)

        return {
            "date": target_date.strftime("%Y-%m-%d"),
            "phase_name": phase_name,
            "illumination": illumination,
            "icon": icon,
            "zodiac_sign": zodiac_sign,
            "description_base": desc_base,
        }