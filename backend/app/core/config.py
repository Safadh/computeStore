from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "computeStore API"
    api_prefix: str = "/api"

    # Security
    secret_key: str = "CHANGE_ME_SUPER_SECRET_KEY"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:root@localhost:5432/computestore"

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

