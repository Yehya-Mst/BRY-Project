# DEVOLO (Monorepo)

## Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

## Frontend
cd ../frontend
npm install
npm run dev

Notes:
- Dark/light theme toggle included.
- Neon emerald + deep charcoal + pink palette baked in.
- MVC-ish backend layering (routes/controllers + services + models + schemas).
- Streaming is placeholder; start/stop is stateful in DB and enforces one active stream per channel.
