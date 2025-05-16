from sqlalchemy import Column, Integer, String, ForeignKey
from ticket_booking.infrastructure.database import Base

class Specialist(Base):
    __tablename__ = 'specialists'

    id = Column(Integer, primary_key=True, index=False)
    user_id = Column(Integer, ForeignKey('users.username'))
    username = Column(String, unique=True, index=False)
    role = Column(String, unique=False, index=False)