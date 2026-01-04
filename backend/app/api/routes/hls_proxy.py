from __future__ import annotations

from typing import Optional

import httpx
from fastapi import APIRouter, Request, HTTPException, Response
from starlette.responses import StreamingResponse

from app.core.config import settings

router = APIRouter()

def _guess_content_type(path: str) -> str:
    p = (path or "").lower()
    if p.endswith(".m3u8"):
        return "application/vnd.apple.mpegurl"
    if p.endswith(".ts"):
        return "video/mp2t"
    return "application/octet-stream"

@router.get("/hls/{path:path}")
async def proxy_hls(path: str, request: Request):
    """
    Proxies HLS playlists and segments from the upstream HLS server defined by settings.HLS_BASE_URL.
    This avoids browser CORS issues and ensures the frontend can always fetch the playlist/segments
    from the same origin as the API.

    IMPORTANT: {path:path} is required so nested paths like:
      /hls/<stream>_720p2628kbs/index.m3u8
    are correctly captured.
    """
    upstream_base = settings.HLS_BASE_URL.rstrip("/")
    upstream_url = f"{upstream_base}/{path.lstrip('/')}"
    if request.url.query:
        upstream_url = f"{upstream_url}?{request.url.query}"

    # Forward range headers for TS segment requests
    headers = {}
    rng = request.headers.get("range")
    if rng:
        headers["range"] = rng

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, read=30.0)) as client:
            r = await client.get(upstream_url, headers=headers)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"HLS upstream unavailable: {e}")

    # Pass through status code (206 for range, 200 otherwise)
    status_code = r.status_code
    if status_code >= 400:
        # Provide a compact error while keeping status code
        return Response(content=r.content, status_code=status_code, media_type="text/plain")

    content_type = r.headers.get("content-type") or _guess_content_type(path)

    # Preserve some headers useful for streaming
    resp_headers = {}
    for k in ("accept-ranges", "content-range", "cache-control"):
        if k in r.headers:
            resp_headers[k] = r.headers[k]

    # Ensure no caching for live content
    resp_headers.setdefault("cache-control", "no-cache")

    # CORS (even though same-origin usually, it doesn't hurt and helps if API is on a different port)
    resp_headers["access-control-allow-origin"] = "*"

    return Response(content=r.content, status_code=status_code, media_type=content_type, headers=resp_headers)
