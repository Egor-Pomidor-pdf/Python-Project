from sqlalchemy.ext.asyncio import AsyncSession
from ticket_booking.domain.models.specialist import Specialist 


class SpecialistRepository:

    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def register_specialist(self, Username: str, Role: str):
        self.session.add(Specialist(username=Username, role=Role))
        self.session.commit()