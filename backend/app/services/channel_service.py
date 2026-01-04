import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.channel import Channel
from app.models.user import User

def get_or_create_channel(db: Session, actor: User) -> Channel:
    ch = db.query(Channel).filter(Channel.user_id == actor.user_id).first()
    if ch:
        return ch

    ch = Channel(
        channel_id=str(uuid.uuid4()),
        user_id=actor.user_id,
        stream_key=str(uuid.uuid4()),
        title=f"{actor.username}'s Channel",
        current_category=None,
        live_thumbnail_url=None,
        is_live=False,
        current_viewer_count=0,
        panels=None,
    )
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return ch

def get_channel_by_username(db: Session, username: str) -> Channel:
    from app.models.user import User
    u = db.query(User).filter(User.username == username).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    ch = db.query(Channel).filter(Channel.user_id == u.user_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    return ch
