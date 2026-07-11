# orchestrator/main.py
import importlib
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from orchestrator.incidentes import TipoIncidencia, registrar_incidente

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
    registrar_incidente(
        TipoIncidencia.ERROR_INTERNO,
        f"No se pudo importar el núcleo de Velora: {e}",
        {"modulo": "orchestrator.router"},
    )
    VELORA_AVAILABLE = False

app = FastAPI(title="Velora Prismätika")

# -------------------------------------------------------------------------
# 1. CONFIGURACIÓN CORS
# -------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
# 2. CARGA DE SERVICIOS MECÁNICOS
# -------------------------------------------------------------------------
SERVICE_LIST = [
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

logger.info("--- CARGANDO SERVICIOS (CAPA FÍSICA) ---")

servicios_activos = []
servicios_fallidos = []

for service_name, module_path in SERVICE_LIST:
    try:
        module = importlib.import_module(module_path)
        if hasattr(module, "router"):
            app.include_router(module.router)
            servicios_activos.append(service_name)
            logger.info(f"Servicio cargado: {service_name.upper()}")
        else:
            registrar_incidente(
                TipoIncidencia.SERVICIO_NO_CARGADO,
                f"El módulo '{module_path}' existe pero no define 'router'.",
                {"servicio": service_name, "modulo": module_path},
            )
            servicios_fallidos.append(service_name)
    except ImportError as e:
        registrar_incidente(
            TipoIncidencia.SERVICIO_NO_CARGADO,
            f"No se pudo importar el módulo: {e}",
            {"servicio": service_name, "modulo": module_path, "error": str(e)},
        )
        servicios_fallidos.append(service_name)
    except Exception as e:
        registrar_incidente(
            TipoIncidencia.ERROR_INTERNO,
            f"Error crítico cargando servicio: {e}",
            {"servicio": service_name, "modulo": module_path, "error": str(e)},
        )
        servicios_fallidos.append(service_name)

# -------------------------------------------------------------------------
# 3. CARGA DE VELORA (CAPA ETÉREA)
# -------------------------------------------------------------------------
if VELORA_AVAILABLE:
    try:
        app.include_router(orchestrator_router)
        logger.info("Velora (Chat Neural) cargada correctamente.")
    except Exception as e:
        registrar_incidente(
            TipoIncidencia.ERROR_INTERNO,
            f"Error montando el router de Velora: {e}",
            {"modulo": "orchestrator.router"},
        )

# -------------------------------------------------------------------------
# 4. EVENTOS DE INICIO
# -------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("SISTEMA ONLINE.")
    logger.info(f"Servicios activos: {', '.join(servicios_activos)}")
    if servicios_fallidos:
        logger.warning(f"Servicios fallidos: {', '.join(servicios_fallidos)}")

    if VELORA_AVAILABLE:
        try:
            logger.info("Contactando con consciencia neuronal (Ollama)...")
            weaver = VeloraWeaver()
            logger.info("Conexión establecida. Velora está escuchando.")
        except Exception as e:
            registrar_incidente(
                TipoIncidencia.OLLAMA_NO_RESPONDE,
                f"Ollama no responde: {e}",
                {"modelo": "qwen3:14b"},
            )
            logger.warning("Ollama no responde. La app funcionará, pero Velora no hablará.")

# -------------------------------------------------------------------------
# 5. ENDPOINTS DE SALUD E INCIDENCIAS
# -------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "Velora Prismätika Online",
        "services_loaded": len(servicios_activos),
        "services_failed": servicios_fallidos,
        "ai_active": VELORA_AVAILABLE,
    }

@app.get("/health")
def health():
    """Endpoint de salud detallado para diagnóstico."""
    return {
        "status": "ok" if not servicios_fallidos else "degradado",
        "services_active": servicios_activos,
        "services_failed": servicios_fallidos,
        "ai_active": VELORA_AVAILABLE,
    }