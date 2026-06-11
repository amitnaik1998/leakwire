# src/gta6_tracker/pipeline.py

import logging
import sys

from gta6_tracker.classifier import classify_all
from gta6_tracker.fetcher import fetch_all
from gta6_tracker.storage import upsert_articles, filter_new

# Set up logging once here — all other modules inherit this
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)


def main():
    logger.info("Pipeline starting")

    # Step 1 — fetch
    articles = fetch_all()
    if not articles:
        logger.warning("No articles fetched, exiting")
        return

    # Step 2 — filter out articles already in DB
    new_articles = filter_new(articles)
    logger.info(f"{len(new_articles)} new articles to classify (skipping {len(articles) - len(new_articles)} already seen)")

    if not new_articles:
        logger.info("No new articles — nothing to classify or store")
        return

    # Step 3 — classify only new ones
    classified = classify_all(new_articles)

    # Step 3 — store
    written = upsert_articles(classified)

    logger.info(f"Pipeline complete — {written} articles stored")


if __name__ == "__main__":
    main()