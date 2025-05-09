from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ticket_booking.domain.models.event import Event
from ticket_booking.domain.models.rating import Rating
from ticket_booking.domain.models.review import Review
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
        query = select(Event).join(
            Rating,
            (Event.id == Rating.event_id),
            isouter=True
        )

        if filters.get('name'):
            query = query.where(Event.name.ilike(f"%{filters['name']}%"))
        if filters.get('city'):
            query = query.where(Event.city.ilike(f"%{filters['city']}%"))
        if filters.get('genre'):
            query = query.where(Event.genre.ilike(f"%{filters['genre']}%"))
        if filters.get('date_from'):
            query = query.where(Event.date >= filters['date_from'])
        if filters.get('date_to'):
            query = query.where(Event.date <= filters['date_to'])
        if filters.get('price_min') is not None:
            query = query.where(Event.price >= filters['price_min'])
        if filters.get('price_max') is not None:
            query = query.where(Event.price <= filters['price_max'])
        if filters.get('min_rating') is not None:
            subquery = select(
                Event.id,
                func.avg(Rating.score).label("avg_rating")
            ).join(
                Rating,
                Event.id == Rating.event_id,
                isouter=True
            ).group_by(Event.id).subquery()
            query = query.join(subquery, Event.id == subquery.c.id).where(
                subquery.c.avg_rating >= filters['min_rating'])

        count_query = select(func.count()).select_from(query.subquery())
        total_count = (await self.session.execute(count_query)).scalar()

        page = filters.get('page', 1)
        page_size = filters.get('page_size', 10)
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.session.execute(query)
        events = result.scalars().all()

        event_ratings = {}
        for event in events:
            rating_query = select(func.avg(Rating.score)).where(Rating.event_id == event.id)
            avg_rating = (await self.session.execute(rating_query)).scalar() or 0
            event_ratings[event.id] = avg_rating

        return {
            "events": events,
            "ratings": event_ratings,
            "total_count": total_count,
            "page": page,
            "page_size": page_size
        }

    async def update_tickets(self, event_id: int, ticket_count: int):
        event = await self.get_by_id(event_id)
        if event.available_tickets < ticket_count:
            raise NotEnoughTicketsException(f"Только {event.available_tickets} билетов осталось")
        event.available_tickets -= ticket_count
        await self.session.flush()
        return event

    async def add_rating(self, user_id: int, event_id: int, score: float):
        rating = Rating(user_id=user_id, event_id=event_id, score=score)
        self.session.add(rating)
        await self.session.flush()
        return rating

    async def add_review(self, user_id: int, event_id: int, comment: str):
        from datetime import datetime
        review = Review(user_id=user_id, event_id=event_id, comment=comment,
                        created_at=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        self.session.add(review)
        await self.session.flush()
        return review

    async def get_reviews(self, event_id: int):
        result = await self.session.execute(select(Review).where(Review.event_id == event_id))
        return result.scalars().all()
