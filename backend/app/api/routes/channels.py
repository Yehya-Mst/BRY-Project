import random
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, get_current_user_optional
from app.services.channel_service import get_or_create_channel, get_channel_by_username
from app.models.channel import Channel
from app.models.user import User

router = APIRouter()

@router.get("/recommended")
def recommended(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    actor: Optional[User] = Depends(get_current_user_optional),
):
    q = (
        db.query(Channel, User)
        .join(User, User.user_id == Channel.user_id)
    )
    if actor:
        q = q.filter(User.user_id != actor.user_id)
    rows = q.all()
    random.shuffle(rows)
    rows = rows[:limit]
    return {
        "items": [
            {
                "channel_id": ch.channel_id,
                "user_id": u.user_id,
                "username": u.username,
                "display_name": u.display_name or u.username,
                "avatar_url": u.avatar_url,
                "is_live": bool(ch.is_live),
                "current_viewer_count": ch.current_viewer_count or 0,
            }
            for ch, u in rows
        ]
    }
@router.post("/become-devolo")
def become_devolo(db: Session = Depends(get_db), actor=Depends(get_current_user)):
    ch = get_or_create_channel(db, actor)
    return {
        "channel_id": ch.channel_id,
        "title": ch.title,
        "is_live": ch.is_live,
        "stream_key": ch.stream_key,
    }

@router.get("/{username}")
def channel(username: str, db: Session = Depends(get_db)):
    ch = get_channel_by_username(db, username)
    return {
        "channel_id": ch.channel_id,
        "user_id": ch.user_id,
        "title": ch.title,
        "is_live": ch.is_live,
        "current_viewer_count": ch.current_viewer_count,
        "live_thumbnail_url": ch.live_thumbnail_url,
        "current_category": ch.current_category,
    }
