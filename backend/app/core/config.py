"""Application configuration, loaded from environment variables via pydantic-settings."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/neurallm"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # LLM / integrations
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    COMPOSIO_API_KEY: str = ""

    # Auth
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    APP_NAME: str = "NeuraLLM"
    ENV: str = "development"

    # Stripe billing (degrades gracefully / raises a clear error per-feature if unset)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_TEAM: str = ""
    STRIPE_PRICE_BUSINESS: str = ""

    # SMTP for email verification / password reset (falls back to logging if unset)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "no-reply@quantum2.app"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
