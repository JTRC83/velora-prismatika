# orchestrator/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from orchestrator.router import router

app = FastAPI()

# Habilitar CORS para el frontend en http://localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de tu Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"mensaje": "Velora Prismátika ha despertado."}