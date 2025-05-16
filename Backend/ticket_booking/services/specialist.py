from ticket_booking.domain.repositories.specialists import SpecialistRepository
from fastapi import HTTPException


class SpecialistService:
    
    def __init__(self, specialist_repository: SpecialistRepository):
        self.specialist_repository = specialist_repository

    async def register_specialist(self, name: str, role: str):
        await self.specialist_repository.register_specialist(name, role)
        return HTTPException(status_code=201, detail="Администратор успешно зарегистрирован")