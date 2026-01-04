import uuid
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.channel import Channel
from app.models.stream import Stream
from app.models.clip import Clip
from app.core.security import hash_password

BOX = [
    "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1520975958225-6252a7f94c1f?auto=format&fit=crop&w=900&q=80",
]

THUMBS = [
    "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1605902711622-cfb43c44367f?auto=format&fit=crop&w=1200&q=80",
]

CLIPTH = [
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&w=900&q=80",
]

def seed_if_empty():
    db: Session = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        # Categories
        categories = [
            Category(category_id=str(uuid.uuid4()), name="Just Chatting", box_art=BOX[0], viewer_count=12840, streamer_count=240),
            Category(category_id=str(uuid.uuid4()), name="FPS Arena", box_art=BOX[1], viewer_count=8420, streamer_count=180),
            Category(category_id=str(uuid.uuid4()), name="Coding Live", box_art=BOX[2], viewer_count=3210, streamer_count=64),
        ]
        db.add_all(categories)
        db.commit()

        # Users
        users = []
        for i, uname in enumerate(["neonwolf", "charcoalqueen", "pinkpulse", "emeraldbyte"]):
            users.append(User(
                user_id=str(uuid.uuid4()),
                username=uname,
                email=f"{uname}@example.com",
                password_hash=hash_password("password123"),
                display_name=uname.title(),
                avatar_url=f"https://api.dicebear.com/7.x/thumbs/svg?seed={uname}",
                banner_url=THUMBS[i % len(THUMBS)],
                bio="Creator on DEVOLO. Streaming and clipping daily.",
                follower_count=1200 + i * 333,
            ))
        db.add_all(users)
        db.commit()

        # Channels
        channels = []
        for i, u in enumerate(users):
            channels.append(Channel(
                channel_id=str(uuid.uuid4()),
                user_id=u.user_id,
                stream_key=str(uuid.uuid4()),
                title=f"{u.display_name} on DEVOLO",
                current_category=categories[i % len(categories)].category_id,
                live_thumbnail_url=THUMBS[i % len(THUMBS)],
                is_live=True if i < 2 else False,
                current_viewer_count=900 - i * 130 if i < 2 else 0,
                panels=None,
            ))
        db.add_all(channels)
        db.commit()

        # Streams (2 live)
        streams = []
        for i in range(2):
            streams.append(Stream(
                stream_id=str(uuid.uuid4()),
                channel_id=channels[i].channel_id,
                category_id=channels[i].current_category,
                title=f"Live Session #{i+1}",
                thumbnail_url=THUMBS[i],
                stream_server="placeholder",
                stream_key=channels[i].stream_key,
            ))
        db.add_all(streams)
        db.commit()

        # Clips
        clips = []
        for i in range(18):
            creator = users[i % len(users)]
            stream = streams[i % len(streams)]
            clips.append(Clip(
                clip_id=str(uuid.uuid4()),
                stream_id=stream.stream_id,
                creator_id=creator.user_id,
                title=f"Top Clip {i+1}: Neon Moment",
                clip_url="https://example.com/clip.mp4",
                thumbnail_url=CLIPTH[i % len(CLIPTH)],
                duration_seconds=15 + (i % 45),
                view_count=5000 - i * 137,
            ))
        db.add_all(clips)
        db.commit()
    finally:
        db.close()
