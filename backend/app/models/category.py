from sqlalchemy import Column, String, Integer, Text
from app.db.base import Base

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(String(50), primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    box_art = Column(Text)
    viewer_count = Column(Integer, default=0)
    streamer_count = Column(Integer, default=0)
