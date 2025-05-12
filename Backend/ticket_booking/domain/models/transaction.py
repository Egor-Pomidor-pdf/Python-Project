from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from ticket_booking.infrastructure.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    amount = Column(Float)
    status = Column(String)
    transaction_date = Column(DateTime)
