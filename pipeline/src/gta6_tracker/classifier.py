# pipeline/src/gta6_tracker/classifier.py

import logging
import time

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from gta6_tracker.config import settings
from gta6_tracker.models import Article

logger = logging.getLogger(__name__)

client = genai.Client(
    api_key=settings.google_api_key,
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(
            attempts=2,
            initial_delay=30.0,
            max_delay=60.0,
            http_status_codes=[429, 500, 502, 503, 504],
        )
    ),
)

# ── Keyword pre-filter ─────────────────────────────────────────────────────────
# Articles must contain at least one of these keywords to be sent to Gemini.
# We check title + summary combined (lowercased).
#
# Design decisions:
# - Conservative: if ANY keyword matches, Gemini decides relevance.
#   We never want to miss real GTA 6 news, so we err on sending too much
#   rather than too little.
# - Official sources always bypass the filter — Rockstar/Take-Two articles
#   are always worth classifying regardless of keywords.
# - Organised by category so it's easy to extend when new terms emerge
#   (new characters confirmed, new insider names, etc.)

GTA6_KEYWORDS = frozenset({
    # Game name variants — cover all common spellings/formats
    "gta 6", "gta6", "gta vi", "gtavi",
    "grand theft auto 6", "grand theft auto vi",
    "grand theft auto six",

    # Developer / publisher — business articles use these
    "rockstar games", "rockstar",
    "take-two", "take two interactive", "take two",
    "strauss zelnick", "zelnick",
    "sam houser",

    # Confirmed characters — any mention is GTA 6 related
    "lucia", "jason duval", "lucia caminos",

    # Setting — Vice City/Leonida are GTA 6 exclusive terms
    "vice city", "leonida", "gloriana",

    # Known credible insiders who specifically cover GTA 6
    "tom henderson", "tez2", "yan2295",
})

# Sources that always bypass the keyword filter
OFFICIAL_SOURCES = frozenset({
    "rockstar games",
    "rockstar newswire",
    "take-two interactive",
})

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
- Speculation with no named source
- GTA 5 / GTA Online content unrelated to GTA 6
- Other games entirely
- Fan-made tools, scripts, or personal projects
- Reddit posts where the user is the subject, not GTA 6 news

REDDIT POSTS — apply extra scrutiny:
- Only relevant if they contain actual news, named insider leaks, or substantive analysis
- Fan theories, personal observations, and community tools = not relevant
- Deleted or removed posts = not relevant

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


def _is_gta6_related(article: Article) -> bool:
    """
    Returns True if this article is worth sending to Gemini.
    Called once per article — result cached in the partition step below.
    """
    if article.source.lower() in OFFICIAL_SOURCES:
        return True
    text = f"{article.title} {article.summary or ''}".lower()
    return any(keyword in text for keyword in GTA6_KEYWORDS)


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
    return response.parsed


def classify_all(articles: list[Article]) -> list[Article]:
    if not articles:
        return articles

    # ── Step 1: Partition into GTA-related and unrelated ──────────────────────
    # Call _is_gta6_related once per article — never called again after this.
    gta_articles = []
    unrelated_articles = []
    for article in articles:
        if _is_gta6_related(article):
            gta_articles.append(article)
        else:
            # Mark as unrelated immediately — no Gemini call needed
            article.category = "unrelated"
            article.is_relevant = False
            article.confidence = 0.0
            article.tags = []
            unrelated_articles.append(article)

    logger.info(
        f"Pre-filter: {len(gta_articles)} sent to Gemini, "
        f"{len(unrelated_articles)} skipped (no GTA keywords)"
    )

    # ── Step 2: Classify only GTA-related articles with Gemini ────────────────
    classified = []
    for i, article in enumerate(gta_articles):
        try:
            logger.info(
                f"Classifying {i + 1}/{len(gta_articles)}: "
                f"[{article.source}] {article.title[:50]}"
            )
            result = _classify_article(article)
            article.category = result.category
            article.is_relevant = result.is_relevant
            article.confidence = result.confidence
            article.tags = result.tags
            classified.append(article)

        except Exception as e:
            logger.error(f"Failed to classify: {article.title[:50]} — {e}")
            # Keep defaults (unclassified / not relevant) and move on
            classified.append(article)

        if i < len(gta_articles) - 1:
            time.sleep(6.5)

    # ── Step 3: Combine and return ────────────────────────────────────────────
    all_articles = classified + unrelated_articles
    relevant = sum(1 for a in all_articles if a.is_relevant)
    gemini_calls = len(classified)
    logger.info(
        f"Done: {gemini_calls} Gemini calls, "
        f"{len(unrelated_articles)} pre-filtered, "
        f"{relevant} relevant articles"
    )
    return all_articles