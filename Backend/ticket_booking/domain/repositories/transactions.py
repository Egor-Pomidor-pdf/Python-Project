from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ticket_booking.domain.models.transaction import Transaction
from ticket_booking.core.exceptions import TransactionNotFoundException


class TransactionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, transaction_data: dict):
        transaction = Transaction(**transaction_data)
        self.session.add(transaction)
        await self.session.flush()
        return transaction

    async def get_by_id(self, transaction_id: int):
        result = await self.session.execute(select(Transaction).where(Transaction.id == transaction_id))
        transaction = result.scalar_one_or_none()
        if not transaction:
            raise TransactionNotFoundException()
        return transaction

    async def get_by_user_id(self, user_id: int):
        result = await self.session.execute(select(Transaction).where(Transaction.user_id == user_id))
        return result.scalars().all()

    async def update(self, transaction_id: int, update_data: dict):
        transaction = await self.get_by_id(transaction_id)
        for key, value in update_data.items():
            setattr(transaction, key, value)
        await self.session.flush()
        return transaction

    async def delete(self, transaction_id: int):
        transaction = await self.get_by_id(transaction_id)
        await self.session.delete(transaction)
        await self.session.flush()
