from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum


class Genre(str, Enum):
    THEATRE = "театр"
    CINEMA = "кино"
    SPORTS = "спорт"
    MUSIC = "музыка"
    MAGIC = "магия"
    PERFORMANCE = "перформанс"


class UserCreate(BaseModel):
    last_name: str
    first_name: str
    middle_name: Optional[str] = None
    username: str
    phone_number: str
    email: EmailStr
    password: str
    city: str
    preferences: Optional[List[Genre]] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    username: str
    email: str
    phone_number: str
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    city: Optional[str] = None
    preferences: Optional[List[Genre]] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    preferences: Optional[List[Genre]] = None

class Register_specialist(BaseModel):
    username: str
    role: str
    city: Optional[str] = None
    preferences: Optional[List[Genre]] = None