from pydantic import BaseModel, Field


class RatingOut(BaseModel):
    id: int
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
    user_id: int
    event_id: int
    comment: str
    created_at: str

    class Config:
        from_attributes = True
