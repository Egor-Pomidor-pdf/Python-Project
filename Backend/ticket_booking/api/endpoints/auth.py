from fastapi import APIRouter, Depends, HTTPException, status
from ticket_booking.domain.schemas.user import UserCreate
from ticket_booking.services.auth import AuthService
from ticket_booking.core.security import create_access_token, verify_password
from ticket_booking.core.exceptions import InvalidCredentialsException
from ticket_booking.domain.repositories.user import UserRepository
from ticket_booking.infrastructure.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        user_repo = UserRepository(db)
        auth_service = AuthService(user_repo)
        return await auth_service.register_user(user.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(from_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    try:
        user_repo = UserRepository(db)
        auth_service = AuthService(user_repo)
        user = await user_repo.authenticate(from_data.username)
        if not user or not verify_password(from_data.password, user.password_hash, user.username):
            raise InvalidCredentialsException("Неверный логи или пароль")
        access_token = create_access_token({"sub": user.username})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Вход выполнен успешно"
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
