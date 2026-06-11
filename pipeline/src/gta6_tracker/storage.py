# src/gta6_tracker/storage.py

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

    # SQL for upsert
    # ON CONFLICT (url) means: if this URL already exists...
    # DO UPDATE SET means: ...update these fields instead of failing
    query = """
        INSERT INTO articles (
            url, title, source, published_at,
            summary, category, is_relevant, confidence
        )
        VALUES (
            %(url)s, %(title)s, %(source)s, %(published_at)s,
            %(summary)s, %(category)s, %(is_relevant)s, %(confidence)s
        )
        ON CONFLICT (url) DO UPDATE SET
            category    = EXCLUDED.category,
            is_relevant = EXCLUDED.is_relevant,
            confidence  = EXCLUDED.confidence
    """

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