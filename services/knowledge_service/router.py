from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.knowledge_service.store import knowledge_base


router = APIRouter(prefix="/knowledge", tags=["knowledge"])


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    limit: int = Field(default=5, ge=1, le=20)


@router.get("/status")
def knowledge_status():
    return knowledge_base.status()


@router.post("/reload")
def reload_knowledge():
    knowledge_base.refresh(force=True)
    return knowledge_base.status()


@router.get("/search")
def search_knowledge(
    q: str = Query(..., min_length=1),
    limit: int = Query(default=5, ge=1, le=20),
):
    return {"query": q, "results": knowledge_base.search(q, limit=limit)}


@router.post("/search")
def search_knowledge_post(payload: KnowledgeSearchRequest):
    return {
        "query": payload.query,
        "results": knowledge_base.search(payload.query, limit=payload.limit),
    }


@router.get("/documents/{document_id}")
def get_document(document_id: str):
    document = knowledge_base.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Documento no encontrado en la bóveda.")
    return document
