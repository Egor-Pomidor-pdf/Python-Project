from faker import Faker
import random
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
        events = await self.event_repo.filter_events(filters)
        return [{
            "id": event.id,
            "name": event.name,
            "date": event.date,
            "city": event.city,
            "price": event.price,
            "available_tickets": event.available_tickets
        } for event in events]