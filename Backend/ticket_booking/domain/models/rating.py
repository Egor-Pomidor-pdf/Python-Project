from sqlalchemy import Column, Integer, Float, ForeignKey, String
from ticket_booking.infrastructure.database import Base


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    score = Column(Float)