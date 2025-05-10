from faker import Faker
import random
from fastapi import HTTPException, status
from ticket_booking.domain.repositories.event import EventRepository


class EventService:
    def __init__(self, event_repository: EventRepository):
        self.event_repo = event_repository

    async def generate_events(self, count: int = 50):
        fake = Faker('ru_RU')
        cities = ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань"]

        for _ in range(count):
            event_data = {
                "name": fake.sentence(nb_words=4),
                "date": fake.future_datetime(end_date='+30d').strftime('%Y-%m-%d %H:%M:%S'),
                "city": random.choice(cities),
                "price": round(random.uniform(1000, 10000), 2),
                "available_tickets": random.randint(50, 200)
            }
            await self.event_repo.create(event_data)

        return {"message": f"{count} мероприятий успешно сгенерированы"}

    async def filter_events(self, filters: dict):
        result = await self.event_repo.filter_events(filters)
        events = [{
            "id": event.id,
            "name": event.name,
            "date": event.date,
            "city": event.city,
            "price": event.price,
            "available_tickets": event.available_tickets
        } for event in result['events']]

        return {
            "events": events,
            "total_count": result['total_count'],
            "page": result['page'],
            "page_size": result['page_size'],
            "total_pages": (result['total_count'] + result['page_size'] - 1) // result['page_size']
        }
    
    async def archive(self, event_id: int):
        try:
            event = await self.event_repo.archive(event_id)
            return {
                "id": event.id,
                "name": event.name,
                "date": event.date,
                "city": event.city,
                "price": event.price,
                "available_tickets": event.available_tickets,
                "is_archived": event.is_archived
            }
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Мероприятие с ID {event_id} не найдено"
            )
        