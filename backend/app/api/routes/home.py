import random
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user_optional
from app.models.stream import Stream
from app.models.channel import Channel
from app.models.user import User
from app.models.clip import Clip
from app.models.category import Category

router = APIRouter()

@router.get("/home")
def home(db: Session = Depends(get_db), actor: Optional[User] = Depends(get_current_user_optional)):
    # live (top 9)
    # live (top 9)
    live_q = (
        db.query(Stream, Channel, User, Category)
        .join(Channel, Channel.channel_id == Stream.channel_id)
        .join(User, User.user_id == Channel.user_id)
        .join(Category, Category.category_id == Stream.category_id, isouter=True)
        .filter(Channel.is_live == True, Stream.ended_at.is_(None))
    )

    if actor:
        live_q = live_q.filter(User.user_id != actor.user_id)

    live_rows = (
        live_q.order_by((Channel.current_viewer_count).desc())
        .limit(9)
        .all()
    )

    live = []
    for s, ch, u, cat in live_rows:
        live.append({
            "stream_id": s.stream_id,
            "title": s.title,
            "thumbnail_url": s.thumbnail_url,
            "started_at": str(s.started_at) if s.started_at else None,
            "channel_id": ch.channel_id,
            "channel_username": u.username,
            "channel_display_name": u.display_name or u.username,
            "channel_avatar_url": u.avatar_url,
            "viewer_count": ch.current_viewer_count or 0,
            "category_id": s.category_id,
            "category_name": cat.name if cat else None,
        })

    # clips (top 20 by view_count)
    #
    # IMPORTANT: your Clip model does NOT have channel_id.
    # We reach Channel through Stream: Clip.stream_id -> Stream.channel_id -> Channel.user_id -> User
    #
    clip_q = (
        db.query(Clip, Stream, Channel, User, Category)
        .join(Stream, Stream.stream_id == Clip.stream_id)
        .join(Channel, Channel.channel_id == Stream.channel_id)
        .join(User, User.user_id == Channel.user_id)
        # Try clip.category_id if it exists; if not, Stream.category_id will be used by SQLAlchemy only if
        # Clip.category_id is missing at model level this join may fail. We keep it simple:
        .join(Category, Category.category_id == Stream.category_id, isouter=True)
    )

    if actor:
        clip_q = clip_q.filter(User.user_id != actor.user_id)

    clip_rows = (
        clip_q.order_by(Clip.view_count.desc())
        .limit(20)
        .all()
    )

    clips = []
    for c, s, ch, u, cat in clip_rows:
        clips.append({
            "clip_id": c.clip_id,
            "title": c.title,
            "thumbnail_url": c.thumbnail_url,
            "duration_seconds": c.duration_seconds,
            "view_count": c.view_count,
            "stream_id": c.stream_id,
            "channel_id": ch.channel_id,
            "channel_username": u.username,
            "channel_display_name": u.display_name or u.username,
            "channel_avatar_url": u.avatar_url,
            "category_id": s.category_id,
            "category_name": cat.name if cat else None,
        })

    return {"live": live, "clips": clips}
