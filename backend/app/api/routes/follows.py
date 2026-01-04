import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.follow import Follow
from app.models.user import User

router = APIRouter()


def _get_user_by_username(db: Session, username: str) -> User:
    u = db.query(User).filter(User.username == username).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@router.get("/follows/status")
def follow_status(
    username: str = Query(...),
    db: Session = Depends(get_db),
    actor=Depends(get_current_user),
):
    target = _get_user_by_username(db, username)
    if target.user_id == actor.user_id:
        return {"following": False}

    exists = (
        db.query(Follow)
        .filter(
            Follow.follower_id == actor.user_id,
            Follow.followed_user_id == target.user_id,
        )
        .first()
    )
    return {"following": bool(exists)}


@router.post("/follows/{username}")
def follow_user(username: str, db: Session = Depends(get_db), actor=Depends(get_current_user)):
    target = _get_user_by_username(db, username)
    if target.user_id == actor.user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    exists = (
        db.query(Follow)
        .filter(
            Follow.follower_id == actor.user_id,
            Follow.followed_user_id == target.user_id,
        )
        .first()
    )
    if exists:
        return {"ok": True, "following": True}

    f = Follow(
        follow_id=str(uuid.uuid4()),
        follower_id=actor.user_id,
        followed_user_id=target.user_id,
    )
    db.add(f)

    # optional: keep counter correct
    target.follower_count = int(target.follower_count or 0) + 1

    db.commit()
    return {"ok": True, "following": True}


@router.delete("/follows/{username}")
def unfollow_user(username: str, db: Session = Depends(get_db), actor=Depends(get_current_user)):
    target = _get_user_by_username(db, username)
    row = (
        db.query(Follow)
        .filter(
            Follow.follower_id == actor.user_id,
            Follow.followed_user_id == target.user_id,
        )
        .first()
    )
    if row:
        db.delete(row)
        target.follower_count = max(0, int(target.follower_count or 0) - 1)
        db.commit()
    return {"ok": True, "following": False}


@router.get("/follows/following")
def following(db: Session = Depends(get_db), actor=Depends(get_current_user)):
    rows = (
        db.query(Follow, User)
        .join(User, User.user_id == Follow.followed_user_id)
        .filter(Follow.follower_id == actor.user_id)
        .order_by(Follow.created_at.asc())
        .all()
    )
    return {
        "items": [
            {
                "user_id": u.user_id,
                "username": u.username,
                "display_name": u.display_name or u.username,
                "avatar_url": u.avatar_url,
                "followed_at": str(f.created_at) if f.created_at else None,
            }
            for f, u in rows
        ]
    }
