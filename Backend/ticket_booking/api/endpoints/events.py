from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from jose import JWTError, jwt
from ticket_booking.domain.schemas.event import EventFilter
from ticket_booking.domain.schemas.rating import RatingOut, ReviewCreate, ReviewOut
from ticket_booking.services.event import EventService
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.infrastructure.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from ticket_booking.core.config import settings
from ticket_booking.core.security import oauth2_scheme
from ticket_booking.domain.repositories.user import UserRepository
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/events", tags=["events"])


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
        return rating  # The service method already returns a RatingOut object
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
        return review  # The service method returns a ReviewOut-compatible object
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

