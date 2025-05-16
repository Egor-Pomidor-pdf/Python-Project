from sqlalchemy import Column, Integer, String, ForeignKey
from ticket_booking.infrastructure.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    comment = Column(String, nullable=True)
    created_at = Column(String, nullable=True)
