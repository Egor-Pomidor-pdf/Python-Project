from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError, jwt
from ticket_booking.core.config import settings
from ticket_booking.core.security import oauth2_scheme
from ticket_booking.domain.schemas.event import BookTicketRequest
from ticket_booking.domain.repositories.user import UserRepository
from ticket_booking.domain.repositories.notification import NotificationRepository
from ticket_booking.services.notification import NotificationService
from ticket_booking.domain.schemas.transaction import RequestPayment
from ticket_booking.services.payment import PaymentService
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.repositories.transactions import TransactionRepository
from ticket_booking.infrastructure.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/booking", tags=["booking"])


# api/endpoints/booking.py
@router.post("/book-ticket")
async def book_ticket(
        book_data: BookTicketRequest,
        payment_data: RequestPayment,
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_repo = UserRepository(db)
        user = await user_repo.get_by_username(username)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        user_id = user.id

        event_repo = EventRepository(db)
        transaction_repo = TransactionRepository(db)
        payment_service = PaymentService(event_repo, transaction_repo)
        notification_repo = NotificationRepository(db)
        notification_service = NotificationService(notification_repo, event_repo, user_repo, db)

        result = await payment_service.process_booking(
            book_data.dict(),
            payment_data.dict(),
            user_id=user_id
        )

        # Отправляем уведомление о покупке
        await notification_service.create_purchase_notification(user_id, book_data.event_id)

        return result
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
