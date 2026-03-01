from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    MONGODB_URL: str = "mongodb://localhost:27017/"
    DATABASE_NAME: str = "ai_roadmap_db"
    SECRET_KEY: str = "secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # AI & External APIs
    GEMINI_API_KEY: str = ""
    YOUTUBE_API_KEY: str = ""

    # Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 465
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = "AI Learning Roadmap"

settings = Settings()
