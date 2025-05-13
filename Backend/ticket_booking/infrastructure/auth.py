from jose import JWTError, jwt
from fastapi import HTTPException, status
from ticket_booking.core.config import settings

async def get_current_user(token: str):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")