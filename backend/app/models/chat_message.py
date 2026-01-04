import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    stream_id = Column(String(50), ForeignKey("streams.stream_id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)

    content = Column(Text, nullable=False)

    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), server_default=func.current_timestamp(), index=True)

    user = relationship("User")
    stream = relationship("Stream")
