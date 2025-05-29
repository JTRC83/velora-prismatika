# orchestrator/main.py
from fastapi import FastAPI
from orchestrator.router import router

app = FastAPI()
app.include_router(router)

@app.get("/")
def root():
    return {"mensaje": "Velora Prismátika ha despertado."}