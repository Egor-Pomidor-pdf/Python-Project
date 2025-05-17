from fastapi import HTTPException


class UserAlreadyExistsException(Exception):
    def __init__(self, detail: str):
        self.detail = detail


class InvalidCredentialsException(Exception):
    def __init__(self, detail: str):
        self.detail = detail


class EventNotFoundException(Exception):
    pass


class PaymentValidationException(Exception):
    pass


class NotEnoughTicketsException(Exception):
    pass


class TransactionNotFoundException(HTTPException):
    def __init__(self, detail="Транзакция не найдена", status_code=404):
        super().__init__(status_code=status_code, detail=detail)


class DuplicationEventExeption(HTTPException):
    pass