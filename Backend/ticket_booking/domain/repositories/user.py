from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from ticket_booking.domain.models.user import User
from ticket_booking.core.exceptions import UserAlreadyExistsException


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_username(self, username: str):
        result = await self.session.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str):
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str):
        result = await self.session.execute(select(User).where(User.phone_number == phone))
        return result.scalar_one_or_none()

    async def create(self, user_data: dict):
        if await self.get_by_username(user_data['username']):
            raise UserAlreadyExistsException("Имя пользователя занято")
        if await self.get_by_email(user_data['email']):
            raise UserAlreadyExistsException("Email занят")
        if await self.get_by_phone(user_data['phone_number']):
            raise UserAlreadyExistsException("Номер телефона занят")

        user = User(**user_data)
        self.session.add(user)
        await self.session.flush()
        return user

    async def authenticate(self, login: str):
        user = await self.get_by_username(login)
        if not user:
            user = await self.get_by_email(login)
        if not user:
            user = await self.get_by_phone(login)
        return user

    async def update(self, user_id: int, update_data: dict):
        result = await self.session.execute(
            update(User).where(User.id == user_id).values(**update_data).returning(User)
        )
        updated_user = result.scalar_one_or_none()
        if not updated_user:
            raise ValueError("Пользователь не найден")
        await self.session.flush()
        return updated_user
