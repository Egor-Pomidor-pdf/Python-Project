from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ticket_booking.domain.models.specialist import Specialist 


class SpecialistRepository:

    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def register_specialist(self, Username: str, Role: str):
        self.session.add(Specialist(username=Username, role=Role))
        self.session.commit()

    async def is_specialist(self, Username: str):
        result = await self.session.execute(select(Specialist).where(Specialist.username == Username))

        return result.scalars().first() is not None