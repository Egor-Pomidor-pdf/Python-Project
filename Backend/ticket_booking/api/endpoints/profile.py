from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from ticket_booking.core.config import settings
from ticket_booking.core.security import oauth2_scheme
from ticket_booking.infrastructure.database import get_db
from ticket_booking.domain.repositories.user import UserRepository
from ticket_booking.domain.repositories.transactions import TransactionRepository
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.schemas.user import UserOut, UserUpdate
from ticket_booking.services.auth import AuthService
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=UserOut)
async def get_profile(
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    logger.info("Fetching user profile")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return UserOut(
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        preferences=user.preferences
    )


@router.put("/me", response_model=UserOut)
async def update_profile(
        user_update: UserUpdate,
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    logger.info("Updating user profile")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    update_data = user_update.dict(exclude_unset=True)
    if 'preferences' in update_data and update_data['preferences'] is None:
        update_data['preferences'] = []

    updated_user = await user_repo.update(user.id, update_data)
    return UserOut(
        username=updated_user.username,
        email=updated_user.email,
        first_name=updated_user.first_name,
        last_name=updated_user.last_name,
        preferences=updated_user.preferences
    )


@router.get("/transactions", response_model=list[dict])
async def get_transactions(
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    logger.info("Fetching user transactions")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    transaction_repo = TransactionRepository(db)
    event_repo = EventRepository(db)
    transactions = await transaction_repo.get_by_user_id(user.id)

    result = []
    for transaction in transactions:
        event = await event_repo.get_by_id(transaction.event_id)
        if event:
            result.append({
                "transaction_id": transaction.id,
                "event_name": event.name,
                "event_date": event.date if event.date else None,
                "event_city": event.city,
                "amount": transaction.amount,
                "status": transaction.status,
                "transaction_date": transaction.transaction_date.isoformat()
            })

    return result


@router.post("/refund", response_model=dict)
async def refund_transaction(
        transaction_ids: list[int],
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    logger.info(f"Processing refund for transaction IDs: {transaction_ids}")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_repo = UserRepository(db)
    auth_service = AuthService(user_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    transaction_repo = TransactionRepository(db)
    event_repo = EventRepository(db)

    failed_transactions = []
    successfully_deleted = []
    for transaction_id in transaction_ids:
        transaction = await transaction_repo.get_by_id(transaction_id)
        if not transaction:
            failed_transactions.append({"transaction_id": transaction_id, "reason": "Транзакция не найдена"})
            continue
        if transaction.user_id != user.id:
            failed_transactions.append({"transaction_id": transaction_id,
                                        "reason": "Доступ запрещен: транзакция принадлежит другому пользователю"})
            continue
        if transaction.status != "completed":
            failed_transactions.append(
                {"transaction_id": transaction_id, "reason": "Транзакция не может быть возвращена: неверный статус"})
            continue

        refund_window = timedelta(hours=24)
        if datetime.now() > transaction.transaction_date + refund_window:
            failed_transactions.append({"transaction_id": transaction_id, "reason": "Срок возврата истек"})
            continue

        event = await event_repo.get_by_id(transaction.event_id)
        if not event:
            failed_transactions.append({"transaction_id": transaction_id, "reason": "Событие не найдено"})
            continue
        event.available_tickets += 1
        await event_repo.update_tickets(event.id, -1)

        await transaction_repo.delete(transaction_id)
        successfully_deleted.append(transaction_id)

    if failed_transactions:
        raise HTTPException(status_code=400,
                            detail={"message": "Некоторые транзакции не обработаны", "errors": failed_transactions})

    if not successfully_deleted:
        raise HTTPException(status_code=400, detail="Ни одна транзакция не была возвращена")

    return {"message": "Возврат билетов успешно выполнен", "transaction_ids": successfully_deleted}
