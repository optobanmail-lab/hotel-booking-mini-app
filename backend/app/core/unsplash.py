import re
import time
import urllib.parse
import httpx
from app.core.config import settings

UNSPLASH_URL = "https://api.unsplash.com/search/photos"
USER_AGENT = "hotel-booking-mini-app/1.0"

# если API словили лимит/бан — не долбим дальше 30 минут
_API_DISABLED_UNTIL = 0

HOTEL_HINTS = (
    "hotel", "resort", "lobby", "suite", "bedroom", "room", "reception",
    "interior", "facade", "entrance", "accommodation"
)
BAD_HINTS = (
    "mountain", "cathedral", "mosque", "tower", "statue", "monument",
    "canyon", "lake", "bridge", "church", "landmark"
)

def _text(item: dict) -> str:
    return " ".join(
        x for x in [item.get("description"), item.get("alt_description")] if x
    ).lower()

def _short_query(q: str, max_words: int = 6) -> str:
    # вырезаем HTML и берём только первые слова (чтобы не было километровых запросов)
    words = re.findall(r"[A-Za-zА-Яа-я0-9]+", q or "")
    words = words[:max_words]
    if not words:
        return "hotel"
    return " ".join(words)

def _source_urls(query: str, n: int, seed: int = 1) -> list[str]:
    """
    source.unsplash.com не требует API key.
    Возвращает разные картинки за счёт sig.
    """
    q = _short_query(query, max_words=5)
    # для source лучше использовать теги через запятую
    tags = ",".join(re.findall(r"[A-Za-zА-Яа-я0-9]+", q)) or "hotel"
    tags_q = urllib.parse.quote(tags)

    # размер можно подогнать (для карточек норм 900x700)
    return [
        f"https://source.unsplash.com/900x700/?{tags_q}&sig={seed+i}"
        for i in range(n)
    ]

def search_photo_urls(query: str, per_page: int = 30, min_needed: int = 12) -> list[str]:
    """
    Возвращает список URL картинок.
    Сначала пытаемся Unsplash API. Если 401/403/429 — fallback на source.unsplash.com.
    """
    global _API_DISABLED_UNTIL

    query = _short_query(query, max_words=6)

    # если API временно отключен — отдаём source.unsplash.com
    if time.time() < _API_DISABLED_UNTIL:
        return _source_urls(query, n=min_needed, seed=int(time.time()) % 10000)

    # если ключа нет — сразу source.unsplash.com
    if not settings.unsplash_access_key:
        return _source_urls(query, n=min_needed, seed=int(time.time()) % 10000)

    headers = {
        "Authorization": f"Client-ID {settings.unsplash_access_key}",
        "Accept-Version": "v1",
        "User-Agent": USER_AGENT,
    }
    params = {
        "query": query,
        "per_page": per_page,
        "orientation": "landscape",
        "content_filter": "high",
    }

    try:
        with httpx.Client(timeout=20) as client:
            r = client.get(UNSPLASH_URL, headers=headers, params=params)
            r.raise_for_status()
            data = r.json()
    except httpx.HTTPStatusError as e:
        code = e.response.status_code
        print("Unsplash status error:", code)

        # 401/403/429 -> уходим на source.unsplash.com и не спамим API 30 минут
        if code in (401, 403, 429):
            _API_DISABLED_UNTIL = time.time() + 60 * 30
            return _source_urls(query, n=min_needed, seed=int(time.time()) % 10000)

        return []
    except Exception as e:
        print("Unsplash error:", repr(e))
        return _source_urls(query, n=min_needed, seed=int(time.time()) % 10000)

    results = data.get("results", [])
    good: list[str] = []
    fallback: list[str] = []

    for it in results:
        url = it["urls"]["regular"]
        fallback.append(url)

        t = _text(it)
        is_hotelish = any(k in t for k in HOTEL_HINTS)
        is_bad = any(k in t for k in BAD_HINTS)

        if is_hotelish and not is_bad:
            good.append(url)

    # добираем если фильтр строгий
    out = good
    if len(out) < min_needed:
        for u in fallback:
            if u not in out:
                out.append(u)
            if len(out) >= min_needed:
                break

    # если API вернул совсем пусто — fallback на source
    if not out:
        return _source_urls(query, n=min_needed, seed=int(time.time()) % 10000)

    return out