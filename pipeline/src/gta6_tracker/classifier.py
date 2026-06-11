# src/gta6_tracker/classifier.py

import logging
import time

from google import genai
from google.genai import types
from google.genai import errors as genai_errors
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential
from pydantic import BaseModel

from gta6_tracker.config import settings
from gta6_tracker.models import Article

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.google_api_key)

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

Respond ONLY with valid JSON. No markdown, no code fences."""


class Classification(BaseModel):
    category: str
    is_relevant: bool
    confidence: float


@retry(
    retry=retry_if_exception_type(genai_errors.ClientError),
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=2, min=12, max=60),
)
def _classify_article(article: Article) -> Classification:
    user_message = f"""Title: {article.title}
Source: {article.source}
Summary: {article.summary}

Classify this article. Respond with JSON:
{{"category": "one of {CATEGORIES}", "is_relevant": true or false, "confidence": 0.0 to 1.0}}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=Classification,
        ),
        contents=user_message,
    )

    return Classification.model_validate_json(response.text)


def classify_all(articles: list[Article]) -> list[Article]:
    classified = []

    for i, article in enumerate(articles):
        try:
            logger.info(f"Classifying {i + 1}/{len(articles)}: {article.title[:50]}")
            result = _classify_article(article)

            article.category = result.category
            article.is_relevant = result.is_relevant
            article.confidence = result.confidence

            classified.append(article)

        except Exception as e:
            logger.error(f"Failed to classify: {article.title[:50]} — {e}")
            classified.append(article)
            continue

    relevant = sum(1 for a in classified if a.is_relevant)
    logger.info(f"Classified {len(classified)} articles, {relevant} relevant to GTA 6")
    return classified