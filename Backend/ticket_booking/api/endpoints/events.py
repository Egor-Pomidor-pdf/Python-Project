from fastapi import APIRouter, Depends
from ticket_booking.domain.schemas.event import EventFilter, EventCreate
from ticket_booking.services.event import EventService
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.repositories.specialist import SpecialistRepository
from ticket_booking.infrastructure.database import get_db
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ticket_booking.infrastructure.auth import get_current_user

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/generate-events", status_code=201)
async def generate_events(db: AsyncSession = Depends(get_db)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    return await event_service.generate_events()

@router.get("/filter")
async def filter_events(
    filter_data: EventFilter = Depends(),
    db: AsyncSession = Depends(get_db)
):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    return await event_service.filter_events(filter_data.dict(exclude_unset=True))



"""specialist's rights"""
@router.patch("/{event_id}/archive", status_code=200)
async def archive_event(event_id: int, db: AsyncSession = Depends(get_db), payload: dict = Depends(get_current_user)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

    try:
        username = payload.get("username")
        special_repo = SpecialistRepository()
        is_specialist = special_repo.is_specialist(username)
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


@router.delete("{event_id}/delete", status_code=204)
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db), payload: dict = Depends(get_current_user)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

    try:
        username = payload.get("username")
        special_repo = SpecialistRepository()
        is_specialist = special_repo.is_specialist(username)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    if is_specialist:
        try:
            await event_service.delete_event(event_id)
        except Exception:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail=f"Мероприятие #{event_id} не может быть удалено"
            )
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещен")
    

@router.post("/create", status_code=201)
async def create_event(event_data: EventCreate, db: AsyncSession = Depends(get_db), payload: dict = Depends(get_current_user)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

    try:
        username = payload.get("username")
        special_repo = SpecialistRepository()
        is_specialist = special_repo.is_specialist(username)
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