from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Clip(Base):
    __tablename__ = "clips"

    clip_id = Column(String(50), primary_key=True)
    stream_id = Column(String(50), ForeignKey("streams.stream_id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(String(50), ForeignKey("users.user_id"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    clip_url = Column(Text, nullable=False)
    thumbnail_url = Column(Text)

    duration_seconds = Column(Integer, nullable=False)
    view_count = Column(Integer, default=0, index=True)

    created_at = Column(DateTime, server_default=func.current_timestamp())
    published_at = Column(DateTime)

    creator = relationship("User")
    stream = relationship("Stream")
