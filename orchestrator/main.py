# orchestrator/main.py
import importlib
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configuración básica de logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Velora-Main")

# -------------------------------------------------------------------------
# IMPORTACIÓN DE VELORA (CAPA ETÉREA / IA)
# -------------------------------------------------------------------------
try:
    from orchestrator.router import router as orchestrator_router
    from orchestrator.velora_weaver import VeloraWeaver
    VELORA_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️  No se pudo importar el núcleo de Velora: {e}")
    VELORA_AVAILABLE = False

app = FastAPI(title="Velora Prismätika")

# -------------------------------------------------------------------------
# 1. CONFIGURACIÓN CORS (CRÍTICO)
# -------------------------------------------------------------------------
# Esto permite que tu Frontend (React) hable con el Backend sin errores.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las conexiones locales
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
# 2. CARGA DE SERVICIOS MECÁNICOS (LO QUE YA FUNCIONABA)
# -------------------------------------------------------------------------
# Esta lista define qué módulos se cargan.
# IMPORTANTE: El segundo valor debe ser la ruta Python al archivo que contiene 'router = APIRouter(...)'
SERVICE_LIST = [
    # (nombre_servicio, ruta.al.archivo)
    ("astro", "services.astro_service.router"),
    ("numerology", "services.numerology_service.router"),
    ("moon_phase", "services.moon_phase_service.router"),
    ("compatibility", "services.compatibility_service.compatibility_service"),
    ("rituals", "services.ritual_service.ritual_service"),
    ("chakra", "services.chakra_service.router"),
    ("tarot", "services.tarot_service.router"),
    ("runes", "services.runes_service.router"),
    ("kabbalah", "services.kabbalah_service.router"),
    ("crystal", "services.crystal_service.router"),
    ("transit", "services.transits_service.transits_service"),
    ("palmistry", "services.palmistry_service.router"),
    ("knowledge", "services.knowledge_service.router"),
]

print("\n🔧 --- CARGANDO SERVICIOS (CAPA FÍSICA) ---")

servicios_activos = []

for service_name, module_path in SERVICE_LIST:
    try:
        # Importamos el archivo dinámicamente
        module = importlib.import_module(module_path)
        
        # Buscamos si tiene un objeto 'router' dentro
        if hasattr(module, "router"):
            # Lo montamos en la app.
            # Si el router interno no tiene prefijo, aquí podríamos forzar uno, 
            # pero asumimos que tus archivos ya tienen 'prefix=/astro', etc.
            app.include_router(module.router)
            servicios_activos.append(service_name)
            print(f"✅ Servicio cargado: {service_name.upper()}")
        else:
            print(f"⚠️  {service_name}: El archivo '{module_path}' existe, pero no encontré la variable 'router'.")
            
    except ImportError as e:
        print(f"🔸 No se encontró el módulo para {service_name}: {e}")
        print(f"   (Verifica que la carpeta 'services/{service_name}_service' y el archivo existan)")
    except Exception as e:
        print(f"❌ Error crítico cargando {service_name}: {e}")

# -------------------------------------------------------------------------
# 3. CARGA DE VELORA (CAPA ETÉREA)
# -------------------------------------------------------------------------
if VELORA_AVAILABLE:
    try:
        app.include_router(orchestrator_router)
        print("✨ Velora (Chat Neural) cargada correctamente.")
    except Exception as e:
        print(f"⚠️ Error montando el router de Velora: {e}")
else:
    print("☁️  Velora funciona en modo mecánico (Sin IA Central).")

# -------------------------------------------------------------------------
# 4. EVENTOS DE INICIO
# -------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    print("\n🚀 SISTEMA ONLINE.")
    print(f"   Servicios Activos: {', '.join(servicios_activos)}")
    
    if VELORA_AVAILABLE:
        # Intento silencioso de despertar a la IA sin bloquear el arranque
        try:
            print("👁️  Contactando con consciencia neuronal (Ollama)...")
            weaver = VeloraWeaver()
            # Hacemos un ping muy breve para cargar el modelo en RAM
            # _ = weaver._llamar_a_gemma("Ping", "Pong") 
            print("   (Conexión establecida. Velora está escuchando.)")
        except Exception as e:
            print(f"☁️  Ollama no responde ({e}). La app funcionará, pero Velora no hablará.")
    
    print("🔮 ----------------------------------\n")

@app.get("/")
def root():
    """
    Endpoint de salud para verificar que el backend corre.
    """
    return {
        "status": "Velora Prismätika Online", 
        "services_loaded": len(servicios_activos),
        "ai_active": VELORA_AVAILABLE
    }
