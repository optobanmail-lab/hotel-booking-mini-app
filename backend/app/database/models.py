from __future__ import annotations

from datetime import datetime, date

from sqlalchemy import (
    create_engine,
    String,
    Integer,
    Float,
    ForeignKey,
    Date,
    DateTime,
    func,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
    sessionmaker,
)

from app.core.config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    telegram_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    bookings: Mapped[list["Booking"]] = relationship(back_populates="user")


class Hotel(Base):
    __tablename__ = "hotels"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    city: Mapped[str] = mapped_column(String(100), index=True)
    address: Mapped[str] = mapped_column(String(255))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    rooms: Mapped[list["RoomType"]] = relationship(back_populates="hotel", cascade="all, delete-orphan")
    photos: Mapped[list["HotelPhoto"]] = relationship(back_populates="hotel", cascade="all, delete-orphan")
    videos: Mapped[list["HotelVideo"]] = relationship(back_populates="hotel", cascade="all, delete-orphan")


class RoomType(Base):
    __tablename__ = "room_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), index=True)

    name_ru: Mapped[str] = mapped_column(String(120))
    name_en: Mapped[str | None] = mapped_column(String(120), nullable=True)
    name_kk: Mapped[str | None] = mapped_column(String(120), nullable=True)

    price_per_night_kzt: Mapped[int] = mapped_column(Integer)
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    hotel: Mapped["Hotel"] = relationship(back_populates="rooms")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="room_type")
    photos: Mapped[list["RoomTypePhoto"]] = relationship(back_populates="room_type", cascade="all, delete-orphan")


class RoomTypePhoto(Base):
    __tablename__ = "room_type_photos"
    id: Mapped[int] = mapped_column(primary_key=True)
    room_type_id: Mapped[int] = mapped_column(ForeignKey("room_types.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    room_type: Mapped["RoomType"] = relationship(back_populates="photos")


class HotelPhoto(Base):
    __tablename__ = "hotel_photos"
    id: Mapped[int] = mapped_column(primary_key=True)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    hotel: Mapped["Hotel"] = relationship(back_populates="photos")


class HotelVideo(Base):
    __tablename__ = "hotel_videos"
    id: Mapped[int] = mapped_column(primary_key=True)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), index=True)
    youtube_url: Mapped[str] = mapped_column(String(500))
    hotel: Mapped["Hotel"] = relationship(back_populates="videos")


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), index=True)
    room_type_id: Mapped[int] = mapped_column(ForeignKey("room_types.id", ondelete="CASCADE"), index=True)

    check_in: Mapped[date] = mapped_column(Date)
    check_out: Mapped[date] = mapped_column(Date)

    adults: Mapped[int] = mapped_column(Integer, default=1)
    children: Mapped[int] = mapped_column(Integer, default=0)

    full_name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(30))
    city: Mapped[str] = mapped_column(String(100))

    total_price_kzt: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(30), default="confirmed")

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="bookings")
    room_type: Mapped["RoomType"] = relationship(back_populates="bookings")
    hotel: Mapped["Hotel"] = relationship()