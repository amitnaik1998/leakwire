# src/gta6_tracker/config.py

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

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,  # DATABASE_URL and database_url both work
    )


# Create one shared instance at import time
# Every other file does: from gta6_tracker.config import settings
settings = Settings()