import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.follow import Follow

def follow_user(db: Session, actor: User, target_username: str) -> None:
    if actor.username == target_username:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    target = db.query(User).filter(User.username == target_username).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(Follow)
        .filter(Follow.follower_user_id == actor.user_id, Follow.following_user_id == target.user_id)
        .first()
    )
    if existing:
        return

    f = Follow(
        follow_id=str(uuid.uuid4()),
        follower_user_id=actor.user_id,
        following_user_id=target.user_id,
    )
    db.add(f)
    db.commit()

def unfollow_user(db: Session, actor: User, target_username: str) -> None:
    target = db.query(User).filter(User.username == target_username).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = (
        db.query(Follow)
        .filter(Follow.follower_user_id == actor.user_id, Follow.following_user_id == target.user_id)
        .first()
    )
    if not existing:
        return

    db.delete(existing)
    db.commit()

def list_following_usernames(db: Session, actor: User) -> list[str]:
    rows = (
        db.query(User.username)
        .join(Follow, Follow.following_user_id == User.user_id)
        .filter(Follow.follower_user_id == actor.user_id)
        .all()
    )
    return [r[0] for r in rows]

def is_following(db: Session, actor: User, target_username: str) -> bool:
    target = db.query(User).filter(User.username == target_username).first()
    if not target:
        return False
    existing = (
        db.query(Follow)
        .filter(Follow.follower_user_id == actor.user_id, Follow.following_user_id == target.user_id)
        .first()
    )
    return existing is not None
