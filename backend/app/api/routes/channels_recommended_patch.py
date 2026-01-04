import random
from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.models.channel import Channel
from app.models.user import User

def recommended_channels(limit: int, db: Session):
    rows = (
        db.query(Channel, User)
        .join(User, User.user_id == Channel.user_id)
        .all()
    )

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
