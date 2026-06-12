# pipeline/src/gta6_tracker/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Required — no default means it MUST exist in .env
    # If missing, you get a clear ValidationError on startup
    anthropic_api_key: str
    google_api_key: str
    database_url: str

    # Optional — sensible defaults if not set in .env
    log_level: str = "INFO"
    fetch_timeout_seconds: int = 30
    max_retries: int = 3

    og_fetch_timeout: float = 5.0
    # Seconds to wait when fetching an article page for its og:image.
    # Kept deliberately low — a slow site should never stall the whole pipeline.

    og_fetch_max_bytes: int = 30_000
    # We stream each page and stop after 30KB.
    # The <head> section (where og:image lives) is always within the first 30KB.
    # This avoids downloading full multi-MB pages just to read one meta tag.

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Create one shared instance at import time
# Every other file does: from gta6_tracker.config import settings
settings = Settings()