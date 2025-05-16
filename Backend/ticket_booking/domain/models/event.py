from sqlalchemy import Column, Integer, String, Float, Boolean
from ticket_booking.infrastructure.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    date = Column(String)
    city = Column(String)
    genre = Column(String, nullable=True)
    price = Column(Float)
    available_tickets = Column(Integer)
    is_archived = Column(Boolean, default=False)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)