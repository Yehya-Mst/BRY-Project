from pydantic import BaseModel

class StartStreamIn(BaseModel):
    title: str
    category_id: str | None = None

class StreamOut(BaseModel):
    stream_id: str
    channel_id: str
    title: str
    thumbnail_url: str | None = None
    started_at: str
    ended_at: str | None = None

    class Config:
        from_attributes = True
