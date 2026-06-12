# pipeline/src/gta6_tracker/classifier.py

import logging
import time

from google import genai
from google.genai import types
from google.genai import errors as genai_errors
from pydantic import BaseModel, Field

from gta6_tracker.config import settings
from gta6_tracker.models import Article

logger = logging.getLogger(__name__)

client = genai.Client(
    api_key=settings.google_api_key,
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(
            attempts=5,
            initial_delay=30.0,
            max_delay=120.0,
            http_status_codes=[429, 500, 502, 503, 504],
        )
    ),
)

CATEGORIES = [
    "release_date",
    "gameplay",
    "story",
    "trailer",
    "rumour",
    "business",
    "other",
    "unrelated",
]

SYSTEM_PROMPT = """You are a news classifier for a GTA 6 tracker website.

Given an article's title and summary, decide:
1. Is this REAL GTA 6 / Rockstar news, leaks, or analysis worth a fan's time?
2. Assign it a category.
3. Rate your confidence.
4. Extract 2-4 short topic tags.

Real news examples:
- Release date updates, delays, pre-orders
- Trailer announcements / analysis
- Official Rockstar statements, leaks from credible sources
- Take-Two earnings calls and financial info about GTA 6
- Confirmed gameplay features, characters, map info
- Industry analysis with substance

Noise examples (mark is_relevant as false):
- Pure memes, fan art, jokes
- Speculation with no source
- GTA 5 / GTA Online content unrelated to GTA 6
- Other games entirely

CONFIDENCE:
- 0.90-1.00: Official source (Rockstar, Take-Two) or verified by multiple outlets
- 0.65-0.89: Single reputable outlet or credible named insider
- 0.00-0.64: Rumour, anonymous source, or low-credibility outlet

TAGS: 2-4 short specific phrases (2-4 words each) describing the article's topics.
Good examples: "map size", "Vice City", "release date confirmed", "PC version", "Tom Henderson leak"
Bad examples: "GTA 6 news", "game update" (too generic to be useful for filtering)"""


class Classification(BaseModel):
    category: str
    is_relevant: bool
    confidence: float
    tags: list[str] = Field(default_factory=list)



def _classify_article(article: Article) -> Classification:
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=Classification,
            temperature=0.1,
        ),
        contents=f"Title: {article.title}\nSource: {article.source}\nSummary: {article.summary}",
    )

    # response.parsed gives us the Pydantic object directly when response_schema
    # is a Pydantic model — no manual JSON parsing needed.
    return response.parsed


def classify_all(articles: list[Article]) -> list[Article]:
    classified = []

    for i, article in enumerate(articles):
        try:
            logger.info(f"Classifying {i + 1}/{len(articles)}: {article.title[:50]}")
            result = _classify_article(article)

            article.category = result.category
            article.is_relevant = result.is_relevant
            article.confidence = result.confidence
            article.tags = result.tags

            classified.append(article)

        except Exception as e:
            logger.error(f"Failed to classify: {article.title[:50]} — {e}")
            classified.append(article)
            continue

        # Small delay between requests to stay within free tier rate limits
        if i < len(articles) - 1:
            time.sleep(6.5)

    relevant = sum(1 for a in classified if a.is_relevant)
    logger.info(f"Classified {len(classified)} articles, {relevant} relevant to GTA 6")
    return classified