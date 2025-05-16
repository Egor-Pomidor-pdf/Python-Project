from ticket_booking.core.security import get_password_hash, verify_password, create_access_token
from ticket_booking.core.exceptions import InvalidCredentialsException
from ticket_booking.domain.repositories.user import UserRepository
import json
from fastapi import HTTPException


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repo = user_repository

    async def register_user(self, user_data: dict):
        if 'password' not in user_data:
            raise HTTPException(status_code=400, detail="Поле 'password' обязательно")

        password = user_data.pop('password')
        user_data['password_hash'] = get_password_hash(password, user_data['username'])

        if 'preferences' not in user_data or user_data['preferences'] is None:
            user_data['preferences'] = []
        elif not isinstance(user_data['preferences'], list):
            raise ValueError("Preferences must be a list of strings or null")

        user_data['preferences'] = json.loads(json.dumps(user_data['preferences'], ensure_ascii=False))

        user = await self.user_repo.create(user_data)
        return {"message": "Пользователь был успешно зарегистрирован"}

    async def authenticate_user(self, login: str, password: str):
        user = await self.user_repo.authenticate(login)
        if not user or not verify_password(password, user.password_hash, user.username):
            raise InvalidCredentialsException("Неверный логин или пароль")

        return {
            "user_id": user.id,
            "message": "Вход выполнен успешно",
            "access_token": create_access_token({"sub": user.username}),
            "token_type": "bearer"
        }

    async def get_user_by_username(self, username: str):
        user = await self.user_repo.get_by_username(username)
        if not user:
            raise ValueError("Пользователь не найден")
        return user
