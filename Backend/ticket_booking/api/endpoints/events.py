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
    name: str = None,
    city: str = None,
    date_from: str = None,
    date_to: str = None,
    price_min: float = None,
    price_max: float = None,
    db: AsyncSession = Depends(get_db)
):
    filters = {
        'name': name,
        'city': city,
        'date_from': date_from,
        'date_to': date_to,
        'price_min': price_min,
        'price_max': price_max
    }
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    return await event_service.filter_events(filters)