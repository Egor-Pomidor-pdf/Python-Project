from datetime import datetime
import random
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.repositories.transactions import TransactionRepository
from ticket_booking.core.exceptions import PaymentValidationException


class PaymentService:
    def __init__(self,
                 event_repo: EventRepository,
                 transaction_repo: TransactionRepository):
        self.event_repo = event_repo
        self.transaction_repo = transaction_repo

    def validate_payment(self, payment_data: dict) -> bool:
        month, year = payment_data.expiry_date.split('/')
        current_year = datetime.now().year % 100
        current_month = datetime.now().month

        if int(year) < current_year or (int(year) == current_year and int(month) < current_month):
            raise PaymentValidationException("Неверные платежные данные")
        return True

    async def process_booking(self, book_data: dict, payment_data: dict):
        event = await self.event_repo.get_by_id(book_data['event_id'])
        total_cost = event.price * book_data['ticket_count']

        if not self.validate_payment(payment_data):
            await self.transaction_repo.create({
                "event_id": event.id,
                "amount": total_cost,
                "status": "failed",
                "transaction_date": datetime.now()
            })
            raise PaymentValidationException("Неверные платежные данные")

        success = random.random() < 0.95
        if not success:
            await self.transaction_repo.create({
                "event_id": event.id,
                "amount": total_cost,
                "status": "failed",
                "transaction_date": datetime.now()
            })
            raise PaymentValidationException("Ошибка оплаты")

        await self.event_repo.update_tickets(event.id, book_data['ticket_count'])
        transaction = await self.transaction_repo.create({
            "event_id": event.id,
            "amount": total_cost,
            "status": "completed",
            "transaction_date": datetime.now()
        })

        return {
            "message": f"Билеты на {event.name} успешно приобретены",
            "transaction_id": transaction.id,
            "total_amount": total_cost,
            "ticket_count": book_data['ticket_count']
        }