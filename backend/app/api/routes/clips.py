from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.services.clip_service import list_clips, list_user_clips
from app.services.user_service import get_profile
from app.models.category import Category

router = APIRouter()


def _clip_to_card(db_cat_map: dict, c):
    s = c.stream
    ch = s.channel if s else None
    u = ch.user if ch else None
    return {
        "clip_id": c.clip_id,
        "title": c.title,
        "thumbnail_url": c.thumbnail_url,
        "duration_seconds": c.duration_seconds,
        "view_count": c.view_count,
        "channel": {
            "username": u.username,
            "display_name": (u.display_name or u.username),
            "avatar_url": u.avatar_url,
        }
        if u
        else None,
        "category": {
            "category_id": (s.category_id if s else None),
            "name": (db_cat_map.get(s.category_id) if s else None),
        },
    }


@router.get("/clips")
def clips(db: Session = Depends(get_db)):
    cat_map = {c.category_id: c.name for c in db.query(Category).all()}
    return [_clip_to_card(cat_map, c) for c in list_clips(db)]


@router.get("/profile/{username}/clips")
def profile_clips(username: str, db: Session = Depends(get_db)):
    u = get_profile(db, username)
    cat_map = {c.category_id: c.name for c in db.query(Category).all()}
    return [_clip_to_card(cat_map, c) for c in list_user_clips(db, u)]
