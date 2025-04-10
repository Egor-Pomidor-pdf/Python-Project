from sqlalchemy import Column, Integer, String
from ticket_booking.infrastructure.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    middle_name = Column(String, nullable=True)
    email = Column(String, unique=True)
    phone_number = Column(String, unique=True)
    password_hash = Column(String)