import uuid
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, access_token, refresh_token
from app.models.user import User

def register_user(db: Session, username: str, email: str, password: str, display_name: str | None):
    exists = db.query(User).filter((User.username == username) | (User.email == email)).first()
    if exists:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    u = User(
        user_id=str(uuid.uuid4()),
        username=username,
        email=email,
        password_hash=hash_password(password),
        display_name=display_name,
        avatar_url=None,
        banner_url=None,
        bio="",
        follower_count=0,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

def login(db: Session, email: str, password: str, remember_me: bool):
    u = db.query(User).filter(User.email == email).first()
    if not u or not verify_password(password, u.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    u.last_login = datetime.now(timezone.utc)
    db.commit()

    return {
        "access_token": access_token(u.user_id),
        "refresh_token": refresh_token(u.user_id, remember_me=remember_me),
    }
