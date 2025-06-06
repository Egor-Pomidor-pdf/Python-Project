from bcrypt import hashpw, gensalt, checkpw
from fastapi.security import OAuth2PasswordBearer
from ticket_booking.core.config import settings
import jwt
from datetime import datetime, timedelta

csrf_storage = {}
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_password_hash(password: str, username: str) -> str:
    salt = gensalt() + settings.GLOBAL_SALT.encode('utf-8') if username else gensalt()
    return hashpw((password + (username or "")).encode('utf-8'), salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str, username: str) -> bool:
    return checkpw((plain_password + (username or "")).encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
