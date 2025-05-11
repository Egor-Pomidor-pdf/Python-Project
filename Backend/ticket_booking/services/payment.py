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

    @staticmethod
    def validate_payment(self, payment_data: dict) -> bool:
        if "expiry_date" not in payment_data:
            raise PaymentValidationException("Missing expiry_date field")

        expiry_date = payment_data["expiry_date"].strip()

        try:
            month, year = expiry_date.split('/')
            month, year = int(month), int(year)
        except (ValueError, IndexError):
            raise PaymentValidationException("Invalid expiry_date format. Use MM/YY")

        if not (1 <= month <= 12) or not (0 <= year <= 99):
            raise PaymentValidationException("Invalid month or year value")

        current_year = datetime.now().year % 100
        current_month = datetime.now().month

        if year < current_year or (year == current_year and month < current_month):
            raise PaymentValidationException("Card has expired")

        return True

    async def process_booking(self, book_data: dict, payment_data: dict):
        event = await self.event_repo.get_by_id(book_data['event_id'])
        total_cost = event.price * book_data['ticket_count']

        if not self.validate_payment(self, payment_data):
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
            "ticket_count": book_data['ticket_count'],
        }
