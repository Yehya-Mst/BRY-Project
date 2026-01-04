import uuid
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.stream import Stream
from app.models.channel import Channel

PLACEHOLDER_THUMBS = [
    "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
]

def start_stream(
    db: Session,
    channel: Channel,
    title: str,
    category_id: str | None,
    thumbnail_url: str | None = None,
) -> Stream:
    # Enforce only one active stream per channel
    active = db.query(Stream).filter(Stream.channel_id == channel.channel_id, Stream.ended_at.is_(None)).first()
    if active:
        raise HTTPException(status_code=400, detail="Channel already has an active stream")

    thumb = thumbnail_url or PLACEHOLDER_THUMBS[hash(title) % len(PLACEHOLDER_THUMBS)]

    s = Stream(
        stream_id=str(uuid.uuid4()),
        channel_id=channel.channel_id,
        category_id=category_id,
        title=title,
        thumbnail_url=thumb,
        started_at=datetime.now(timezone.utc),
        stream_server="placeholder",
        stream_key=channel.stream_key,
    )
    db.add(s)
    channel.is_live = True
    channel.last_live_at = datetime.now(timezone.utc)
    channel.live_thumbnail_url = s.thumbnail_url
    channel.current_viewer_count = 42  # demo
    db.commit()
    db.refresh(s)
    return s

def stop_stream(db: Session, channel: Channel, stream_id: str) -> Stream:
    s = db.query(Stream).filter(Stream.stream_id == stream_id, Stream.channel_id == channel.channel_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Stream not found")
    if s.ended_at is not None:
        return s

    s.ended_at = datetime.now(timezone.utc)
    channel.is_live = False
    channel.current_viewer_count = 0
    db.commit()
    db.refresh(s)
    return s

def list_live_streams(db: Session):
    return db.query(Stream).join(Channel, Stream.channel_id == Channel.channel_id).filter(Channel.is_live == True, Stream.ended_at.is_(None)).order_by(Stream.started_at.desc()).all()
