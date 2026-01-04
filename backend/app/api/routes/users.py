from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.schemas.user import PublicUser, UpdateProfileIn
from app.services.user_service import get_profile, update_profile, delete_account

router = APIRouter()

@router.get("/profile/{username}", response_model=PublicUser)
def profile(username: str, db: Session = Depends(get_db)):
    u = get_profile(db, username)
    return u

@router.patch("/profile/{username}", response_model=PublicUser)
def patch_profile(username: str, payload: UpdateProfileIn, db: Session = Depends(get_db), actor=Depends(get_current_user)):
    u = update_profile(db, actor, username, payload.model_dump())
    return u

@router.delete("/account")
def delete_me(db: Session = Depends(get_db), actor=Depends(get_current_user)):
    delete_account(db, actor)
    return {"ok": True}
