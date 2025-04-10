from sqlalchemy.ext.asyncio import AsyncSession
from ticket_booking.domain.models.transaction import Transaction

class TransactionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, transaction_data: dict):
        transaction = Transaction(**transaction_data)
        self.session.add(transaction)
        await self.session.flush()
        return transaction