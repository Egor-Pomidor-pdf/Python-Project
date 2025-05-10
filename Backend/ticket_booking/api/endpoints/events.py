from fastapi import APIRouter, Depends
from ticket_booking.domain.schemas.event import EventFilter, EventCreate
from ticket_booking.services.event import EventService
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.infrastructure.database import get_db
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

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
async def archive_event(event_id: int, db: AsyncSession = Depends(get_db)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

#проверить права
    try:
        event = await event_service.archive_event(event_id)
        return event
    except Exception:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"Не удалось архивировать мероприятие #{event_id}"
        )

@router.delete("{event_id}/delete", status_code=204)
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

#проверить права
    try:
        await event_service.delete_event(event_id)
    except Exception:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"Мероприятие #{event_id} не может быть удалено"
        )
    
@router.post("/create", status_code=201)
async def create_event(event_data: EventCreate, db: AsyncSession = Depends(get_db)):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)

#проверить права
    try:
        event_id = await event_service.create_event(event_data)
        return event_id
    except Exception:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail=f"Неудачно, повторите попытку позже"
        )