from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.admin_auth import create_admin_token, require_admin
from app.database.models import get_db, Hotel, RoomType, HotelPhoto, RoomTypePhoto
from app.services.media_enrich import enrich_hotel_and_rooms

router = APIRouter(prefix="/admin", tags=["admin"])

class AdminLoginIn(BaseModel):
    password: str

class AdminLoginOut(BaseModel):
    token: str

class HotelIn(BaseModel):
    name: str
    city: str
    address: str = ""
    lat: float = 0
    lng: float = 0
    rating: float = 4.6
    reviews_count: int = 120

class RoomIn(BaseModel):
    name_ru: str
    name_en: str | None = None
    name_kk: str | None = None
    price_per_night_kzt: int
    quantity: int = 1

@router.post("/login", response_model=AdminLoginOut)
def admin_login(payload: AdminLoginIn):
    if payload.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Wrong password")
    return AdminLoginOut(token=create_admin_token())

@router.get("/hotels")
def admin_hotels(db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    hotels = db.query(Hotel).order_by(Hotel.id.desc()).all()
    return [{"id": h.id, "name": h.name, "city": h.city, "address": h.address} for h in hotels]

@router.get("/hotels/{hotel_id}")
def admin_get_hotel(hotel_id: int, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    h = db.get(Hotel, hotel_id)
    if not h:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": h.id,
        "name": h.name,
        "city": h.city,
        "address": h.address,
        "lat": h.lat,
        "lng": h.lng,
        "rating": h.rating,
        "reviews_count": h.reviews_count,
        "rooms": [
            {
                "id": r.id,
                "hotel_id": r.hotel_id,
                "name_ru": r.name_ru,
                "name_en": r.name_en,
                "name_kk": r.name_kk,
                "price_per_night_kzt": r.price_per_night_kzt,
                "quantity": r.quantity,
            } for r in h.rooms
        ],
    }

@router.post("/hotels")
def admin_create_hotel(data: HotelIn, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    h = Hotel(
        name=data.name, city=data.city, address=data.address,
        lat=data.lat, lng=data.lng,
        rating=data.rating, reviews_count=data.reviews_count
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    return {"id": h.id}

@router.delete("/hotels/{hotel_id}")
def admin_delete_hotel(hotel_id: int, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    h = db.get(Hotel, hotel_id)
    if not h:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(h)
    db.commit()
    return {"ok": True}

@router.post("/hotels/{hotel_id}/rooms")
def admin_add_room(hotel_id: int, data: RoomIn, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    h = db.get(Hotel, hotel_id)
    if not h:
        raise HTTPException(status_code=404, detail="Hotel not found")
    r = RoomType(
        hotel_id=hotel_id,
        name_ru=data.name_ru, name_en=data.name_en, name_kk=data.name_kk,
        price_per_night_kzt=data.price_per_night_kzt, quantity=data.quantity
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"id": r.id}

@router.delete("/rooms/{room_id}")
def admin_delete_room(room_id: int, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    r = db.get(RoomType, room_id)
    if not r:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(r)
    db.commit()
    return {"ok": True}

@router.post("/hotels/{hotel_id}/refresh-photos")
def admin_refresh_photos(hotel_id: int, db: Session = Depends(get_db), _: bool = Depends(require_admin)):
    h = db.get(Hotel, hotel_id)
    if not h:
        raise HTTPException(status_code=404, detail="Hotel not found")

    db.query(HotelPhoto).filter(HotelPhoto.hotel_id == hotel_id).delete(synchronize_session=False)
    room_ids = [r.id for r in h.rooms]
    if room_ids:
        db.query(RoomTypePhoto).filter(RoomTypePhoto.room_type_id.in_(room_ids)).delete(synchronize_session=False)
    db.commit()

    enrich_hotel_and_rooms(db, h)
    return {"ok": True}