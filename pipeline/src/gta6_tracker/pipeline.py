# pipeline/src/gta6_tracker/pipeline.py

import logging
import os
import sys

from gta6_tracker.classifier import classify_all
from gta6_tracker.fetcher import fetch_all
from gta6_tracker.og_fetcher import enrich_with_og_images, fetch_og_image
from gta6_tracker.storage import upsert_articles, filter_new, get_urls_missing_og_image, update_og_image

# Set up logging once here — all other modules inherit this
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)


def run_normal():
    logger.info("Pipeline starting — normal run")

    # Step 1 — fetch
    articles = fetch_all()
    if not articles:
        logger.warning("No articles fetched, exiting")
        return

    # Step 2 — filter out articles already in DB
    new_articles = filter_new(articles)
    logger.info(f"{len(new_articles)} new articles to process (skipping {len(articles) - len(new_articles)} already seen)")

    if not new_articles:
        logger.info("No new articles — nothing to classify or store")
        return

    # Step 3 — fetch og:image for new articles before classification
    # Done here so everything is written to DB in one upsert pass
    new_articles = enrich_with_og_images(new_articles)

    # Step 4 — classify
    classified = classify_all(new_articles)

    # Step 5 — store
    written = upsert_articles(classified)

    logger.info(f"Pipeline complete — {written} articles stored")


def run_backfill():
    """
    One-time backfill: fetch og:image for relevant articles that were
    ingested before Phase 3a and have og_image_url = NULL.

    Run once after deploying Phase 3a:
        PIPELINE_MODE=backfill uv run pipeline
    """
    logger.info("Pipeline starting — og:image backfill")

    urls = get_urls_missing_og_image()
    if not urls:
        logger.info("No articles missing og:image — backfill complete")
        return

    logger.info(f"Found {len(urls)} articles missing og:image")
    updated = 0

    for i, url in enumerate(urls):
        logger.info(f"  Backfill {i + 1}/{len(urls)}: {url[:80]}")
        og_url = fetch_og_image(url)
        if og_url:
            update_og_image(url, og_url)
            updated += 1

    logger.info(f"Backfill complete — updated {updated}/{len(urls)} articles")


def main():
    mode = os.environ.get("PIPELINE_MODE", "normal")

    if mode == "backfill":
        run_backfill()
    else:
        run_normal()


if __name__ == "__main__":
    main()