from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# config.py lives at backend/app/config.py — .env is two levels up at project root
_ENV_FILE = Path(__file__).parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), extra="ignore")

    anthropic_api_key: str = ""
    google_api_key: str = ""
    groq_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./asmtrace.db"
    secret_key: str = "changeme"
    access_token_expire_minutes: int = 480


settings = Settings()
