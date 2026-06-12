# pipeline/src/gta6_tracker/storage.py

import logging

import psycopg
from psycopg.rows import dict_row

from gta6_tracker.config import settings
from gta6_tracker.models import Article

logger = logging.getLogger(__name__)


def get_connection():
    """
    Open a connection to the Supabase Postgres database.
    We open and close per pipeline run — no persistent connection needed
    since this is a batch job, not a web server.
    """
    return psycopg.connect(settings.database_url, row_factory=dict_row)


def upsert_articles(articles: list[Article]) -> int:
    """
    Insert articles into the DB. If a URL already exists, update it.
    Returns the number of rows written.
    """
    if not articles:
        logger.info("No articles to store")
        return 0

    query = """
        INSERT INTO articles (
            url, title, source, published_at,
            summary, category, is_relevant, confidence,
            og_image_url, game, tags
        )
        VALUES (
            %(url)s, %(title)s, %(source)s, %(published_at)s,
            %(summary)s, %(category)s, %(is_relevant)s, %(confidence)s,
            %(og_image_url)s, %(game)s, %(tags)s
        )
        ON CONFLICT (url) DO UPDATE SET
            category     = EXCLUDED.category,
            is_relevant  = EXCLUDED.is_relevant,
            confidence   = EXCLUDED.confidence,
            tags         = EXCLUDED.tags,
            og_image_url = COALESCE(EXCLUDED.og_image_url, articles.og_image_url)
    """
    # COALESCE on og_image_url: if this run fetched a real URL, use it.
    # If the fetch failed (None), keep whatever was already stored.
    # This way a previously-fetched image is never overwritten with NULL.

    written = 0

    with get_connection() as conn:
        with conn.cursor() as cur:
            for article in articles:
                try:
                    cur.execute(query, {
                        "url":          article.url,
                        "title":        article.title,
                        "source":       article.source,
                        "published_at": article.published_at,
                        "summary":      article.summary,
                        "category":     article.category,
                        "is_relevant":  article.is_relevant,
                        "confidence":   article.confidence,
                        "og_image_url": article.og_image_url,
                        "game":         article.game,
                        "tags":         article.tags,
                        # psycopg automatically converts a Python list[str]
                        # to a Postgres TEXT[] array — no manual serialisation needed.
                    })
                    written += 1
                except Exception as e:
                    logger.error(f"Failed to store article: {article.url} — {e}")
                    continue

        conn.commit()

    logger.info(f"Stored {written} articles to database")
    return written


def filter_new(articles: list[Article]) -> list[Article]:
    """
    Return only articles whose URL is not already in the DB.
    This avoids re-classifying articles we've already seen.
    """
    if not articles:
        return []

    urls = [a.url for a in articles]

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT url FROM articles WHERE url = ANY(%s)",
                (urls,)
            )
            existing_urls = {row["url"] for row in cur.fetchall()}

    new = [a for a in articles if a.url not in existing_urls]
    logger.info(f"Found {len(existing_urls)} already in DB, {len(new)} are new")
    return new

def get_urls_missing_og_image(limit: int = 200) -> list[str]:
    """
    Return URLs of relevant articles that have no og_image_url yet.
    Used by backfill mode to enrich articles ingested before Phase 3a.
    Ordered newest first so the most recent articles get images first.
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT url FROM articles
                WHERE is_relevant = true
                  AND og_image_url IS NULL
                ORDER BY published_at DESC
                LIMIT %s
                """,
                (limit,),
            )
            return [row["url"] for row in cur.fetchall()]


def update_og_image(url: str, og_image_url: str) -> None:
    """
    Update the og_image_url for a single article by its URL.
    Used by backfill mode — updates one row at a time as we fetch each image.
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE articles SET og_image_url = %s WHERE url = %s",
                (og_image_url, url),
            )
        conn.commit()