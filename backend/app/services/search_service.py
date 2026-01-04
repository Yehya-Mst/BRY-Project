from sqlalchemy.orm import Session
from app.models.user import User
from app.models.category import Category

def search(db: Session, query: str | None, category_id: str | None):
    results = []
    q = (query or "").strip()

    if q:
        users = db.query(User).filter(User.username.ilike(f"%{q}%")).limit(10).all()
        for u in users:
            results.append({
                "type": "user",
                "id": u.user_id,
                "title": u.username,
                "subtitle": u.bio or "",
                "image": u.avatar_url,
            })

        cats = db.query(Category).filter(Category.name.ilike(f"%{q}%")).limit(10).all()
        for c in cats:
            results.append({
                "type": "category",
                "id": c.category_id,
                "title": c.name,
                "subtitle": f"{c.viewer_count} viewers",
                "image": c.box_art,
            })

    if category_id:
        c = db.query(Category).filter(Category.category_id == category_id).first()
        if c:
            results.insert(0, {
                "type": "category",
                "id": c.category_id,
                "title": c.name,
                "subtitle": f"{c.viewer_count} viewers",
                "image": c.box_art,
            })

    return results[:20]
