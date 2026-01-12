from fastapi import APIRouter
from orchestrator.utils import get_velora_reflection

router = APIRouter(prefix="/crystal-ball", tags=["Bola de Cristal"])

@router.get("/gaze", summary="Consulta la Bola de Cristal")
def gaze_into_crystal():
    return {
        "vision": get_velora_reflection("oracle_vision")
    }
