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