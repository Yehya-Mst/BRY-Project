from fastapi import APIRouter, Depends, HTTPException
from jose.exceptions import JWTError
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.security import decode_token, access_token
from app.schemas.auth import RegisterIn, LoginIn, TokenOut, RefreshIn
from app.services.auth_service import register_user, login

router = APIRouter()

@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    u = register_user(db, payload.username, payload.email, payload.password, payload.display_name)
    tokens = login(db, payload.email, payload.password, remember_me=True)
    return TokenOut(access_token=tokens["access_token"], refresh_token=tokens["refresh_token"])

@router.post("/auth/login", response_model=TokenOut)
def do_login(payload: LoginIn, db: Session = Depends(get_db)):
    tokens = login(db, payload.email, payload.password, remember_me=payload.remember_me)
    return TokenOut(access_token=tokens["access_token"], refresh_token=tokens["refresh_token"])

@router.post("/auth/refresh", response_model=TokenOut)
def refresh(payload: RefreshIn):
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = data.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # rotate: issue new access; keep same refresh for simplicity
    return TokenOut(access_token=access_token(user_id), refresh_token=payload.refresh_token)

@router.post("/auth/logout")
def logout():
    # Stateless JWT: client deletes tokens. Add token blacklist table later if needed.
    return {"ok": True}

@router.post("/auth/oauth/google")
def oauth_google():
    return {"ok": False, "detail": "Stub. Add Google OAuth later."}

@router.post("/auth/oauth/facebook")
def oauth_facebook():
    return {"ok": False, "detail": "Stub. Add Facebook OAuth later."}
