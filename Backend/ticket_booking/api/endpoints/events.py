from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt
from ticket_booking.domain.schemas.event import EventFilter, EventCreate
from ticket_booking.domain.schemas.rating import RatingOut, ReviewCreate, ReviewOut
from ticket_booking.services.event import EventService
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.infrastructure.database import get_db
from ticket_booking.domain.repositories.specialists import SpecialistRepository
from ticket_booking.services.specialist import SpecialistService
from ticket_booking.infrastructure.auth import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from ticket_booking.core.config import settings
from ticket_booking.core.security import oauth2_scheme
from ticket_booking.domain.repositories.user import UserRepository

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/generate-events", status_code=201)
async def generate_events(
        count: int = 50,
        db: AsyncSession = Depends(get_db)
):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    return await event_service.generate_events(db, count=count)


@router.get("/filter")
async def filter_events(
        filter_data: EventFilter = Depends(),
        db: AsyncSession = Depends(get_db)
):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    return await event_service.filter_events(filter_data.dict(exclude_unset=True))


@router.post("/rate", response_model=RatingOut)
async def rate_event(
        user_id: int,
        event_id: int,
        score: float,
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_username(username)
    if not user or user.id != user_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    try:
        rating = await event_service.add_rating(db, user_id, event_id, score)
        return rating
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/review", response_model=ReviewOut)
async def add_review(
        user_id: int,
        review_data: ReviewCreate,
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_username(username)
    if not user or user.id != user_id:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    try:
        review = await event_service.add_review(db, user_id, review_data.event_id, review_data.comment)
        return review
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reviews/{event_id}", response_model=list[ReviewOut])
async def get_reviews(
        event_id: int,
        db: AsyncSession = Depends(get_db)
):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    reviews = await event_service.get_event_reviews(db, event_id)
    return reviews


@router.patch("/{event_id}/archive", status_code=200)
async def archive_event(event_id: int, db: AsyncSession = Depends(get_db), payload: dict = Depends(get_current_user)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

    try:
        username = payload.get("sub")
        special_repo = SpecialistRepository(db)
        special_service = SpecialistService(special_repo)
        is_specialist = await special_repo.is_specialist(username)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if is_specialist:
        try:
            event = await event_service.archive_event(event_id)
            return event
        except Exception:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail=f"Не удалось архивировать мероприятие #{event_id}"
            )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещен")


@router.delete("{event_id}/delete")
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db), payload: dict = Depends(get_current_user)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

    try:
        username = payload.get("sub")
        special_repo = SpecialistRepository(db)
        special_service = SpecialistService(special_repo)
        is_specialist = await special_repo.is_specialist(username)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if is_specialist:
        try:
            await event_service.delete_event(event_id)
            return HTTPException(status_code=200, detail="Мероприятие было успешно удалено")
        except Exception:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail=f"Мероприятие #{event_id} не может быть удалено"
            )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещен")


@router.post("/create", status_code=200)
async def create_event(event_data: EventCreate, db: AsyncSession = Depends(get_db),
                       payload: dict = Depends(get_current_user)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

    try:
        username = payload.get("sub")
        special_repo = SpecialistRepository(db)
        special_service = SpecialistService(special_repo)
        is_specialist = await special_repo.is_specialist(username)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    if is_specialist:
        try:
            event_id = await event_service.create_event(event_data)
            return event_id
        except Exception:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail=f"Неудачно, повторите попытку позже"
            )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещен")
