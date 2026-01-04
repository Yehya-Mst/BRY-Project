from fastapi import APIRouter
from app.api.routes import auth, users, channels, streams, clips, search, home, categories, follows, me, hls_proxy

api_router = APIRouter()
api_router.include_router(auth.router, prefix="", tags=["auth"])
api_router.include_router(users.router, prefix="", tags=["users"])
api_router.include_router(channels.router, prefix="/channels", tags=["channels"])
api_router.include_router(streams.router, prefix="/streams", tags=["streams"])
api_router.include_router(clips.router, prefix="", tags=["clips"])
api_router.include_router(search.router, prefix="", tags=["search"])
api_router.include_router(home.router, prefix="", tags=["home"])
api_router.include_router(categories.router, prefix="", tags=["categories"])
api_router.include_router(follows.router, prefix="", tags=["follows"])
api_router.include_router(me.router, prefix="", tags=["me"]) 

api_router.include_router(hls_proxy.router, prefix="", tags=["hls"]) 
