from sqlalchemy.orm import Session
from app.models.clip import Clip
from app.models.user import User

def list_clips(db: Session, limit: int = 24):
    return db.query(Clip).order_by(Clip.view_count.desc()).limit(limit).all()

def list_user_clips(db: Session, user: User, limit: int = 24):
    return db.query(Clip).filter(Clip.creator_id == user.user_id).order_by(Clip.view_count.desc()).limit(limit).all()
