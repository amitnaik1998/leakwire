# pipeline/src/gta6_tracker/models.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Article(BaseModel):
    # --- Core fields (fetcher fills these) ---
    url: str                        # unique identifier for the article
    title: str                      # headline
    source: str                     # e.g. "IGN", "Rockstar Games"
    published_at: datetime          # when it was published
    summary: str = ""               # short description from the RSS feed
    og_image_url: Optional[str] = None  # scraped from the article page <head>
    game: str = "gta6"              # which game this belongs to

    # --- Classification fields (classifier fills these) ---
    category: str = "unclassified"  # e.g. "release_date", "gameplay", "rumour"
    is_relevant: bool = False       # is this actually about GTA 6?
    confidence: float = 0.0         # how confident Gemini is, 0.0 to 1.0
    tags: list[str] = Field(default_factory=list)  # e.g. ["map size", "Vice City"]