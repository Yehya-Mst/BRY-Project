from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Channel(Base):
    __tablename__ = "channels"

    channel_id = Column(String(50), primary_key=True)
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    stream_key = Column(String(255), unique=True)
    title = Column(String(255))
    current_category = Column(String(50), ForeignKey("categories.category_id"))
    live_thumbnail_url = Column(Text)

    is_live = Column(Boolean, default=False, index=True)
    current_viewer_count = Column(Integer, default=0)
    last_live_at = Column(DateTime)

    panels = Column(Text)  # JSON-as-text for SQLite

    created_at = Column(DateTime, server_default=func.current_timestamp())

    user = relationship("User")
