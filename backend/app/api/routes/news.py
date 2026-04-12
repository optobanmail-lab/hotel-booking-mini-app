import asyncio
import re
import time
from typing import Any, Dict, List, Optional

import feedparser
import httpx
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter(tags=["news"])

# Google News RSS: "отели Казахстана"
RSS_URL = (
    "https://news.google.com/rss/search?"
    "q=%D0%BE%D1%82%D0%B5%D0%BB%D0%B8%20%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD"
    "&hl=ru&gl=KZ&ceid=KZ:ru"
)

# как часто обновлять новости
CACHE_TTL_SECONDS = 10 * 60  # 10 минут

# глобальный кеш в памяти процесса
_cache: Dict[str, Any] = {"expires_at": 0.0, "items": []}


def _strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s or "").strip()


def _extract_image_from_entry(entry: Dict[str, Any]) -> Optional[str]:
    # 1) media:content / media:thumbnail
    media_content = entry.get("media_content") or []
    if isinstance(media_content, list) and media_content:
        url = (media_content[0] or {}).get("url")
        if url:
            return url

    media_thumb = entry.get("media_thumbnail") or []
    if isinstance(media_thumb, list) and media_thumb:
        url = (media_thumb[0] or {}).get("url")
        if url:
            return url

    # 2) enclosure (картинка как вложение)
    links = entry.get("links") or []
    for lk in links:
        if (lk or {}).get("rel") == "enclosure" and str((lk or {}).get("type", "")).startswith("image/"):
            href = (lk or {}).get("href")
            if href:
                return href

    # 3) <img src="..."> внутри summary (редко)
    html = entry.get("summary") or entry.get("description") or ""
    m = re.search(r'<img[^>]+src="([^"]+)"', html, re.IGNORECASE)
    if m:
        return m.group(1)

    return None


def _extract_og_image(html: str) -> Optional[str]:
    m = re.search(
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
        html,
        re.IGNORECASE,
    )
    if m:
        return m.group(1)

    m = re.search(
        r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',
        html,
        re.IGNORECASE,
    )
    if m:
        return m.group(1)

    return None


async def _fetch_og_image(url: str, client: httpx.AsyncClient, sem: asyncio.Semaphore) -> Optional[str]:
    async with sem:
        try:
            r = await client.get(url, follow_redirects=True)
            if r.status_code >= 400:
                return None
            # некоторые сайты отдают не HTML — просто не парсим
            ctype = (r.headers.get("content-type") or "").lower()
            if "text/html" not in ctype and "application/xhtml" not in ctype:
                return None
            return _extract_og_image(r.text)
        except Exception:
            return None


async def _load_news(limit: int) -> List[Dict[str, Any]]:
    limit = max(1, min(limit, 50))

    timeout = httpx.Timeout(connect=5.0, read=10.0, write=10.0, pool=10.0)

    async with httpx.AsyncClient(
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=timeout,
    ) as client:
        # 1) получаем RSS (НЕ raise_for_status — чтобы не было 500)
        rss_resp = await client.get(RSS_URL, follow_redirects=True)
        if rss_resp.status_code >= 400:
            return []

        feed = feedparser.parse(rss_resp.text)
        entries = list(feed.entries)[:limit]

        items: List[Dict[str, Any]] = []
        for e in entries:
            entry = dict(e)

            url = entry.get("link") or ""
            title = entry.get("title") or ""
            summary = entry.get("summary") or entry.get("description") or ""
            published = entry.get("published") or entry.get("updated") or ""

            source = "Google News"
            if isinstance(entry.get("source"), dict) and entry["source"].get("title"):
                source = entry["source"]["title"]

            image_url = _extract_image_from_entry(entry)

            items.append(
                {
                    "title": title,
                    "summary": _strip_html(summary),
                    "published": published,
                    "source": source,
                    "url": url,            # фронт ждёт n.url
                    "image_url": image_url # может быть None
                }
            )

        # 2) добираем картинки через og:image (ограниченно, чтобы не убить сервер)
        MAX_OG_FETCH = 6     # максимум сколько статей пробуем "докрасить" картинкой
        sem = asyncio.Semaphore(4)

        idxs = []
        tasks = []
        for i, it in enumerate(items):
            if len(tasks) >= MAX_OG_FETCH:
                break
            if not it["image_url"] and it["url"]:
                idxs.append(i)
                tasks.append(_fetch_og_image(it["url"], client, sem))

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for i, res in zip(idxs, results):
                if isinstance(res, str) and res:
                    items[i]["image_url"] = res

        return items


@router.get("/news")
async def news(limit: int = Query(8, ge=1, le=50)):
    """
    ВАЖНО: этот endpoint НИКОГДА не должен отдавать 500.
    Если RSS/сайты недоступны — отдаём кеш или [].
    """
    now = time.time()

    # кеш свежий
    if _cache["expires_at"] > now and _cache["items"]:
        return JSONResponse(content=_cache["items"][:limit], headers={"Cache-Control": "no-store"})

    # пробуем обновить
    try:
        items = await _load_news(limit)
        if items:
            _cache["items"] = items
            _cache["expires_at"] = now + CACHE_TTL_SECONDS
            return JSONResponse(content=items[:limit], headers={"Cache-Control": "no-store"})

        # если пришёл пустой список — отдаём старый кеш, если есть
        if _cache["items"]:
            return JSONResponse(content=_cache["items"][:limit], headers={"Cache-Control": "no-store"})

        return JSONResponse(content=[], headers={"Cache-Control": "no-store"})

    except Exception:
        # ВООБЩЕ НИКАКИХ 500
        if _cache["items"]:
            return JSONResponse(content=_cache["items"][:limit], headers={"Cache-Control": "no-store"})
        return JSONResponse(content=[], headers={"Cache-Control": "no-store"})