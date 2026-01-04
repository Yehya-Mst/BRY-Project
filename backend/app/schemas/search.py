from pydantic import BaseModel

class SearchResult(BaseModel):
    type: str
    id: str
    title: str
    subtitle: str | None = None
    image: str | None = None
