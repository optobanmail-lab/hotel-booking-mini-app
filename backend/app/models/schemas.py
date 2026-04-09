from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List


class HotelCard(BaseModel):
    id: int
    name: str
    city: str
    address: str
    lat: float
    lng: float
    rating: float = Field(ge=0, le=5)
    reviews_count: int = Field(ge=0)
    price_from_kzt: int
    main_photo_url: Optional[str] = None


class RoomTypeOut(BaseModel):
    id: int
    name_ru: str
    name_en: Optional[str] = None
    name_kk: Optional[str] = None
    price_per_night_kzt: int
    quantity: int
    photo_urls: List[str] = []


class HotelDetails(BaseModel):
    id: int
    name: str
    city: str
    address: str
    lat: float
    lng: float
    rating: float
    reviews_count: int
    photo_urls: List[str]
    video_urls: List[str]
    rooms: List[RoomTypeOut]


class BookingCreate(BaseModel):
    hotel_id: int
    room_type_id: int
    check_in: date
    check_out: date
    adults: int = Field(ge=1, le=10)
    children: int = Field(ge=0, le=10)
    full_name: str
    phone: str
    city: str


class BookingOut(BaseModel):
    id: int
    status: str
    hotel_id: int
    room_type_id: int
    check_in: date
    check_out: date
    adults: int
    children: int
    full_name: str
    phone: str
    city: str
    total_price_kzt: int