# orchestrator/main.py
import importlib
import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from orchestrator.incidentes import TipoIncidencia, registrar_incidente

# Configuración básica de logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Velora-Main")

# -------------------------------------------------------------------------
# IMPORTACIÓN DE VELORA (CAPA ETÉREA / IA)
# -------------------------------------------------------------------------
try:
    from orchestrator.router import router as orchestrator_router
    from orchestrator.velora_weaver import get_weaver
    VELORA_AVAILABLE = True
except ImportError as e:
    registrar_incidente(
        TipoIncidencia.ERROR_INTERNO,
        f"No se pudo importar el núcleo de Velora: {e}",
        {"modulo": "orchestrator.router"},
    )
    VELORA_AVAILABLE = False

# -------------------------------------------------------------------------
# CARGA DE SERVICIOS MECÁNICOS
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
            app_include_router = module.router
            servicios_activos.append(service_name)
            logger.info(f"Servicio cargado: {service_name.upper()}")
        else:
            registrar_incidente(
                TipoIncidencia.SERVICIO_NO_CARGADO,
                f"El módulo '{module_path}' existe pero no define 'router'.",
                {"servicio": service_name, "modulo": module_path},
            )
            servicios_fallidos.append(service_name)
            continue
    except ImportError as e:
        registrar_incidente(
            TipoIncidencia.SERVICIO_NO_CARGADO,
            f"No se pudo importar el módulo: {e}",
            {"servicio": service_name, "modulo": module_path, "error": str(e)},
        )
        servicios_fallidos.append(service_name)
        continue
    except Exception as e:
        registrar_incidente(
            TipoIncidencia.ERROR_INTERNO,
            f"Error crítico cargando servicio: {e}",
            {"servicio": service_name, "modulo": module_path, "error": str(e)},
        )
        servicios_fallidos.append(service_name)
        continue

# Collect routers to include after app creation
_routers_to_include = []
if VELORA_AVAILABLE:
    _routers_to_include.append(orchestrator_router)
    logger.info("Velora (Chat Neural) preparada para cargar.")

# -------------------------------------------------------------------------
# LIFESPAN (reemplaza @app.on_event("startup"))
# -------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Arranque ---
    logger.info("SISTEMA ONLINE.")
    logger.info(f"Servicios activos: {', '.join(servicios_activos)}")
    if servicios_fallidos:
        logger.warning(f"Servicios fallidos: {', '.join(servicios_fallidos)}")

    if VELORA_AVAILABLE:
        try:
            logger.info("Contactando con consciencia neuronal (Ollama)...")
            weaver = get_weaver()
            logger.info(f"Conexión establecida. Modelo activo: {weaver.model}")
        except Exception as e:
            registrar_incidente(
                TipoIncidencia.OLLAMA_NO_RESPONDE,
                f"Ollama no responde: {e}",
                {"modelo": "qwen3:14b"},
            )
            logger.warning("Ollama no responde. La app funcionará, pero Velora no hablará.")

    yield

    # --- Cierre ---
    logger.info("Velora Prismätika se detiene.")


# -------------------------------------------------------------------------
# APP FASTAPI
# -------------------------------------------------------------------------
app = FastAPI(title="Velora Prismätika", lifespan=lifespan)

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
# 2. MONTAR ROUTERS
# -------------------------------------------------------------------------
for service_name, module_path in SERVICE_LIST:
    if service_name in servicios_fallidos:
        continue
    try:
        module = importlib.import_module(module_path)
        if hasattr(module, "router"):
            app.include_router(module.router)
    except Exception:
        pass

for router in _routers_to_include:
    try:
        app.include_router(router)
        logger.info("Velora (Chat Neural) cargada correctamente.")
    except Exception as e:
        registrar_incidente(
            TipoIncidencia.ERROR_INTERNO,
            f"Error montando el router de Velora: {e}",
            {"modulo": "orchestrator.router"},
        )

# -------------------------------------------------------------------------
# 3. ENDPOINTS DE SALUD E INCIDENCIAS
# -------------------------------------------------------------------------

@app.get("/health")
def health():
    """Endpoint de salud detallado para diagnóstico."""
    return {
        "status": "ok" if not servicios_fallidos else "degradado",
        "services_active": servicios_activos,
        "services_failed": servicios_fallidos,
        "ai_active": VELORA_AVAILABLE,
    }

@app.get("/api/status")
def api_status():
    """Estado de la API para diagnóstico programático."""
    return {
        "status": "Velora Prismätika Online",
        "services_loaded": len(servicios_activos),
        "services_failed": servicios_fallidos,
        "ai_active": VELORA_AVAILABLE,
    }

# -------------------------------------------------------------------------
# 4. SERVIR FRONTEND DE PRODUCCIÓN
# -------------------------------------------------------------------------
# Si existe frontend/dist (vite build), FastAPI sirve la app completa.
# En modo desarrollo, Vite corre aparte en :5173 y no se sirve aquí.

_FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
_FRONTEND_INDEX = os.path.join(_FRONTEND_DIST, "index.html")

if os.path.isdir(_FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(_FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Sirve el frontend SPA. Las rutas de la API ya están registradas arriba."""
        file_path = os.path.join(_FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(_FRONTEND_INDEX)

    logger.info(f"Frontend de producción servido desde {_FRONTEND_DIST}")
else:
    logger.info("Frontend de producción no encontrado. Modo desarrollo: usa Vite en :5173.")