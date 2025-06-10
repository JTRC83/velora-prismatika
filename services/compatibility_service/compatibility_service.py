import json, os
from fastapi import APIRouter, HTTPException, Query

BASE = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE, "compatibility.json")

router = APIRouter(prefix="/compatibility", tags=["Compatibilidad"])

with open(DATA_PATH, encoding="utf-8") as f:
    DATA = json.load(f)

# Importamos el router de astro para calcular signos si nos dan fechas:
from services.astro_service.astro_service import get_sun_sign_entry

def compute_compat(sign1: dict, sign2: dict) -> dict:
    elem_score = DATA["element_compat"][sign1["element"]][sign2["element"]]
    qual_score = DATA["quality_compat"][sign1["quality"]][sign2["quality"]]
    # Promedio
    comp = round((elem_score + qual_score) / 2)
    # Descripción
    desc = next(
        d["text"] for d in DATA["descriptions"]
        if d["range"][0] <= comp <= d["range"][1]
    )
    return {
        "element_match": f'{sign1["element"]} ↔ {sign2["element"]}',
        "quality_match": f'{sign1["quality"]} ↔ {sign2["quality"]}',
        "compatibility": comp,
        "description": desc
    }

@router.get("/", summary="Compatibilidad entre dos signos o fechas")
def get_compatibility(
    sign1: str = Query(None, description="Nombre de signo o YYYY-MM-DD"),
    sign2: str = Query(None, description="Nombre de signo o YYYY-MM-DD")
):
    # Validar parámetros
    if not sign1 or not sign2:
        raise HTTPException(400, "Debes pasar sign1 y sign2 (nombre o fecha).")

    def resolve(s: str):
        # Si es fecha, calculamos signo solar
        if "-" in s:
            try:
                entry = get_sun_sign_entry(*map(int, s.split("-")[1:]),)
            except Exception:
                raise HTTPException(400, f"Fecha inválida: {s}")
        else:
            # Buscar en JSON de astro_service
            signs = DATA["element_compat"].keys()  # validar existencia?
            # Aquí deberías cargar tu sun_signs.json o usar get_sun_sign_entry con fecha genérica
            # Para simplificar, asumimos que el cliente pasa el nombre exacto
            entry = next((h for h in DATA["signs"] if h["sign"].lower()==s.lower()), None)
            if not entry:
                raise HTTPException(400, f"Signo desconocido: {s}")
        return entry

    # Resolución
    s1 = resolve(sign1)
    s2 = resolve(sign2)

    compat = compute_compat(s1, s2)
    return {
        "sign1": s1["sign"],
        "sign2": s2["sign"],
        **compat
    }