from fastapi import APIRouter, Depends
from ticket_booking.domain.schemas.event import EventFilter
from ticket_booking.services.event import EventService
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.infrastructure.database import get_db
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