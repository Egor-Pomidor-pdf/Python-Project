from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.sql import text
from ticket_booking.domain.models.notification import Notification
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NotificationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, notification_data: dict):
        notification = Notification(**notification_data)
        self.session.add(notification)
        await self.session.flush()
        return notification

    async def get_by_id(self, notification_id: int):
        result = await self.session.execute(select(Notification).where(Notification.id == notification_id))
        notification = result.scalar_one_or_none()
        return notification

    async def get_by_user_id(self, user_id: int):
        result = await self.session.execute(select(Notification).where(Notification.user_id == user_id))
        return result.scalars().all()

    async def mark_as_read(self, notification_id: int):
        notification = await self.session.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        notification = notification.scalar_one_or_none()
        if not notification:
            raise ValueError("Уведомление не найдено")
        notification.status = "read"
        await self.session.flush()
        return notification

    async def delete(self, notification_id: int):
        notification = await self.get_by_id(notification_id)
        if not notification:
            raise ValueError("Уведомление не найдено")

        # Delete the notification
        await self.session.delete(notification)
        await self.session.flush()

        # Update IDs of notifications with higher IDs
        await self.session.execute(
            update(Notification)
            .where(Notification.id > notification_id)
            .values(id=Notification.id - 1)
        )
        await self.session.flush()

        # Reset the auto-increment sequence if sqlite_sequence exists
        try:
            max_id_result = await self.session.execute(select(func.max(Notification.id)))
            max_id = max_id_result.scalar() or 0
            await self.session.execute(
                text("UPDATE sqlite_sequence SET seq = :max_id WHERE name = 'notifications'"),
                {"max_id": max_id}
            )
            await self.session.flush()
            logger.info(f"Updated sqlite_sequence for notifications to seq={max_id}")
        except Exception as e:
            logger.warning(f"Failed to update sqlite_sequence: {str(e)}. Skipping sequence update.")
            # Continue without raising, as sequence update is optional
            await self.session.flush()