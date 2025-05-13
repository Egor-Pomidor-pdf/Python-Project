import random
from datetime import datetime
from ticket_booking.domain.schemas.transaction import RequestPayment
from ticket_booking.core.exceptions import PaymentValidationException


class PaymentGateway:
    @staticmethod
    def validate_payment_data(payment_data: RequestPayment) -> bool:
        try:
            month, year = payment_data.expiry_date.split('/')
            current_year = datetime.now().year % 100
            current_month = datetime.now().month

            if int(year) < current_year or (int(year) == current_year and int(month) < current_month):
                raise PaymentValidationException("Срок действия карты истек")

            return True

        except Exception as e:
            raise PaymentValidationException(f"Ошибка валидации платежных данных: {str(e)}")

    @staticmethod
    def process_payment(payment_data: RequestPayment, amount: float) -> bool:
        try:
            return random.random() < 0.95
        except Exception as e:
            raise PaymentValidationException(f"Ошибка обработки платежа: {str(e)}")

    @staticmethod
    def mask_card_number(card_number: str) -> str:
        parts = card_number.split()
        if len(parts) == 4:
            return f"{parts[0]} **** **** {parts[3]}"
        return "**** **** **** ****"
