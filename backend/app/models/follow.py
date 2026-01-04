from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.sql import func
from app.db.base import Base

class Follow(Base):
    __tablename__ = "follows"

    follow_id = Column(String(50), primary_key=True)
    follower_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    followed_user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=False)

    __table_args__ = (
        UniqueConstraint("follower_id", "followed_user_id", name="uq_follows_follower_followed"),
        Index("ix_follows_pair", "follower_id", "followed_user_id"),
    )
