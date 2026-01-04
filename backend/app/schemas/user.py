from pydantic import BaseModel, EmailStr

class PublicUser(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    display_name: str | None = None
    avatar_url: str | None = None
    banner_url: str | None = None
    bio: str | None = None
    follower_count: int = 0

    class Config:
        from_attributes = True

class UpdateProfileIn(BaseModel):
    display_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    banner_url: str | None = None
