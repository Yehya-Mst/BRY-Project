from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.schemas.user import PublicUser

router = APIRouter()

@router.get("/me", response_model=PublicUser)
def me(actor=Depends(get_current_user)):
    return actor
