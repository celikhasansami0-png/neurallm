"""Application configuration, loaded from environment variables via pydantic-settings."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/phratic"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Integrations (OAuth connect only - no AI/agent execution)
    COMPOSIO_API_KEY: str = ""

    # Auth
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Security
    SESSION_TIMEOUT_MINUTES: int = 30
    RATE_LIMIT_PER_MINUTE: int = 120

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    APP_NAME: str = "Phratic"
    ENV: str = "development"

    # Lemon Squeezy billing (degrades gracefully / raises a clear error per-feature if unset)
    LEMONSQUEEZY_API_KEY: str = ""
    LEMONSQUEEZY_STORE_ID: str = ""
    LEMONSQUEEZY_WEBHOOK_SECRET: str = ""
    LEMONSQUEEZY_VARIANT_TEAM: str = ""
    LEMONSQUEEZY_VARIANT_BUSINESS: str = ""

    # Resend for email verification / password reset (falls back to logging if unset)
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "onboarding@resend.dev"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
