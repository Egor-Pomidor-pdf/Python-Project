from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from ticket_booking.domain.models.event import Event
from ticket_booking.core.exceptions import EventNotFoundException, NotEnoughTicketsException

class EventRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, event_data: dict):
        event = Event(**event_data)
        self.session.add(event)
        await self.session.flush()
        return event

    async def get_by_id(self, event_id: int):
        result = await self.session.execute(select(Event).where(Event.id == event_id))
        event = result.scalar_one_or_none()
        if not event:
            raise EventNotFoundException()
        return event

    async def filter_events(self, filters: dict):
        query = select(Event)
        if filters.get('name'):
            query = query.where(Event.name.ilike(f"%{filters['name']}%"))
        if filters.get('city'):
            query = query.where(Event.city.ilike(f"%{filters['city']}%"))
        if filters.get('date_from'):
            query = query.where(Event.date >= filters['date_from'])
        if filters.get('date_to'):
            query = query.where(Event.date <= filters['date_to'])
        if filters.get('price_min') is not None:
            query = query.where(Event.price >= filters['price_min'])
        if filters.get('price_max') is not None:
            query = query.where(Event.price <= filters['price_max'])

        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_tickets(self, event_id: int, ticket_count: int):
        event = await self.get_by_id(event_id)
        if event.available_tickets < ticket_count:
            raise NotEnoughTicketsException(f"Только {event.available_tickets} билетов осталось")
        event.available_tickets -= ticket_count
        await self.session.flush()
        return event