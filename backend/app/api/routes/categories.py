import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.category import Category
from app.models.stream import Stream
from app.models.channel import Channel
from app.models.user import User

router = APIRouter()

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).order_by(Category.viewer_count.desc()).all()
    return {
        "items": [
            {
                "category_id": c.category_id,
                "name": c.name,
                "box_art": c.box_art,
                "viewer_count": c.viewer_count,
                "streamer_count": c.streamer_count,
            }
            for c in cats
        ]
    }

@router.get("/categories/samples")
def category_samples(
    per: int = Query(default=3, ge=1, le=10),
    db: Session = Depends(get_db),
):
    cats = db.query(Category).order_by(Category.viewer_count.desc()).all()
    out = []

    for c in cats:
        # get live streams in this category
        rows = (
            db.query(Stream, Channel, User)
            .join(Channel, Channel.channel_id == Stream.channel_id)
            .join(User, User.user_id == Channel.user_id)
            .filter(Channel.is_live == True, Stream.ended_at.is_(None))
            .filter(Stream.category_id == c.category_id)
            .all()
        )

        random.shuffle(rows)
        rows = rows[:per]

        streams = []
        for s, ch, u in rows:
            streams.append({
                "stream_id": s.stream_id,
                "title": s.title,
                "thumbnail_url": s.thumbnail_url,
                "started_at": str(s.started_at),
                "channel_username": u.username,
                "channel_display_name": u.display_name or u.username,
                "channel_avatar_url": u.avatar_url,
                "category_id": c.category_id,
                "category_name": c.name,
                "viewer_count": ch.current_viewer_count or 0,
            })

        out.append({
            "category_id": c.category_id,
            "name": c.name,
            "box_art": c.box_art,
            "viewer_count": c.viewer_count,
            "samples": streams,
        })

    return {"items": out}
