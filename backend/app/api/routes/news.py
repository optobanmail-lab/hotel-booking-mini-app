from fastapi import APIRouter
import feedparser
import re
import html
import hashlib
import urllib.parse

router = APIRouter(prefix="/news", tags=["news"])

RSS_SOURCES = [
    "https://news.google.com/rss/search?q=отели+Казахстан&hl=ru&gl=KZ&ceid=KZ:ru",
    "https://news.google.com/rss/search?q=гостиницы+Алматы&hl=ru&gl=KZ&ceid=KZ:ru",
    "https://news.google.com/rss/search?q=туризм+Казахстан+отель&hl=ru&gl=KZ&ceid=KZ:ru",
]

CITY_TAGS = {
    "алматы": "almaty",
    "астана": "astana",
    "шымкент": "shymkent",
    "караганда": "karaganda",
    "актобе": "aktobe",
    "атырау": "atyrau",
}

def strip_html(s: str | None) -> str:
    if not s:
        return ""
    s = html.unescape(s)                 # убираем &nbsp; и т.п.
    s = re.sub(r"<[^>]+>", "", s)        # удаляем теги
    s = re.sub(r"\s+", " ", s).strip()   # нормализуем пробелы
    return s

def seed_int(text: str) -> int:
    h = hashlib.md5(text.encode("utf-8")).hexdigest()
    return int(h[:8], 16)

def build_image_url(title: str, url: str) -> str:
    """
    Уникальная картинка без API-ключа.
    source.unsplash.com отдаёт разные фото за счёт sig.
    """
    t = (title or "").lower()

    # базовые теги "про отели"
    tags = ["hotel", "kazakhstan", "travel", "room", "lobby"]

    # если в заголовке есть город — добавим
    for ru, en in CITY_TAGS.items():
        if ru in t:
            tags.insert(0, en)
            break

    q = urllib.parse.quote(",".join(tags))
    sig = seed_int(url) % 10_000_000
    return f"https://source.unsplash.com/900x700/?{q}&sig={sig}"

@router.get("")
def get_news(limit: int = 8):
    limit = max(3, min(12, int(limit)))

    raw = []
    for feed_url in RSS_SOURCES:
        feed = feedparser.parse(feed_url)
        for e in feed.entries:
            title = getattr(e, "title", None)
            link = getattr(e, "link", None)
            if not title or not link:
                continue

            summary = strip_html(getattr(e, "summary", None))
            published = getattr(e, "published", None) or getattr(e, "updated", None)

            # убрать дубли заголовка в summary
            title_clean = strip_html(title)
            if summary.lower().startswith(title_clean.lower()):
                summary = summary[len(title_clean):].strip(" -:–—").strip()

            raw.append({
                "title": title_clean,
                "url": link,
                "summary": summary,
                "published": published,
                "source": "Google News",
            })

    # дедуп по url
    seen = set()
    uniq = []
    for it in raw:
        if it["url"] in seen:
            continue
        seen.add(it["url"])
        it["image_url"] = build_image_url(it["title"], it["url"])
        uniq.append(it)

    return uniq[:limit]