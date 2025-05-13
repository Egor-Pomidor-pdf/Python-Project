from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    SECRET_KEY: str = "Ziben6"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    SQL_DATABASE_URL: str = "sqlite+aiosqlite:///./ticket_booking.db"
    GLOBAL_SALT: str = os.getenv("GLOBAL_SALT", "default_salt_if_not_set")
    TICKETMASTER_API_KEY: str = os.getenv("TICKETMASTER_API_KEY", "bsZxsmrvzuTWwFlVRicKg7VbHjKwMzHe")


settings = Settings()
