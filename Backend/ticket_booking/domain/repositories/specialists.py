from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import Session
from ticket_booking.domain.models.specialist import Specialist 
from ticket_booking.domain.models.user import User 


class SpecialistRepository:

    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def register_specialist(self, Username: str, Role: str):
        self.session.add(Specialist(username=Username, role=Role))
        user = await self.session.execute(select(User).where(User.username == Username))
        user = user.scalar_one()
        user.is_specialist = True
        self.session.commit()

    async def is_specialist(self, Username: str):
        try:
            result = await self.session.execute(select(Specialist).where(Specialist.username == Username))
            return result.scalar_one().username
        except Exception:
            return False