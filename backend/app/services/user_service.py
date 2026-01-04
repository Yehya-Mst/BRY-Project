from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User

def get_profile(db: Session, username: str) -> User:
    u = db.query(User).filter(User.username == username).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u

def update_profile(db: Session, actor: User, username: str, data: dict) -> User:
    if actor.username != username:
        raise HTTPException(status_code=403, detail="Not allowed")

    for k, v in data.items():
        if v is not None and hasattr(actor, k):
            setattr(actor, k, v)

    db.commit()
    db.refresh(actor)
    return actor

def delete_account(db: Session, actor: User) -> None:
    db.delete(actor)
    db.commit()
