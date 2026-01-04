from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Stream(Base):
    __tablename__ = "streams"

    stream_id = Column(String(50), primary_key=True)
    channel_id = Column(String(50), ForeignKey("channels.channel_id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(String(50), ForeignKey("categories.category_id"))

    title = Column(String(255), nullable=False)
    thumbnail_url = Column(Text)

    started_at = Column(DateTime, server_default=func.current_timestamp(), nullable=False, index=True)
    ended_at = Column(DateTime)

    peak_viewers = Column(Integer, default=0)
    average_viewers = Column(Integer, default=0)

    stream_server = Column(Text)
    stream_key = Column(Text)

    channel = relationship("Channel")
