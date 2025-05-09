from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "Ziben6"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SQL_DATABASE_URL: str = "sqlite+aiosqlite:///./ticket_booking.db"
    GLOBAL_SALT: str = "NFS4214"

settings = Settings()