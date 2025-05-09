from fastapi import APIRouter, Depends, HTTPException, status
from ticket_booking.domain.schemas.user import UserCreate, UserLogin, Register_specialist
from ticket_booking.services.auth import AuthService
from ticket_booking.services.specialist import SpecialistService
from ticket_booking.domain.repositories.user import UserRepository
from ticket_booking.domain.repositories.specialist import SpecialistRepository
from ticket_booking.infrastructure.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        user_repo = UserRepository(db)
        specialist_repo = SpecialistRepository(db)
        auth_service = AuthService(user_repo, specialist_repo)
        return await auth_service.register_user(user.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    


@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        user_repo = UserRepository(db)
        specialist_repo = SpecialistRepository(db)
        auth_service = AuthService(user_repo, specialist_repo)
        return await auth_service.authenticate_user(user.login, user.password)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
    


@router.post('/register-specialist', status_code=status.HTTP_201_CREATED)
async def register_specialist(specialist: Register_specialist, db: AsyncSession = Depends(get_db)):
    sr = SpecialistRepository(db)
    ads = SpecialistService(sr)

    try:
        await ads.register_specialist(name=specialist.username, role=specialist.role)
        return 201
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))