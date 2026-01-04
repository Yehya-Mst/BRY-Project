from pydantic import BaseModel

class ClipOut(BaseModel):
    clip_id: str
    stream_id: str
    creator_id: str
    title: str
    thumbnail_url: str | None = None
    duration_seconds: int
    view_count: int

    class Config:
        from_attributes = True
