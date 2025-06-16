# orchestrator/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# tu router “principal” si lo tienes
from orchestrator.router import router as orchestrator_router

# los routers de cada microservicio
from services.astro_service.astro_service import router as astro_router
from services.numerology_service.numerology_service import router as numerology_router
from services.tarot_service.tarot_service import router as tarot_router
from services.runes_service.runes_service import router as runes_router
from services.iching_service.iching_service import router as iching_router
from services.chakra_service.chakra_service import router as chakra_router
from services.compatibility_service.compatibility_service import router as compat_router
from services.moon_phase_service.moon_phase_service import router as moon_router
from services.kabbalah_service.kabbalah_service import router as kabbalah_router
from services.transits_service.transits_service import router as transits_router
from services.ritual_service.ritual_service import router as ritual_router

app = FastAPI(title="Velora Prismätika")

# CORS para tu frontend Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# primero tu router de orquestación (si lo necesitas)
app.include_router(orchestrator_router)

# ahora cada uno de los servicios
app.include_router(astro_router)
app.include_router(numerology_router)
app.include_router(tarot_router)
app.include_router(runes_router)
app.include_router(iching_router)
app.include_router(chakra_router)
app.include_router(compat_router)
app.include_router(moon_router)
app.include_router(kabbalah_router)
app.include_router(transits_router)
app.include_router(ritual_router)

@app.get("/")
def root():
    return {"mensaje": "Velora Prismátika ha despertado."}