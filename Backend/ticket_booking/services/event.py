from faker import Faker
import random
from ticket_booking.domain.schemas.event import EventCreate
from fastapi import HTTPException, status
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.schemas.rating import ReviewOut
from ticket_booking.core.exceptions import EventNotFoundException, NotEnoughTicketsException



class EventService:
    def __init__(self, event_repository: EventRepository):
        self.event_repo = event_repository

    async def generate_events(self, count: int = 50):
        fake = Faker('ru_RU')
        cities = ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань"]
        genres = ["Концерт", "Театр", "Выставка", "Семинар", "Фестиваль"]

        for _ in range(count):
            event_data = {
                "name": fake.sentence(nb_words=4),
                "date": fake.future_datetime(end_date='+30d').strftime('%Y-%m-%d %H:%M:%S'),
                "city": random.choice(cities),
                "genre": random.choice(genres),
                "price": round(random.uniform(1000, 10000), 2),
                "available_tickets": random.randint(50, 200)
            }
            await self.event_repo.create(event_data)

        return {"message": f"{count} мероприятий успешно сгенерированы"}

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

    async def add_rating(self, user_id: int, event_id: int, score: float):
        if not 1 <= score <= 10:
            raise ValueError("Оценка должна быть от 1 до 10")
        return await self.event_repo.add_rating(user_id, event_id, score)

    async def add_review(self, user_id: int, event_id: int, comment: str):
        if not comment or len(comment.strip()) == 0:
            raise ValueError("Отзыв не может быть пустым")
        return await self.event_repo.add_review(user_id, event_id, comment)

    async def get_event_reviews(self, event_id: int):
        reviews = await self.event_repo.get_reviews(event_id)
        return [ReviewOut(id=review.id, user_id=review.user_id, event_id=review.event_id, comment=review.comment,
                          created_at=review.created_at) for review in reviews]

    
    async def archive_event(self, event_id: int):
        event = await self.event_repo.archive_event(event_id)
        
        if not event:
            raise EventNotFoundException()
        
        return {
            "id": event.id,
            "name": event.name,
            "date": event.date,
            "city": event.city,
            "price": event.price,
            "available_tickets": event.available_tickets,
            "is_archived": event.is_archived
        }
        
    async def delete_event(self, event_id: int):
        try:
            await self.event_repo.delete_event(event_id)
        except Exception:
            raise EventNotFoundException()
        
    async def create_event(self, event_data: EventCreate):
        try:
            return await self.event_repo.create_event(event_data)
        except Exception:
            raise EventNotFoundException()