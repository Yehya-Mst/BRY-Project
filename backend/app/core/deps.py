from typing import Generator, Optional
from fastapi import Depends, HTTPException, Header
from jose.exceptions import JWTError

from app.db.session import SessionLocal
from app.core.security import decode_token
from app.models.user import User

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_bearer_token(authorization: Optional[str] = Header(default=None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    return authorization.split(" ", 1)[1].strip()

def get_current_user(db=Depends(get_db), token: str = Depends(get_bearer_token)) -> User:
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_current_user_optional(db=Depends(get_db), authorization: Optional[str] = Header(default=None)) -> Optional[User]:
    """
    Like get_current_user, but returns None when unauthenticated.
    Use this for endpoints that are public but want to personalize responses.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
    except JWTError:
        return None

    user = db.query(User).filter(User.user_id == user_id).first()
    return user

