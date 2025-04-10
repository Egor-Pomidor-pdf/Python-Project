from pydantic import BaseModel, Field
from datetime import datetime

class RequestPayment(BaseModel):
    card_number: str = Field(..., min_length=16, max_length=19, pattern=r'^[\d]{4}[\s][\d]{4}[\s][\d]{4}[\s][\d]{4}$')
    expiry_date: str = Field(..., pattern=r'^(0[1-9]|1[0-2])\/?([0-9]{2})$')
    card_holder: str = Field(..., min_length=2, pattern=r"^[A-Z]+[\s][A-Z]+$")
    cvv: str = Field(..., min_length=3, max_length=3, pattern=r'^\d+$')

class TransactionOut(BaseModel):
    id: int
    event_id: int
    amount: float
    status: str
    transaction_date: datetime

    class Config:
        orm_mode = True