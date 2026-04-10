import random

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.routes.admin import router as admin_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.hotels import router as hotels_router
from app.api.routes.news import router as news_router
from app.core.config import settings
from app.database.models import Base, engine, SessionLocal, Hotel, RoomType, HotelVideo
from app.services.media_enrich import enrich_hotel_and_rooms


app = FastAPI(title="Hotel Booking API")

# --- CORS ---
# 1) origins из settings.cors_origins (если ты задаёшь в .env/Render)
origins_from_env = [o.strip() for o in (settings.cors_origins or "").split(",") if o.strip()]

# 2) origins по умолчанию (локалка + твой Cloudflare Pages домен БЕЗ слэша в конце)
default_origins = [
    "http://localhost:5173",  # vite dev
    "http://localhost:4173",  # vite preview
    "https://hotel-booking-mini-app.pages.dev",  # prod Pages (без / в конце)
]

# Итоговый список: если в env что-то задано — добавим к дефолтным
origins = list(dict.fromkeys(default_origins + origins_from_env))  # уникальные, сохраняя порядок

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Чтобы работали все preview деплои Cloudflare Pages (у них разные поддомены):
    allow_origin_regex=r"^https://.*\.pages\.dev$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # важно из-за X-Telegram-Id и др. кастомных заголовков
)

# --- Routes ---
@app.get("/")
def root():
    # чтобы не было Not Found на корне
    return RedirectResponse(url="/docs")

@app.get("/api/health")
def health():
    return {"status": "ok"}

app.include_router(news_router, prefix="/api")
app.include_router(hotels_router, prefix="/api")
app.include_router(bookings_router, prefix="/api")
app.include_router(admin_router, prefix="/api")


# --- Seed / startup logic ---
CITIES = [
    ("Алматы", 43.2383, 76.9455, "Almaty"),
    ("Астана", 51.1605, 71.4704, "Astana"),
    ("Шымкент", 42.3155, 69.5869, "Shymkent"),
    ("Караганда", 49.8060, 73.0850, "Karaganda"),
    ("Актобе", 50.2839, 57.1670, "Aktobe"),
    ("Атырау", 47.0945, 51.9236, "Atyrau"),
]

NAME_PARTS = ["Grand", "Plaza", "Central", "Riverside", "Boutique", "Park", "Sky", "Prime", "Elite", "Garden"]

def jitter(base: float, delta: float = 0.03) -> float:
    return base + random.uniform(-delta, delta)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        TARGET_PER_CITY = 10

        if db.query(Hotel).count() == 0:
            for city_ru, lat, lng, city_en in CITIES:
                for i in range(1, TARGET_PER_CITY + 1):
                    name = f"{city_en} {random.choice(NAME_PARTS)} Hotel {i}"
                    address = f"{city_ru}, пр. Демо {10 + i}"

                    h = Hotel(
                        name=name,
                        city=city_ru,
                        address=address,
                        lat=jitter(lat),
                        lng=jitter(lng),
                        rating=round(random.uniform(4.1, 4.9), 1),
                        reviews_count=random.randint(40, 2500),
                    )
                    db.add(h)
                    db.flush()

                    base_price = random.randint(14000, 28000)
                    db.add_all([
                        RoomType(
                            hotel_id=h.id,
                            name_ru="Стандарт",
                            name_en="Standard",
                            name_kk="Стандарт",
                            price_per_night_kzt=base_price,
                            quantity=random.randint(3, 12),
                        ),
                        RoomType(
                            hotel_id=h.id,
                            name_ru="Делюкс",
                            name_en="Deluxe",
                            name_kk="Делюкс",
                            price_per_night_kzt=base_price + random.randint(6000, 14000),
                            quantity=random.randint(2, 8),
                        ),
                    ])

                    db.add(HotelVideo(hotel_id=h.id, youtube_url="https://youtu.be/dQw4w9WgXcQ"))

            db.commit()

        hotels = db.query(Hotel).all()
        for h in hotels:
            enrich_hotel_and_rooms(db, h)

    finally:
        db.close()