from sqlalchemy import Column, Integer, String, Float
from ticket_booking.infrastructure.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    date = Column(String)
    city = Column(String)
    price = Column(Float)
    available_tickets = Column(Integer)