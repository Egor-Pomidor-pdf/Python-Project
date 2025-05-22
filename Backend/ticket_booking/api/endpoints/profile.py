from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from ticket_booking.core.config import settings
from ticket_booking.core.security import oauth2_scheme
from ticket_booking.infrastructure.database import get_db
from ticket_booking.domain.repositories.user import UserRepository
from ticket_booking.domain.repositories.notification import NotificationRepository
from ticket_booking.domain.repositories.specialists import SpecialistRepository
from ticket_booking.domain.schemas.notification import NotificationOut
from ticket_booking.domain.repositories.transactions import TransactionRepository
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.schemas.user import UserOut, UserUpdate
from ticket_booking.services.auth import AuthService
import logging
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile"])


class RefundRequest(BaseModel):
    transaction_id: int = Field(..., description="ID транзакции для возврата билета", example=123)


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
    specialist_repo = SpecialistRepository(db)
    auth_service = AuthService(user_repo, specialist_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return UserOut(
        username=user.username,
        email=user.email,
        phone_number=user.phone_number,
        first_name=user.first_name,
        last_name=user.last_name,
        middle_name=user.middle_name,
        city=user.city,
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
    specialist_repo = SpecialistRepository(db)
    auth_service = AuthService(user_repo, specialist_repo)
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
        phone_number=user.phone_number,
        first_name=updated_user.first_name,
        last_name=updated_user.last_name,
        middle_name=user.middle_name,
        city=user.city,
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
    specialist_repo = SpecialistRepository(db)
    auth_service = AuthService(user_repo, specialist_repo)
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
        request: RefundRequest,
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    logger.info(f"Processing refund for transaction ID: {request.transaction_id}")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_repo = UserRepository(db)
    specialist_repo = SpecialistRepository(db)
    auth_service = AuthService(user_repo, specialist_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    transaction_repo = TransactionRepository(db)
    event_repo = EventRepository(db)

    transaction = await transaction_repo.get_by_id(request.transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")
    if transaction.user_id != user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещен: транзакция принадлежит другому пользователю")
    if transaction.status != "completed":
        raise HTTPException(status_code=400, detail="Транзакция не может быть возвращена: неверный статус")

    refund_window = timedelta(hours=24)
    if datetime.now() > transaction.transaction_date + refund_window:
        raise HTTPException(status_code=400, detail="Срок возврата истек")

    event = await event_repo.get_by_id(transaction.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Событие не найдено")

    event.available_tickets += 1
    await event_repo.update_tickets(event.id, -1)

    await transaction_repo.delete(request.transaction_id)

    return {"message": "Возврат билета успешно выполнен", "transaction_id": request.transaction_id}


@router.get("/notifications", response_model=list[NotificationOut])
async def get_notifications(
        status: str = None,
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    logger.info("Fetching user notifications")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_repo = UserRepository(db)
    specialist_repo = SpecialistRepository(db)
    auth_service = AuthService(user_repo, specialist_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    notification_repo = NotificationRepository(db)
    notifications = await notification_repo.get_by_user_id(user.id)

    if status and status in ["unread", "read"]:
        notifications = [n for n in notifications if n.status == status]
    elif status == "all":
        pass
    else:
        notifications = [n for n in notifications]

    return notifications


@router.post("/notifications/{notification_id}/read")
async def mark_notification_as_read(
        notification_id: int,
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    logger.info(f"Marking notification {notification_id} as read")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_repo = UserRepository(db)
    specialist_repo = SpecialistRepository(db)
    auth_service = AuthService(user_repo, specialist_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    notification_repo = NotificationRepository(db)
    notification = await notification_repo.mark_as_read(notification_id)
    if notification.user_id != user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещен: уведомление принадлежит другому пользователю")
    return {"message": "Уведомление отмечено как прочитанное"}


@router.delete("/notifications/{notification_id}")
async def delete_notification(
        notification_id: int,
        db: AsyncSession = Depends(get_db),
        token: str = Depends(oauth2_scheme)
):
    logger.info(f"Deleting notification {notification_id}")
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Неверный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Неверный токен")

    user_repo = UserRepository(db)
    specialist_repo = SpecialistRepository(db)
    auth_service = AuthService(user_repo, specialist_repo)
    user = await auth_service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    notification_repo = NotificationRepository(db)
    notification = await notification_repo.get_by_id(notification_id)
    if notification.user_id != user.id:
        raise HTTPException(status_code=403, detail="Доступ запрещен: уведомление принадлежит другому пользователю")
    await notification_repo.delete(notification_id)
    return {"message": "Уведомление удалено"}