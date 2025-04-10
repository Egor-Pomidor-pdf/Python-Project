from fastapi import APIRouter, Depends, HTTPException
from ticket_booking.domain.schemas.event import BookTicketRequest
from ticket_booking.domain.schemas.transaction import RequestPayment
from ticket_booking.services.payment import PaymentService
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.repositories.transactions import TransactionRepository
from ticket_booking.infrastructure.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/booking", tags=["booking"])


@router.post("/book-ticket")
async def book_ticket(
        book_data: BookTicketRequest,
        payment_data: RequestPayment,
        db: AsyncSession = Depends(get_db)
):
    try:
        event_repo = EventRepository(db)
        transaction_repo = TransactionRepository(db)
        payment_service = PaymentService(event_repo, transaction_repo)

        return await payment_service.process_booking(
            book_data.dict(),
            payment_data.dict()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))