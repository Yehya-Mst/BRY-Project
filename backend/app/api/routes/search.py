from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.schemas.search import SearchResult
from app.services.search_service import search as search_impl

router = APIRouter()

@router.get("/search", response_model=list[SearchResult])
def search(query: str | None = None, category_id: str | None = None, db: Session = Depends(get_db)):
    return search_impl(db, query, category_id)
