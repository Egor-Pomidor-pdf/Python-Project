from ticket_booking.domain.repositories.notification import NotificationRepository
from ticket_booking.domain.models.notification import Notification
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.repositories.user import UserRepository
from ticket_booking.domain.models.user import User
from sqlalchemy import select
import logging
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, notification_repo: NotificationRepository, event_repo: EventRepository,
                 user_repo: UserRepository, session):
        self.notification_repo = notification_repo
        self.event_repo = event_repo
        self.user_repo = user_repo
        self.session = session

    async def create_purchase_notification(self, user_id: int, event_id: int):
        event = await self.event_repo.get_by_id(event_id)
        message = f"Вы успешно приобрели билет на {event.name} в городе {event.city} ({event.date})!"
        notification_data = {
            "user_id": user_id,
            "event_id": event_id,
            "message": message,
            "notification_type": "purchase"
        }
        logger.info(f"Создание уведомления о покупке для пользователя {user_id} на событие {event_id}")
        return await self.notification_repo.create(notification_data)

    async def create_recommendation_notification(self, user_id: int, event_id: int, recommendation_type: str):
        event = await self.event_repo.get_by_id(event_id)
        if recommendation_type == "city":
            message = f"Рекомендуем событие в вашем городе: {event.name} ({event.date})!"
        else:
            message = f"Рекомендуем событие по вашим интересам: {event.name} в городе {event.city} ({event.date})!"
        notification_data = {
            "user_id": user_id,
            "event_id": event_id,
            "message": message,
            "notification_type": recommendation_type
        }
        logger.info(f"Создание {recommendation_type} уведомления для пользователя {user_id} на событие {event_id}")
        return await self.notification_repo.create(notification_data)

    async def check_and_notify_recommendations(self):
        users = await self.session.execute(select(User))
        users = users.scalars().all()

        for user in users:
            city_filters = {"city": user.city}
            city_events_result = await self.event_repo.filter_events(city_filters)
            city_events = city_events_result["events"]
            if city_events:
                event = random.choice(city_events)
                existing_city_notification = await self.session.execute(
                    select(Notification).where(
                        Notification.user_id == user.id,
                        Notification.event_id == event.id,
                        Notification.notification_type == "city"
                    )
                )
                if not existing_city_notification.scalar_one_or_none():
                    await self.create_recommendation_notification(user.id, event.id, "city")
                    continue

            if not user.preferences or not any(user.preferences):
                continue

            for genre in user.preferences:
                genre_filters = {"genre": genre}
                events_result = await self.event_repo.filter_events(genre_filters)
                events = events_result["events"]
                if not events:
                    continue

                event = random.choice(events)
                existing_genre_notification = await self.session.execute(
                    select(Notification).where(
                        Notification.user_id == user.id,
                        Notification.event_id == event.id,
                        Notification.notification_type == "genre"
                    )
                )
                if not existing_genre_notification.scalar_one_or_none():
                    await self.create_recommendation_notification(user.id, event.id, "genre")
                    break