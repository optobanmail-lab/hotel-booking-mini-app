from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.models import get_db, Hotel
from app.models.schemas import HotelCard, HotelDetails, RoomTypeOut

router = APIRouter(prefix="/hotels", tags=["hotels"])

@router.get("", response_model=list[HotelCard])
def list_hotels(city: str = Query(""), db: Session = Depends(get_db)):
    city = (city or "").strip()
    q = select(Hotel)
    if city:
        q = q.where(Hotel.city.ilike(f"%{city}%"))

    hotels = db.execute(q).scalars().all()

    result: list[HotelCard] = []
    for h in hotels:
        prices = [r.price_per_night_kzt for r in h.rooms] if h.rooms else [0]
        main_photo = h.photos[0].url if h.photos else None
        result.append(HotelCard(
            id=h.id,
            name=h.name,
            city=h.city,
            address=h.address,
            lat=h.lat,
            lng=h.lng,
            rating=h.rating,
            reviews_count=h.reviews_count,
            price_from_kzt=min(prices),
            main_photo_url=main_photo
        ))
    return result

@router.get("/{hotel_id}", response_model=HotelDetails)
def get_hotel(hotel_id: int, db: Session = Depends(get_db)):
    hotel = db.get(Hotel, hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    rooms = [RoomTypeOut(
        id=r.id,
        name_ru=r.name_ru,
        name_en=r.name_en,
        name_kk=r.name_kk,
        price_per_night_kzt=r.price_per_night_kzt,
        quantity=r.quantity,
        photo_urls=[p.url for p in r.photos],
    ) for r in hotel.rooms]

    return HotelDetails(
        id=hotel.id,
        name=hotel.name,
        city=hotel.city,
        address=hotel.address,
        lat=hotel.lat,
        lng=hotel.lng,
        rating=hotel.rating,
        reviews_count=hotel.reviews_count,
        photo_urls=[p.url for p in hotel.photos],
        video_urls=[v.youtube_url for v in hotel.videos],
        rooms=rooms
    )