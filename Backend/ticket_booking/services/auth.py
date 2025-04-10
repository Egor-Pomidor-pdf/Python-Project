from ticket_booking.core.security import get_password_hash, verify_password, create_access_token
from ticket_booking.core.exceptions import InvalidCredentialsException
from ticket_booking.domain.repositories.user import UserRepository


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repo = user_repository

    async def register_user(self, user_data: dict):
        user_data['password_hash'] = get_password_hash(user_data.pop('password'))
        user = await self.user_repo.create(user_data)
        return {"message": "Пользователь был успешно зарегистрирован"}

    async def authenticate_user(self, login: str, password: str):
        user = await self.user_repo.authenticate(login, password)
        if not user or not verify_password(password, user.password_hash):
            raise InvalidCredentialsException("Неверный логин или пароль")

        return {
            "message": "Вход выполнен успешно",
            "access_token": create_access_token({"sub": user.username}),
            "token_type": "bearer"
        }