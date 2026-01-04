import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.core.config import settings
from app.models.stream import Stream
from app.models.channel import Channel
from app.models.user import User
from app.models.category import Category
from app.models.chat_message import ChatMessage

from app.services import stream_service

router = APIRouter()

@router.get("/live")
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

@router.post("/start")
def start_stream(payload: dict, db: Session = Depends(get_db), actor=Depends(get_current_user)):
    title = (payload or {}).get("title") or "Live stream"
    category_id = (payload or {}).get("category_id")

    ch = db.query(Channel).filter(Channel.user_id == actor.user_id).first()
    if not ch:
        raise HTTPException(status_code=400, detail="You must become a devolo first.")

    thumb = payload.get("thumbnail_url") if isinstance(payload, dict) else None
    s = stream_service.start_stream(db, ch, title=title, category_id=category_id, thumbnail_url=thumb)
    return {"ok": True, "stream_id": s.stream_id}


@router.get("/{stream_id}")
def get_stream(stream_id: str, db: Session = Depends(get_db)):
    row = (
        db.query(Stream, Channel, User, Category)
        .join(Channel, Channel.channel_id == Stream.channel_id)
        .join(User, User.user_id == Channel.user_id)
        .join(Category, Category.category_id == Stream.category_id, isouter=True)
        .filter(Stream.stream_id == stream_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Stream not found")

    s, ch, u, cat = row

    # If you have an HLS server (e.g., nginx-rtmp) this will typically be:
    #   {HLS_BASE_URL}/{stream_key}.m3u8
    playback_url = None
    if ch.stream_key:
        public_base = settings.PUBLIC_BASE_URL.rstrip("/")
        playback_url = f"{public_base}/hls/{ch.stream_key}.m3u8"

    def dt(v):

        return v.isoformat() if v else None

    return {
        "stream_id": s.stream_id,
        "title": s.title,
        "thumbnail_url": s.thumbnail_url,
        "started_at": dt(s.started_at),
        "ended_at": dt(s.ended_at),
        "is_live": s.ended_at is None and bool(ch.is_live),
        "channel_id": ch.channel_id,
        "channel_username": u.username,
        "channel_display_name": u.display_name or u.username,
        "channel_avatar_url": u.avatar_url,
        "current_viewer_count": ch.current_viewer_count or 0,
        "category_id": s.category_id,
        "category_name": cat.name if cat else None,
        "playback_url": playback_url,
    }


@router.get("/{stream_id}/chat")
def list_chat_messages(
    stream_id: str,
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    since: str | None = Query(None, description="ISO datetime. Return messages created after this timestamp."),
):
    # Ensure stream exists
    exists = db.query(Stream.stream_id).filter(Stream.stream_id == stream_id).first()
    if not exists:
        raise HTTPException(status_code=404, detail="Stream not found")

    q = (
        db.query(ChatMessage, User)
        .join(User, User.user_id == ChatMessage.user_id)
        .filter(ChatMessage.stream_id == stream_id)
    )

    if since:
        try:
            # Python 3.11+ accepts ISO strings with Z or offset.
            dt_since = datetime.fromisoformat(since.replace("Z", "+00:00"))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid 'since' timestamp")
        q = q.filter(ChatMessage.created_at > dt_since)

    rows = q.order_by(ChatMessage.created_at.asc()).limit(limit).all()

    items = []
    for m, u in rows:
        items.append(
            {
                "message_id": m.message_id,
                "stream_id": m.stream_id,
                "user_id": m.user_id,
                "username": u.username,
                "display_name": u.display_name or u.username,
                "avatar_url": u.avatar_url,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
        )

    return {"items": items}


@router.post("/{stream_id}/chat")
def send_chat_message(
    stream_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    actor=Depends(get_current_user),
):
    content = (payload or {}).get("content")
    content = (content or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(content) > 500:
        raise HTTPException(status_code=400, detail="Message too long (max 500 chars)")

    # Ensure stream exists and is live
    s = db.query(Stream).filter(Stream.stream_id == stream_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Stream not found")

    if s.ended_at is not None:
        raise HTTPException(status_code=400, detail="Stream has ended")

    m = ChatMessage(
        message_id=str(uuid.uuid4()),
        stream_id=stream_id,
        user_id=actor.user_id,
        content=content,
        created_at=datetime.now(timezone.utc),
    )
    db.add(m)
    db.commit()
    db.refresh(m)

    return {
        "ok": True,
        "message": {
            "message_id": m.message_id,
            "stream_id": m.stream_id,
            "user_id": m.user_id,
            "username": actor.username,
            "display_name": actor.display_name or actor.username,
            "avatar_url": actor.avatar_url,
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        },
    }

@router.post("/stop/{stream_id}")
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
