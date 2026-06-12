# pipeline/src/gta6_tracker/og_fetcher.py

import logging
from typing import Optional

import httpx
from bs4 import BeautifulSoup

from gta6_tracker.config import settings

logger = logging.getLogger(__name__)

# Minimal browser-like headers.
# Many news sites return a 403 or redirect to a cookie wall if the request
# doesn't look like a real browser. A realistic User-Agent gets past most of them.
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def fetch_og_image(url: str) -> Optional[str]:
    """
    Visit an article URL and return its og:image value, or None if unavailable.
    Never raises — a missing thumbnail is cosmetic, never worth crashing for.
    """
    try:
        # stream=True means we don't wait for the full page to download.
        # Instead we read in chunks and stop early once we have enough.
        with httpx.stream(
            "GET",
            url,
            headers=_HEADERS,
            timeout=settings.og_fetch_timeout,
            follow_redirects=True,
        ) as response:
            if response.status_code != 200:
                logger.debug(f"og:image: got {response.status_code} for {url}")
                return None

            # Read chunks until we hit og_fetch_max_bytes (default 30KB) then stop.
            # iter_bytes() gives us raw bytes chunk by chunk without decompressing first.
            chunks: list[bytes] = []
            total = 0
            for chunk in response.iter_bytes(chunk_size=4096):
                chunks.append(chunk)
                total += len(chunk)
                if total >= settings.og_fetch_max_bytes:
                    break

        html = b"".join(chunks).decode("utf-8", errors="replace")

    except httpx.TimeoutException:
        logger.debug(f"og:image: timed out for {url}")
        return None
    except Exception as e:
        logger.debug(f"og:image: failed for {url} — {e}")
        return None

    soup = BeautifulSoup(html, "html.parser")

    # Standard: <meta property="og:image" content="https://...">
    tag = soup.find("meta", property="og:image")
    if tag and tag.get("content", "").strip():
        return tag["content"].strip()

    # Fallback: some sites use name= instead of property=
    tag = soup.find("meta", attrs={"name": "og:image"})
    if tag and tag.get("content", "").strip():
        return tag["content"].strip()

    logger.debug(f"og:image: no tag found for {url}")
    return None


def enrich_with_og_images(articles: list) -> list:
    """
    Fetch og:image for every article that doesn't already have one.
    Mutates the list in place and returns it.
    Runs sequentially — a batch pipeline doesn't need concurrency,
    and sequential is simpler to debug and kinder to source servers.
    """
    to_fetch = [a for a in articles if a.og_image_url is None]

    if not to_fetch:
        logger.info("og:image: all articles already have images, skipping")
        return articles

    logger.info(f"og:image: fetching for {len(to_fetch)} articles")

    for i, article in enumerate(to_fetch):
        logger.info(
            f"  og:image {i + 1}/{len(to_fetch)}: "
            f"[{article.source}] {article.title[:50]}"
        )
        article.og_image_url = fetch_og_image(article.url)

    found = sum(1 for a in to_fetch if a.og_image_url is not None)
    logger.info(f"og:image: found {found}/{len(to_fetch)}")
    return articles