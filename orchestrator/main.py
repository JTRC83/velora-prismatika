import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from orchestrator.router import router as orchestrator_router
# 👇 Importamos las utilidades de la identidad de Velora
from orchestrator.utils import get_velora_voice, get_velora_reflection

app = FastAPI(title="Velora Prismätika")

# 1. Configuración de Seguridad (CORS)
# Permite que tu Frontend (React) se comunique con este Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <--- CAMBIA ESTO A "*" (Comodín universal)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Registro Automatizado de Microservicios
# Lista central de servicios. Si creas uno nuevo, añádelo aquí.
SERVICE_LIST = [
    ("astro", "services.astro_service.astro_service"),
    ("numerology", "services.numerology_service.numerology_service"),
    ("tarot", "services.tarot_service.tarot_service"),
    ("runes", "services.runes_service.runes_service"),
    ("chakra", "services.chakra_service.chakra_service"),
    ("compatibility", "services.compatibility_service.compatibility_service"),
    ("moon_phase", "services.moon_phase_service.moon_phase_service"),
    ("kabbalah", "services.kabbalah_service.kabbalah_service"),
    ("transits", "services.transits_service.transits_service"),
    ("ritual", "services.ritual_service.ritual_service"),
    ("crystal_ball", "services.crystal_ball_service.crystal_ball_service"), 
    ("palmistry", "services.palmistry_service.palmistry_service"),
]

for service_name, module_path in SERVICE_LIST:
    try:
        # Importación dinámica del módulo para mantener el main limpio
        module = __import__(module_path, fromlist=["router"])
        app.include_router(module.router)
        # print(f"[✨ Velora] Canalizado servicio: {service_name}")
    except ImportError as e:
        print(f"[⚠️ Velora Warning] No se encontró el módulo para {service_name}: {e}")
    except Exception as e:
        print(f"[⚠️ Velora Error] Fallo al cargar {service_name}: {e}")

# 3. Router de Orquestación Principal
# Se incluye al final para gestionar rutas generales
app.include_router(orchestrator_router)

# 4. Evento de Inicio (El "Despertar" de Velora)
@app.on_event("startup")
async def wake_up_velora():
    """
    Verifica que la identidad y sabiduría de Velora estén accesibles 
    antes de aceptar peticiones.
    """
    voice = get_velora_voice()
    sample_quote = get_velora_reflection("hermetic_base")
    
    print("\n🔮 --- INICIANDO SISTEMA VELORA ---")
    
    if "ERROR" in voice:
        print("❌ Error crítico: No se encuentra 'core_identity.txt'. Revisa orchestrator/prompts/")
    else:
        print("✅ Identidad (System Prompt) cargada correctamente.")
        
    if "backup" in sample_quote.lower() or "respaldo" in sample_quote.lower():
        print("⚠️ Advertencia: Usando frases de respaldo. Revisa 'wisdom_lenses.json'.")
    else:
        print("✅ Lentes de Sabiduría cargadas.")

    print(f"✨ Frase de prueba: '{sample_quote}'")
    print("🔮 ----------------------------------\n")

# 5. Punto de Entrada Raíz
@app.get("/")
def root():
    """
    Endpoint de bienvenida que demuestra la voz dinámica de Velora.
    """
    return {
        "entidad": "Velora Prismätika",
        "estado": "Despierta",
        "mensaje_del_dia": get_velora_reflection("hermetic_base")
    }