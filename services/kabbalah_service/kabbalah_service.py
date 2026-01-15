import json, os, random
import unicodedata
from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel

BASE = os.path.dirname(__file__)
SEPH_PATH = os.path.join(BASE, "sephiroth.json")

router = APIRouter(prefix="/kabbalah", tags=["Cábala"])

# Carga de datos
try:
    with open(SEPH_PATH, encoding="utf-8") as f:
        SEPHIROTH = json.load(f)
except FileNotFoundError:
    SEPHIROTH = []
    print(f"Error: No se encontró {SEPH_PATH}")

# --- MODELOS ---
class Sephira(BaseModel):
    id: int
    name: str
    hebrew: str
    path: str
    color: str
    hex: str
    planet: str
    virtue: str
    meaning: str
    shadow: str
    mantra: str
    angel: str
    meditation: str
    keywords: list[str]

class GematriaResult(BaseModel):
    input_name: str
    number_value: int
    reduced_value: int
    sephira: Sephira
    interpretation: str

# --- UTILIDADES ---

def calculate_gematria_latin(text: str) -> int:
    """
    Calcula un valor numérico simple (A=1, B=2...) para texto latino.
    Normaliza acentos (Á -> A).
    """
    total = 0
    # Normalizar para quitar acentos
    normalized = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')
    
    for char in normalized.upper():
        if 'A' <= char <= 'Z':
            # A=1 (ord 65) ... Z=26
            total += ord(char) - 64
    return total

def reduce_to_1_10(number: int) -> int:
    """
    Reduce un número recursivamente sumando sus dígitos hasta que esté entre 1 y 10.
    Ej: 156 -> 1+5+6=12 -> 1+2=3.
    Malkut es 10, así que permitimos 10.
    """
    while number > 10:
        number = sum(int(digit) for digit in str(number))
    return number

# --- ENDPOINTS ---

@router.get("/", response_model=list[Sephira], summary="Árbol de la Vida completo")
def list_sephiroth():
    return SEPHIROTH

@router.get("/{sephira_id}", response_model=Sephira, summary="Detalle de Sephirá")
def get_sephira(sephira_id: int = Path(..., ge=1, le=10)):
    entry = next((s for s in SEPHIROTH if s["id"] == sephira_id), None)
    if not entry:
        raise HTTPException(404, "Sephirá no encontrada.")
    return entry

@router.get("/gematria/{name}", response_model=GematriaResult, summary="Calcula tu Sephirá por nombre")
def gematria_calc(name: str):
    """
    Realiza un cálculo de Gematria simple sobre el nombre.
    Reduce el valor a 1-10 y devuelve la Sephirá correspondiente
    que rige esa 'vibración' del nombre.
    """
    raw_val = calculate_gematria_latin(name)
    if raw_val == 0:
        raise HTTPException(400, "El nombre debe contener letras latinas.")
        
    reduced = reduce_to_1_10(raw_val)
    
    # Buscar la Sephirá correspondiente (ID = reduced)
    sephira = next((s for s in SEPHIROTH if s["id"] == reduced), None)
    
    interpretation = (
        f"Tu nombre vibra con la energía de {sephira['name']}. "
        f"Tu camino de crecimiento implica cultivar la virtud de la {sephira['virtue']} "
        f"y tener cuidado con el desequilibrio hacia {sephira['shadow'].lower()}."
    )

    return GematriaResult(
        input_name=name,
        number_value=raw_val,
        reduced_value=reduced,
        sephira=sephira,
        interpretation=interpretation
    )

@router.get("/pathworking/search", response_model=list[Sephira], summary="Buscar Sephirá por intención")
def search_pathworking(query: str = Query(..., description="Ej: amor, dinero, protección")):
    """
    Busca qué Sephirá corresponde a una intención del usuario 
    (basado en keywords y significados).
    """
    q = query.lower()
    results = []
    
    for s in SEPHIROTH:
        # Búsqueda simple en keywords, nombre, virtud y significado
        text_corpus = (
            s['name'].lower() + " " + 
            s['virtue'].lower() + " " + 
            " ".join(s['keywords']).lower()
        )
        if q in text_corpus:
            results.append(s)
            
    if not results:
        # Si no encuentra nada, podríamos devolver Tiferet (Equilibrio) por defecto o lista vacía
        return []
        
    return results

@router.get("/meditation/random", summary="Meditación diaria")
def random_meditation():
    """
    Devuelve una meditación breve basada en una Sephirá al azar.
    """
    entry = random.choice(SEPHIROTH)
    return {
        "title": f"Meditación en {entry['name']}",
        "focus": entry['virtue'],
        "instruction": entry['meditation'],
        "mantra": entry['mantra'],
        "color_visual": entry['color']
    }