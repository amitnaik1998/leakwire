# src/gta6_tracker/models.py

from datetime import datetime
from pydantic import BaseModel


class Article(BaseModel):
    # --- Core fields (fetcher fills these) ---
    url: str                        # unique identifier for the article
    title: str                      # headline
    source: str                     # e.g. "IGN", "Rockstar Games"
    published_at: datetime          # when it was published
    summary: str = ""               # short description from the RSS feed

    # --- Classification fields (classifier fills these) ---
    category: str = "unclassified"  # e.g. "release_date", "gameplay", "rumour"
    is_relevant: bool = False       # is this actually about GTA 6?
    confidence: float = 0.0         # how confident Claude is, 0.0 to 1.0