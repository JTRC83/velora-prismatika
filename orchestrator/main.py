# orchestrator/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# tu router “principal” si lo tienes
from orchestrator.router import router as orchestrator_router

# los routers de cada microservicio
from services.astro_service.astro_service import router as astro_router
from services.numerology_service.numerology_service import router as numerology_router
from services.tarot_service.tarot_service import router as tarot_router

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

@app.get("/")
def root():
    return {"mensaje": "Velora Prismátika ha despertado."}