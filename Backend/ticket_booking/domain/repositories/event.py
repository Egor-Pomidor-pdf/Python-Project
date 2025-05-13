from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from ticket_booking.domain.schemas.event import EventCreate
from ticket_booking.domain.models.event import Event
from ticket_booking.domain.models.rating import RatingOut
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

    async def get_by_name_and_date(self, name: str, date: str):
        result = await self.session.execute(
            select(Event).where(Event.name == name, Event.date == date)
        )
        return result.scalar_one_or_none()

    async def filter_events(self, filters: dict):
        query = select(Event)

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
                func.avg(RatingOut.score).label("avg_rating")
            ).join(
                RatingOut,
                Event.id == RatingOut.event_id,
                isouter=True
            ).group_by(Event.id).subquery()
            query = query.join(subquery, Event.id == subquery.c.id, isouter=True).where(
                (subquery.c.avg_rating >= filters['min_rating']) | (subquery.c.avg_rating.is_(None))
            )

        count_query = select(func.count()).select_from(query.subquery())
        total_count = (await self.session.execute(count_query)).scalar()

        page = filters.get('page', 1)
        page_size = filters.get('page_size', 10)
        query = query.distinct().offset((page - 1) * page_size).limit(page_size)

        result = await self.session.execute(query)
        events = result.scalars().all()

        event_ratings = {}
        rating_subquery = select(
            RatingOut.event_id,
            func.avg(RatingOut.score).label("avg_rating")
        ).group_by(RatingOut.event_id).subquery()

        rating_result = await self.session.execute(select(rating_subquery.c.event_id, rating_subquery.c.avg_rating))
        for event_id, avg_rating in rating_result:
            event_ratings[event_id] = avg_rating or 0

        return {
            "events": events,
            "ratings": event_ratings,
            "total_count": total_count,
            "page": page,
            "page_size": page_size
        }

    async def update_tickets(self, event_id: int, ticket_count: int):
        event = await self.get_by_id(event_id)
        new_ticket_count = event.available_tickets - ticket_count
        if new_ticket_count < 0:
            raise NotEnoughTicketsException(f"Осталось только {event.available_tickets} билетов")
        event.available_tickets = new_ticket_count
        await self.session.flush()
        return event

    async def add_rating(self, user_id: int, event_id: int, score: float):
        rating = RatingOut(user_id=user_id, event_id=event_id, score=score)
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

    async def get_reviews_by_user(self, user_id: int):
        result = await self.session.execute(select(Review).where(Review.user_id == user_id))
        return result.scalars().all()

    async def get_ratings_by_user(self, user_id: int):
        result = await self.session.execute(select(RatingOut).where(RatingOut.user_id == user_id))
        return result.scalars().all()

    async def get_ratings_by_event(self, event_id: int):
        result = await self.session.execute(select(RatingOut).where(RatingOut.event_id == event_id))
        return result.scalars().all()
    
    async def archive_event(self, event_id: int):
        result = await self.session.execute(select(Event).where(Event.id == event_id))
        event = result.scalar_one_or_none()
        if not event:
            raise EventNotFoundException()
        
        event.is_archived = True
        return event
    
    async def delete_event(self, event_id: int):
        result = await self.session.execute(select(Event).where(Event.id == event_id))
        event = result.scalar_one_or_none()
        if not event:
            raise EventNotFoundException()
        
        try:
            await self.session.delete(event)
        except Exception:
            raise EventNotFoundException()
        
    async def create_event(self, event_data: EventCreate):
        event = Event(
            name=event_data.name,
            date=event_data.date,
            city=event_data.city,
            price=event_data.price,
            available_tickets=event_data.available_tickets,
            is_archived=event_data.is_archived
        )

        try:
            self.session.add(event)
            return await self.session.flush()
        except Exception:
            raise EventNotFoundException()
