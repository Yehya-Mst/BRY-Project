import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.stream import Stream
from app.models.channel import Channel
from app.models.user import User
from app.models.category import Category

router = APIRouter()

@router.get("/streams/live")
def live_streams(db: Session = Depends(get_db)):
    rows = (
        db.query(Stream, Channel, User, Category)
        .join(Channel, Channel.channel_id == Stream.channel_id)
        .join(User, User.user_id == Channel.user_id)
        .join(Category, Category.category_id == Stream.category_id, isouter=True)
        .filter(Channel.is_live == True, Stream.ended_at.is_(None))
        .order_by((Channel.current_viewer_count).desc())
        .all()
    )

    items = []
    for s, ch, u, cat in rows:
        items.append({
            "stream_id": s.stream_id,
            "title": s.title,
            "thumbnail_url": s.thumbnail_url,
            "started_at": str(s.started_at) if s.started_at else None,
            "channel_id": ch.channel_id,
            "channel_username": u.username,
            "channel_display_name": u.display_name or u.username,
            "channel_avatar_url": u.avatar_url,
            "current_viewer_count": ch.current_viewer_count or 0,
            "category_id": s.category_id,
            "category_name": cat.name if cat else None,
        })

    return {"items": items}

@router.post("/streams/start")
def start_stream(payload: dict, db: Session = Depends(get_db), actor=Depends(get_current_user)):
    title = (payload or {}).get("title") or "Live stream"
    category_id = (payload or {}).get("category_id")

    ch = db.query(Channel).filter(Channel.user_id == actor.user_id).first()
    if not ch:
        raise HTTPException(status_code=400, detail="You must become a devolo first.")

    s = Stream(
        stream_id=str(uuid.uuid4()),
        channel_id=ch.channel_id,
        title=title,
        category_id=category_id,
        started_at=datetime.now(timezone.utc),
        ended_at=None,
        thumbnail_url=payload.get("thumbnail_url") if isinstance(payload, dict) else None,
    )
    db.add(s)
    ch.is_live = True
    db.commit()
    return {"ok": True, "stream_id": s.stream_id}

@router.post("/streams/stop/{stream_id}")
def stop_stream(stream_id: str, db: Session = Depends(get_db), actor=Depends(get_current_user)):
    s = db.query(Stream).filter(Stream.stream_id == stream_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Stream not found")

    ch = db.query(Channel).filter(Channel.channel_id == s.channel_id).first()
    if not ch or ch.user_id != actor.user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    s.ended_at = datetime.now(timezone.utc)
    ch.is_live = False
    db.commit()
    return {"ok": True}
