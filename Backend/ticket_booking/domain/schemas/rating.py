from pydantic import BaseModel, Field
from typing import Optional


class RatingOut(BaseModel):
    id: int
    username: str
    user_id: int
    event_id: int
    score: float = Field(..., ge=1, le=10)

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    event_id: int
    comment: str


class ReviewOut(BaseModel):
    id: int
    username: str
    user_id: int
    event_id: int
    comment: str
    created_at: str
    score: Optional[float] = None

    class Config:
        from_attributes = True
