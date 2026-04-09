from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./local.db"
    unsplash_access_key: str = ""

    admin_password: str = "admin123"
    jwt_secret: str = "dev-secret-change-me"

    cors_origins: str = "http://localhost:5173"  # comma-separated


settings = Settings()