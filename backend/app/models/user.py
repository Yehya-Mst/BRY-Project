from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(50), primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)

    display_name = Column(String(100))
    avatar_url = Column(Text)
    banner_url = Column(Text)
    bio = Column(Text)

    favorite_category_ids = Column(Text)  # JSON list of category_id strings (SQLite-friendly)

    created_at = Column(DateTime, server_default=func.current_timestamp())
    last_login = Column(DateTime)

    is_partner = Column(Boolean, default=False)
    is_affiliate = Column(Boolean, default=False)

    follower_count = Column(Integer, default=0)
