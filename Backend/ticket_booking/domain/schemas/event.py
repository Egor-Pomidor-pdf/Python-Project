from pydantic import BaseModel, Field
from typing import Optional

class EventCreate(BaseModel):
    name: str
    date: str
    city: str
    price: float
    available_tickets: int

class EventOut(BaseModel):
    id: int
    name: str
    date: str
    city: str
    price: float
    available_tickets: int

    class Config:
        orm_mode = True

class EventFilter(BaseModel):
    name: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    city: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None

class BookTicketRequest(BaseModel):
    event_id: int
    ticket_count: int = Field(..., gt=0, le=10)