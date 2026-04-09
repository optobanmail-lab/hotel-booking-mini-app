import time
import jwt
from fastapi import Header, HTTPException
from app.core.config import settings

ALGO = "HS256"


def create_admin_token() -> str:
    payload = {
        "role": "admin",
        "iat": int(time.time()),
        "exp": int(time.time()) + 60 * 60 * 6,  # 6 hours
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGO)


def require_admin(authorization: str | None = Header(default=None)) -> bool:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGO])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    return True