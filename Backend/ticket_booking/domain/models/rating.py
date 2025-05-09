from sqlalchemy import Column, Integer, Float, ForeignKey
from ticket_booking.infrastructure.database import Base
from pydantic import BaseModel, Field


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    score = Column(Float)


class RatingOut(BaseModel):
    id: int
    user_id: int
    event_id: int
    score: float = Field(..., ge=1, le=10)

    class Config:
        from_attributes = True
