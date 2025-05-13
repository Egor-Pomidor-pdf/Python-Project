from pydantic import BaseModel, EmailStr
from typing import Optional, List


class UserCreate(BaseModel):
    last_name: str
    first_name: str
    middle_name: Optional[str] = None
    username: str
    phone_number: str
    email: EmailStr
    password: str
    preferences: Optional[List[str]] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    preferences: Optional[List[str]] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    preferences: Optional[List[str]] = None


class Register_specialist(BaseModel):
    username: str
    role: str