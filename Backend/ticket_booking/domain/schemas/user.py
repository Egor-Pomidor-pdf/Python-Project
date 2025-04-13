from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    last_name: str
    first_name: str
    middle_name: Optional[str] = None
    username: str
    phone_number: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    login: str
    password: str

class UserOut(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class Register_specialist(BaseModel):
    username: str
    role: str