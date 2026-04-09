from sqlalchemy.orm import Session
from app.core.unsplash import search_photo_urls
from app.database.models import Hotel, HotelPhoto, RoomTypePhoto

CITY_MAP = {
    "Алматы": "Almaty",
    "Астана": "Astana",
    "Шымкент": "Shymkent",
    "Караганда": "Karaganda",
    "Актобе": "Aktobe",
    "Атырау": "Atyrau",
}

def normalize_city(city: str) -> str:
    return CITY_MAP.get((city or "").strip(), (city or "").strip())

def _unique(seq: list[str]) -> list[str]:
    seen = set()
    out = []
    for x in seq:
        if x and x not in seen:
            seen.add(x)
            out.append(x)
    return out

def _pick_slice(pool: list[str], n: int, seed: int) -> list[str]:
    pool = _unique(pool)
    if not pool:
        return []
    start = (seed * 7) % len(pool)
    return [pool[(start + i) % len(pool)] for i in range(n)]

_CITY_POOL: dict[str, list[str]] = {}
_ROOM_POOL_STD: list[str] | None = None
_ROOM_POOL_DLX: list[str] | None = None

def _build_city_pool(city_en: str) -> list[str]:
    queries = [
        f"{city_en} hotel facade",
        f"{city_en} boutique hotel exterior",
        f"{city_en} resort entrance",
        "hotel facade exterior",
        "boutique hotel exterior",
    ]
    pool: list[str] = []
    for q in queries:
        pool += search_photo_urls(q, per_page=30, min_needed=12)
        pool = _unique(pool)
        if len(pool) >= 60:
            break
    if len(pool) < 20:
        pool += search_photo_urls("hotel exterior", per_page=30, min_needed=20)
    return _unique(pool)

def _build_room_pool(query: str) -> list[str]:
    pool = search_photo_urls(query, per_page=30, min_needed=20)
    if len(pool) < 15:
        pool += search_photo_urls("hotel room interior", per_page=30, min_needed=20)
    return _unique(pool)

def enrich_hotel_and_rooms(db: Session, hotel: Hotel):
    global _ROOM_POOL_STD, _ROOM_POOL_DLX

    if not hotel.photos:
        city_en = normalize_city(hotel.city)
        if city_en not in _CITY_POOL:
            _CITY_POOL[city_en] = _build_city_pool(city_en)
        chosen = _pick_slice(_CITY_POOL[city_en], 6, hotel.id)
        for i, url in enumerate(chosen, start=1):
            db.add(HotelPhoto(hotel_id=hotel.id, url=url, sort_order=i))

    if _ROOM_POOL_STD is None:
        _ROOM_POOL_STD = _build_room_pool("modern hotel room interior bed")
    if _ROOM_POOL_DLX is None:
        _ROOM_POOL_DLX = _build_room_pool("luxury hotel suite interior")

    for room in hotel.rooms:
        if room.photos:
            continue
        name = (room.name_en or room.name_ru or "").lower()
        pool = _ROOM_POOL_DLX if ("deluxe" in name or "люкс" in name) else _ROOM_POOL_STD
        chosen = _pick_slice(pool or [], 4, room.id)
        for i, url in enumerate(chosen, start=1):
            db.add(RoomTypePhoto(room_type_id=room.id, url=url, sort_order=i))

    db.commit()