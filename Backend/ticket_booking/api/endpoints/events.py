from fastapi import APIRouter, Depends, HTTPException
from ticket_booking.domain.schemas.event import EventFilter
from ticket_booking.domain.schemas.rating import RatingOut, ReviewCreate, ReviewOut
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


@router.post("/rate", response_model=RatingOut)
async def rate_event(
        user_id: int,
        event_id: int,
        score: float,
        db: AsyncSession = Depends(get_db)
):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    try:
        rating = await event_service.add_rating(user_id, event_id, score)
        return RatingOut(id=rating.id, user_id=rating.user_id, event_id=rating.event_id, score=rating.score)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/review", response_model=ReviewOut)
async def add_review(
        user_id: int,
        review_data: ReviewCreate,
        db: AsyncSession = Depends(get_db)
):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    try:
        review = await event_service.add_review(user_id, review_data.event_id, review_data.comment)
        return ReviewOut(id=review.id, user_id=review.user_id, event_id=review.event_id, comment=review.comment,
                         created_at=review.created_at)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reviews/{event_id}", response_model=list[ReviewOut])
async def get_reviews(
        event_id: int,
        db: AsyncSession = Depends(get_db)
):
    event_repo = EventRepository(db)
    event_service = EventService(event_repo)
    reviews = await event_service.get_event_reviews(event_id)
    return reviews
