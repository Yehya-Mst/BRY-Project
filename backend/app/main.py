from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.db.session import engine
from app.db.base import Base

# Import models here to register them on Base.metadata (avoids circular import in db/base.py)
from app.models.user import User  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.channel import Channel  # noqa: F401
from app.models.stream import Stream  # noqa: F401
from app.models.clip import Clip  # noqa: F401
from app.models.follow import Follow  # noqa: F401
from app.models.chat_message import ChatMessage  # noqa: F401

from app.seed.seed_data import seed_if_empty

def create_app() -> FastAPI:
    app = FastAPI(title="DEVOLO API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    Base.metadata.create_all(bind=engine)
    seed_if_empty()

    app.include_router(api_router)
    return app

app = create_app()
