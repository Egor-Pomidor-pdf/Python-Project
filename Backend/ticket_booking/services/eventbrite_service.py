import httpx
import logging
from ticket_booking.core.config import settings
from ticket_booking.core.exceptions import EventNotFoundException

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EventbriteService:
    def __init__(self):
        self.base_url = "https://www.eventbriteapi.com/v3"
        self.token = settings.EVENTBRITE_API_TOKEN
        self.organization_id = "2751032919871"  # Ваш User ID как Organization ID

    async def validate_token(self):
        """Проверка действительности API-ключа через /users/me/."""
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.token}"}
            try:
                logger.info("Проверка API-ключа через /users/me/")
                response = await client.get(
                    f"{self.base_url}/users/me/",
                    headers=headers
                )
                response.raise_for_status()
                logger.info("API-ключ действителен")
                return True
            except httpx.HTTPStatusError as e:
                logger.error(f"Ошибка проверки API-ключа: {e.response.status_code} - {e.response.text}")
                return False
            except httpx.RequestError as e:
                logger.error(f"Ошибка запроса при проверке ключа: {str(e)}")
                return False

    async def test_api(self):
        """Тестовый запрос к /categories/ для диагностики."""
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.token}"}
            try:
                logger.info("Выполнение тестового запроса к /categories/")
                response = await client.get(
                    f"{self.base_url}/categories/",
                    headers=headers
                )
                response.raise_for_status()
                logger.info("Тестовый запрос успешен")
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Ошибка тестового запроса: {e.response.status_code} - {e.response.text}")
                raise Exception(f"Ошибка тестового запроса: {e.response.status_code} - {e.response.text}")
            except httpx.RequestError as e:
                logger.error(f"Ошибка запроса: {str(e)}")
                raise Exception(f"Ошибка тестового запроса: {str(e)}")

    async def fetch_public_events(self, search_params: dict, page: int = 1, page_size: int = 50):
        if not await self.validate_token():
            raise Exception("Недействительный API-ключ Eventbrite. Проверьте EVENTBRITE_API_TOKEN в config.py.")

        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.token}"}
            params = {"page": page, "page_size": page_size, **search_params}
            try:
                logger.info(f"Запрос к Eventbrite API: {self.base_url}/organizations/{self.organization_id}/events/ с параметрами {params}")
                response = await client.get(
                    f"{self.base_url}/organizations/{self.organization_id}/events/",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                logger.info(f"Успешный ответ от Eventbrite API: {response.status_code}")
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Ошибка API: {e.response.status_code} - {e.response.text}")
                raise Exception(f"Ошибка API Eventbrite: {e.response.status_code} - {e.response.text}")
            except httpx.RequestError as e:
                logger.error(f"Ошибка запроса: {str(e)}")
                raise Exception(f"Ошибка запроса к Eventbrite: {str(e)}")

    async def fetch_organization_events(self, organization_id: str, page: int = 1, page_size: int = 50):
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.token}"}
            params = {"page": page, "page_size": page_size}
            try:
                response = await client.get(
                    f"{self.base_url}/organizations/{organization_id}/events/",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Ошибка API: {e.response.status_code} - {e.response.text}")
                raise

    async def fetch_event_details(self, event_id: str):
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.token}"}
            try:
                response = await client.get(
                    f"{self.base_url}/events/{event_id}/",
                    headers=headers
                )
                if response.status_code == 404:
                    raise EventNotFoundException()
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Ошибка API: {e.response.status_code} - {e.response.text}")
                raise