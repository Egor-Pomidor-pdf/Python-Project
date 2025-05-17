from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from ticket_booking.infrastructure.database import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="unread")  
    notification_type = Column(String, default="purchase")