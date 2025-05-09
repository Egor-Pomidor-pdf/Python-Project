from fastapi import APIRouter, Depends, HTTPException, status
from ticket_booking.domain.schemas.user import UserCreate, UserLogin
from ticket_booking.services.auth import AuthService
from ticket_booking.domain.repositories.user import UserRepository
from ticket_booking.infrastructure.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

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
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        user_repo = UserRepository(db)
        auth_service = AuthService(user_repo)
        return await auth_service.authenticate_user(user.login, user.password)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))