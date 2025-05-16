import httpx
import logging
from datetime import datetime, timedelta
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.models.event import Event
from ticket_booking.core.config import settings
import random
import asyncio
from ticket_booking.domain.schemas.rating import ReviewOut, RatingOut
from ticket_booking.domain.models.rating import Rating
from ticket_booking.domain.models.user import User
from sqlalchemy import select, delete

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EventService:
    def __init__(self, event_repository: EventRepository):
        self.event_repo = event_repository
        self.ticketmaster_api_key = settings.TICKETMASTER_API_KEY
        self.base_url = "https://app.ticketmaster.com/discovery/v2/events.json"

    async def generate_events(self, session, count: int = 50):
        logger.info(f"Запрашиваем все события: count={count}")
        async with httpx.AsyncClient() as client:
            saved_count = 0
            page = 0
            params = {
                "apikey": self.ticketmaster_api_key,
                "size": min(count, 100),
                "sort": "date,asc",
                "page": page,
                "startDateTime": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            }

            try:
                while saved_count < count:
                    logger.info(f"Запрос страницы {page + 1}")
                    for attempt in range(3):
                        try:
                            response = await client.get(self.base_url, params=params)
                            response.raise_for_status()
                            data = response.json()
                            logger.info(f"Получен ответ API: {data.get('page', {})}")
                            break
                        except httpx.HTTPStatusError as e:
                            if e.response.status_code == 429:
                                logger.warning(f"Лимит запросов, попытка {attempt + 1}/3, ждем {2 ** attempt} сек")
                                await asyncio.sleep(2 ** attempt)
                                continue
                            logger.error(f"Ошибка API Ticketmaster: {e.response.status_code} - {e.response.text}")
                            raise ValueError(f"Ошибка API Ticketmaster: {e.response.status_code} - {e.response.text}")
                    else:
                        raise ValueError("Превышен лимит запросов к Ticketmaster API")

                    events = data.get("_embedded", {}).get("events", [])
                    if not events:
                        logger.warning("События не найдены на странице %d", page)
                        break

                    for event in events:
                        if saved_count >= count:
                            break

                        city = self._get_city(event)
                        if city == "Нет":
                            logger.info(
                                f"Пропускаем событие '{event.get('name', 'Unknown Event')}' из-за отсутствия города")
                            continue

                        event_date = self._parse_event_date(event)
                        try:
                            event_datetime = datetime.strptime(event_date, "%Y-%m-%d %H:%M:%S")
                            if event_datetime < datetime.now():
                                logger.info(f"Пропускаем событие '{event.get('name')}' с прошедшей датой {event_date}")
                                continue
                        except ValueError:
                            logger.warning(f"Неверный формат даты для события '{event.get('name')}'")
                            continue

                        event_data = {
                            "name": event.get("name", "Unknown Event"),
                            "date": event_date,
                            "city": city,
                            "genre": self._map_genre(self._get_genre(event)),
                            "price": self._get_price(event),
                            "available_tickets": random.randint(50, 200),
                            "description": self._get_description(event),
                        }
                        existing_event = await self.event_repo.get_by_name_and_date(
                            event_data["name"], event_data["date"]
                        )
                        if existing_event:
                            logger.info(f"Событие '{event_data['name']}' уже существует, пропускаем")
                            continue
                        await self.event_repo.create(event_data)
                        saved_count += 1
                        logger.info(f"Добавлено событие: {event_data['name']}")

                    total_pages = data.get("page", {}).get("totalPages", 1)
                    page += 1
                    params["page"] = page
                    if page >= total_pages:
                        logger.info("Достигнута последняя страница событий")
                        break

                return {"message": f"{saved_count} мероприятий успешно добавлены в базу данных"}

            except Exception as e:
                logger.error(f"Ошибка при загрузке событий: {str(e)}")
                await session.rollback()
                raise ValueError(f"Ошибка при загрузке событий: {str(e)}")

    async def delete_expired_events(self, session):
        logger.info("Удаление прошедших событий")
        try:
            result = await session.execute(
                delete(Event).where(
                    Event.date < datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                )
            )
            await session.commit()
            logger.info(f"Удалено {result.rowcount} прошедших событий")
            return result.rowcount
        except Exception as e:
            await session.rollback()
            logger.error(f"Ошибка при удалении прошедших событий: {str(e)}")
            raise ValueError(f"Ошибка при удалении событий: {str(e)}")

    def _map_genre(self, genre: str) -> str:
        genre = genre.lower()
        genre_mapping = {
            "rock": "музыка",
            "pop": "музыка",
            "jazz": "музыка",
            "classical": "музыка",
            "concert": "музыка",
            "drama": "театр",
            "comedy": "театр",
            "musical": "театр",
            "movie": "кино",
            "film": "кино",
            "football": "спорт",
            "basketball": "спорт",
            "hockey": "спорт",
            "magic": "магия",
            "illusion": "магия",
            "performance": "перформанс",
            "dance": "перформанс",
            "circus": "перформанс",
        }
        for key, value in genre_mapping.items():
            if key in genre:
                return value
        return "разное"

    def _parse_event_date(self, event: dict) -> str:
        date_info = event.get("dates", {}).get("start", {})
        local_date = date_info.get("localDate")
        local_time = date_info.get("localTime", "00:00:00")
        if local_date:
            return f"{local_date} {local_time}"
        return (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S")

    def _get_city(self, event: dict) -> str:
        venues = event.get("_embedded", {}).get("venues", [])
        if venues:
            city = venues[0].get("city", {}).get("name")
            if city and city.lower() not in ["undefined", "unknown", "не указан", "miscellaneous", "other"]:
                return city

            if "address" in venues[0]:
                address = venues[0]["address"]
                city = address.get("city") or address.get("locality")
                if city and city.lower() not in ["undefined", "unknown", "не указан", "miscellaneous", "other"]:
                    return city

            if "location" in event:
                city = event["location"].get("city")
                if city and city.lower() not in ["undefined", "unknown", "не указан", "miscellaneous", "other"]:
                    return city

        logger.warning(f"Город не найден для события: {event.get('name', 'Unknown Event')}")
        return "Нет"

    def _get_genre(self, event: dict) -> str:
        classifications = event.get("classifications", [])
        if classifications:
            genre = classifications[0].get("genre")
            if genre:
                genre_name = genre.get("name")
                if genre_name and genre_name.lower() not in ["undefined", "unknown", "не указан", "miscellaneous",
                                                             "other"]:
                    return genre_name

            segment = classifications[0].get("segment")
            if segment:
                segment_name = segment.get("name")
                if segment_name and segment_name.lower() not in ["undefined", "unknown", "не указан", "miscellaneous",
                                                                 "other"]:
                    return segment_name

            sub_genre = classifications[0].get("subGenre")
            if sub_genre:
                sub_genre_name = sub_genre.get("name")
                if sub_genre_name and sub_genre_name.lower() not in ["undefined", "unknown", "не указан",
                                                                     "miscellaneous", "other"]:
                    return sub_genre_name

        logger.warning(f"Жанр не найден для события: {event.get('name', 'Unknown Event')}")
        return "Разное"

    def _get_price(self, event: dict) -> float:
        price_ranges = event.get("priceRanges", [])
        if price_ranges:
            return float(price_ranges[0].get("min", 1000.0))
        return round(random.uniform(1000, 10000), 2)

    def _get_description(self, event: dict) -> str:
        description = event.get("info") or event.get("description") or event.get("pleaseNote")
        if description and description.lower() not in ["undefined", "unknown", "не указан", "miscellaneous", "other"]:
            return description[:1000]

        name = event.get("name", "неизвестное мероприятие")
        genre = self._get_genre(event)
        city = self._get_city(event)
        date = self._parse_event_date(event)

        if genre != "Разное":
            return f"Уникальное мероприятие {genre} в городе {city} состоится {date}. Не упустите шанс посетить {name}!"
        return f"Мероприятие {name} пройдет {date} в городе {city}. Ожидайте анонсов!"

    async def filter_events(self, filters: dict):
        result = await self.event_repo.filter_events(filters)
        events = []
        for event in result['events']:
            event_data = {
                "id": event.id,
                "name": event.name,
                "date": event.date,
                "city": event.city,
                "genre": event.genre,
                "price": event.price,
                "available_tickets": event.available_tickets,
                "description": event.description,
                "average_rating": result['ratings'].get(event.id, 0)
            }
            events.append(event_data)

        return {
            "events": events,
            "total_count": result['total_count'],
            "page": result['page'],
            "page_size": result['page_size'],
            "total_pages": (result['total_count'] + result['page_size'] - 1) // result['page_size']
        }

    async def add_rating(self, session, user_id: int, event_id: int, score: float):
        if not 1 <= score <= 10:
            raise ValueError("Rating must be between 1 and 10")

        user = await session.get(User, user_id)
        if not user:
            raise ValueError("User not found")

        event = await self.event_repo.get_by_id(event_id)
        if not event:
            raise ValueError("Event not found")

        rating = Rating(
            user_id=user_id,
            event_id=event_id,
            score=score,
            username=user.username
        )
        session.add(rating)
        await session.flush()

        return RatingOut(
            id=rating.id,
            user_id=rating.user_id,
            event_id=rating.event_id,
            score=rating.score,
            username=rating.username
        )

    async def add_review(self, session, user_id: int, event_id: int, comment: str):
        if not comment or len(comment.strip()) == 0:
            raise ValueError("Отзыв не может быть пустым")
        user = await session.execute(select(User).where(User.id == user_id))
        user = user.scalar_one_or_none()
        if not user:
            raise ValueError("Пользователь не найден")
        return await self.event_repo.add_review(user_id, event_id, comment, user.username)

    async def get_event_reviews(self, session, event_id: int):
        reviews = await self.event_repo.get_reviews(event_id)
        ratings = await self.event_repo.get_ratings_by_event(event_id)

        rating_map = {rating.user_id: rating.score for rating in ratings}

        review_outs = []
        for review in reviews:
            score = rating_map.get(review.user_id)
            review_outs.append(
                ReviewOut(
                    id=review.id,
                    username=review.username or "Unknown",
                    user_id=review.user_id,
                    event_id=review.event_id,
                    comment=review.comment,
                    created_at=review.created_at,
                    score=score
                )
            )
        return review_outs
