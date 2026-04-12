import asyncio
import re
import time
from typing import Any, Dict, List, Optional

import feedparser
import httpx
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter(tags=["news"])

RSS_URL = (
    "https://news.google.com/rss/search?"
    "q=%D0%BE%D1%82%D0%B5%D0%BB%D0%B8%20%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D1%82%D0%B0%D0%BD"
    "&hl=ru&gl=KZ&ceid=KZ:ru"
)

CACHE_TTL_SECONDS = 10 * 60  # 10 минут
_cache: Dict[str, Any] = {"expires_at": 0.0, "items": []}


def _strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s or "").strip()


def _extract_image_from_entry(entry: Dict[str, Any]) -> Optional[str]:
    # media:content / media:thumbnail
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

    # enclosure image
    links = entry.get("links") or []
    for lk in links:
        if (lk or {}).get("rel") == "enclosure" and str((lk or {}).get("type", "")).startswith("image/"):
            href = (lk or {}).get("href")
            if href:
                return href

    # <img src="..."> inside summary
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
        # Не используем raise_for_status(), чтобы не получить 500
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
                    "url": url,
                    "image_url": image_url,
                }
            )

        # Догружаем картинки через og:image ограниченно
        MAX_OG_FETCH = 6
        sem = asyncio.Semaphore(4)

        idxs: List[int] = []
        tasks: List[asyncio.Task] = []

        for i, it in enumerate(items):
            if len(tasks) >= MAX_OG_FETCH:
                break
            if not it["image_url"] and it["url"]:
                idxs.append(i)
                tasks.append(asyncio.create_task(_fetch_og_image(it["url"], client, sem)))

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for i, res in zip(idxs, results):
                if isinstance(res, str) and res:
                    items[i]["image_url"] = res

        return items


@router.get("/news")
async def news(limit: int = Query(8, ge=1, le=50)):
    """
    Никогда не отдаём 500: если что-то сломалось — отдаём кеш или [].
    """
    now = time.time()

    # свежий кеш
    if _cache["expires_at"] > now and _cache["items"]:
        return JSONResponse(content=_cache["items"][:limit], status_code=200, headers={"Cache-Control": "no-store"})

    try:
        items = await _load_news(limit)

        if items:
            _cache["items"] = items
            _cache["expires_at"] = now + CACHE_TTL_SECONDS
            return JSONResponse(content=items[:limit], status_code=200, headers={"Cache-Control": "no-store"})

        # если получили пусто — вернём старый кеш, если он есть
        if _cache["items"]:
            return JSONResponse(content=_cache["items"][:limit], status_code=200, headers={"Cache-Control": "no-store"})

        return JSONResponse(content=[], status_code=200, headers={"Cache-Control": "no-store"})

    except Exception:
        # вообще никаких 500
        if _cache["items"]:
            return JSONResponse(content=_cache["items"][:limit], status_code=200, headers={"Cache-Control": "no-store"})
        return JSONResponse(content=[], status_code=200, headers={"Cache-Control": "no-store"})