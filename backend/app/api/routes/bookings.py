from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.models import get_db, Booking, RoomType, User
from app.models.schemas import BookingCreate, BookingOut

router = APIRouter(prefix="/bookings", tags=["bookings"])

def get_telegram_id(x_telegram_id: int | None = Header(default=1)) -> int:
    return int(x_telegram_id)

def get_or_create_user(db: Session, telegram_id: int) -> User:
    user = db.execute(select(User).where(User.telegram_id == telegram_id)).scalar_one_or_none()
    if user:
        return user
    user = User(telegram_id=telegram_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("", response_model=BookingOut)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db), telegram_id: int = Depends(get_telegram_id)):
    user = get_or_create_user(db, telegram_id)
    room = db.get(RoomType, payload.room_type_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room type not found")

    nights = (payload.check_out - payload.check_in).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="check_out must be after check_in")

    total = nights * room.price_per_night_kzt

    b = Booking(
        user_id=user.id,
        hotel_id=payload.hotel_id,
        room_type_id=payload.room_type_id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        adults=payload.adults,
        children=payload.children,
        full_name=payload.full_name,
        phone=payload.phone,
        city=payload.city,
        total_price_kzt=total,
        status="confirmed",
    )
    db.add(b)
    db.commit()
    db.refresh(b)

    return BookingOut(
        id=b.id, status=b.status, hotel_id=b.hotel_id, room_type_id=b.room_type_id,
        check_in=b.check_in, check_out=b.check_out,
        adults=b.adults, children=b.children,
        full_name=b.full_name, phone=b.phone, city=b.city,
        total_price_kzt=b.total_price_kzt
    )

@router.get("/my", response_model=list[BookingOut])
def my_bookings(db: Session = Depends(get_db), telegram_id: int = Depends(get_telegram_id)):
    user = get_or_create_user(db, telegram_id)
    bookings = db.query(Booking).filter(Booking.user_id == user.id).order_by(Booking.id.desc()).all()
    return [
        BookingOut(
            id=b.id, status=b.status, hotel_id=b.hotel_id, room_type_id=b.room_type_id,
            check_in=b.check_in, check_out=b.check_out,
            adults=b.adults, children=b.children,
            full_name=b.full_name, phone=b.phone, city=b.city,
            total_price_kzt=b.total_price_kzt
        )
        for b in bookings
    ]

@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), telegram_id: int = Depends(get_telegram_id)):
    user = get_or_create_user(db, telegram_id)
    b = db.get(Booking, booking_id)
    if not b or b.user_id != user.id:
        raise HTTPException(status_code=404, detail="Booking not found")
    b.status = "cancelled"
    db.commit()
    db.refresh(b)
    return BookingOut(
        id=b.id, status=b.status, hotel_id=b.hotel_id, room_type_id=b.room_type_id,
        check_in=b.check_in, check_out=b.check_out,
        adults=b.adults, children=b.children,
        full_name=b.full_name, phone=b.phone, city=b.city,
        total_price_kzt=b.total_price_kzt
    )