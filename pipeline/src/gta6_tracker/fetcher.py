# src/gta6_tracker/fetcher.py

import logging
from datetime import datetime, timezone

import feedparser
from dateutil import parser as dateparser
from tenacity import retry, stop_after_attempt, wait_exponential

from gta6_tracker.config import settings
from gta6_tracker.models import Article
from gta6_tracker.sources import SOURCES, RSSSource
import re

# Get a logger for this module
# __name__ will be "gta6_tracker.fetcher" — helps identify where logs come from
logger = logging.getLogger(__name__)


def _parse_date(date_string: str) -> datetime:
    """
    RSS feeds publish dates in many formats.
    dateutil handles all of them and returns a clean datetime object.
    If parsing fails, we fall back to right now.
    """
    try:
        dt = dateparser.parse(date_string)
        if dt and dt.tzinfo is None:
            # Make it timezone-aware (UTC) if it isn't already
            dt = dt.replace(tzinfo=timezone.utc)
        return dt or datetime.now(timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def _clean_html(text: str) -> str:
    """Strip HTML tags from summary text."""
    return re.sub(r"<[^>]+>", "", text).strip()

@retry(
    stop=stop_after_attempt(settings.max_retries),  # try up to 3 times
    wait=wait_exponential(multiplier=1, min=2, max=10),  # wait 2s, 4s, 8s between tries
)
def _fetch_feed(source: RSSSource) -> list[Article]:
    """
    Fetch a single RSS feed and return a list of Article objects.
    The @retry decorator will retry this automatically if it fails.
    """
    logger.info(f"Fetching feed: {source.name}")

    feed = feedparser.parse(source.url)

    # feedparser doesn't raise exceptions — it sets bozo=True on failure
    if feed.bozo:
        logger.warning(f"Feed may be malformed: {source.name}")

    articles = []

    for entry in feed.entries:
        try:
            article = Article(
                url=entry.get("link", ""),
                title=entry.get("title", ""),
                source=source.name,
                published_at=_parse_date(entry.get("published", "")),
                summary=_clean_html(entry.get("summary", "")),
            )
            articles.append(article)
        except Exception as e:
            # If one article fails, log it and keep going
            logger.warning(f"Skipping malformed entry from {source.name}: {e}")
            continue

    logger.info(f"Got {len(articles)} articles from {source.name}")
    return articles


def fetch_all() -> list[Article]:
    """
    Fetch all sources and return combined list of articles.
    This is what pipeline.py will call.
    """
    all_articles = []

    for source in SOURCES:
        try:
            articles = _fetch_feed(source)
            all_articles.extend(articles)
        except Exception as e:
            # If a source fails after all retries, log and continue
            logger.error(f"Failed to fetch {source.name} after retries: {e}")
            continue

    logger.info(f"Total articles fetched: {len(all_articles)}")
    return all_articles