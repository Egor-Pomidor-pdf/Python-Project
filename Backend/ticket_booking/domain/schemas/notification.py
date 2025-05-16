from pydantic import BaseModel
from datetime import datetime

class NotificationOut(BaseModel):
    id: int
    user_id: int
    event_id: int
    message: str
    created_at: datetime
    status: str
    notification_type: str

    class Config:
        from_attributes = True