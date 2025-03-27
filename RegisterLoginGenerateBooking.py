from fastapi import FastAPI, HTTPException, Depends, status, Body, Query
from pydantic import BaseModel, Field, confloat
from typing import Optional, List
from bcrypt import hashpw, gensalt, checkpw
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, select, Float, ForeignKey, DateTime
from faker import Faker
import random
from datetime import datetime

fake = Faker('ru_RU')

SQL_DATABASE_URL = "sqlite+aiosqlite:///./ticket_booking.db"
engine = create_async_engine(SQL_DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

"""Classes"""


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    middle_name = Column(String, nullable=True)
    email = Column(String, unique=True)
    phone = Column(String, unique=True)
    password_hash = Column(String)


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    date = Column(String)
    city = Column(String)
    price = Column(Float)
    available_tickets = Column(Integer)


class EventCreate(BaseModel):
    name: str
    date: str
    city: str
    price: float
    available_tickets: int


class BookTicketRequest(BaseModel):
    event_id: int
    ticket_count: int = Field(..., gt=0, le=10)


class RequestPayment(BaseModel):
    card_number: str = Field(..., min_length=16, max_length=19, pattern=r'^[\d]{4}[\s][\d]{4}[\s][\d]{4}[\s][\d]{4}$')
    expiry_date: str = Field(..., pattern=r'^(0[1-9]|1[0-2])\/?([0-9]{2})$')
    card_holder: str = Field(..., min_length=2, pattern=r"^[A-Z]+[\s][A-Z]+$")
    cvv: str = Field(..., min_length=3, max_length=3, pattern=r'^\d+$')


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    amount = Column(Float)
    status = Column(String)
    transaction_date = Column(DateTime)


class EventFilter(BaseModel):
    name: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    city: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None


"""Functions"""


async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
            await db.commit()
        except Exception:
            await db.rollback()
            raise


def validate_payment_data(payment_data: RequestPayment):
    month, year = payment_data.expiry_date.split("/")
    if int(year) < (datetime.now().year % 100) or (
            int(year) == (datetime.now().year % 100) and int(month) < datetime.now().month):
        return False
    return True


def process_payment(payment_data: RequestPayment):
    return random.random() < 0.95


async def log_transaction(db: AsyncSession, user_id: int, event_id: int, amount: float, success: bool):
    transaction = Transaction(
        user_id=user_id,
        event_id=event_id,
        amount=amount,
        status="completed" if success else "failed",
        transaction_date=datetime.now()
    )
    db.add(transaction)
    await db.flush()
    return transaction


def generate_russian_city():
    cities = [
        "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
        "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
        "Уфа", "Красноярск", "Пермь", "Воронеж", "Волгоград"
    ]
    return random.choice(cities)


"""Endpoints"""

app = FastAPI()


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(User.__table__.select().where(User.username == user.username))
    db_user = res.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username have already registered")

    salt = gensalt()
    password_hash = hashpw(user.password.encode('utf-8'), salt)
    db_user = User(username=user.username, password_hash=password_hash.decode('utf-8'))
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return {"message": "User has registered"}


@app.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user.username))
    db_user = result.scalar_one_or_none()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid login or password")

    if not checkpw(user.password.encode('utf-8'), db_user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid login or password")

    return {"message": "Login successfully"}


@app.post("/generate_events", status_code=status.HTTP_201_CREATED)
async def generate_events(db: AsyncSession = Depends(get_db)):
    for i in range(50):
        event = Event(
            name=fake.sentence(nb_words=4),
            date=fake.future_datetime(end_date='+30d').strftime('%Y-%m-%d %H:%M:%S'),
            city=generate_russian_city(),
            price=round(random.uniform(1000, 10000), 2),
            available_tickets=random.randint(50, 200)
        )
        db.add(event)
    await db.commit()
    return {"message": "50 events generated successfully with Russian cities"}


@app.get("/events/filter")
async def filter_events(
        name: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        city: Optional[str] = None,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        db: AsyncSession = Depends(get_db)
):
    query = select(Event)

    if name:
        query = query.where(Event.name.ilike(f"%{name}%"))
    if city:
        query = query.where(Event.city.ilike(f"%{city}%"))
    if date_from:
        query = query.where(Event.date >= date_from)
    if date_to:
        query = query.where(Event.date <= date_to)
    if price_min is not None:
        query = query.where(Event.price >= price_min)
    if price_max is not None:
        query = query.where(Event.price <= price_max)

    result = await db.execute(query)
    events = result.scalars().all()

    return [{
        "id": event.id,
        "name": event.name,
        "date": event.date,
        "city": event.city,
        "price": event.price,
        "available_tickets": event.available_tickets
    } for event in events]

@app.post("/book_ticket/")
async def book_ticket(
        book_data: BookTicketRequest,
        payment_data: RequestPayment,
        db: AsyncSession = Depends(get_db)
):
    event_result = await db.execute(select(Event).where(Event.id == book_data.event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.available_tickets < book_data.ticket_count:
        raise HTTPException(status_code=400, detail=f"Only {event.available_tickets} tickets available")

    total_cost = event.price * book_data.ticket_count

    if not validate_payment_data(payment_data):
        raise HTTPException(status_code=400, detail="Invalid payment data")

    if not process_payment(payment_data):
        await log_transaction(db, event.id, total_cost, False)
        raise HTTPException(status_code=402, detail="Payment failed. Please check your payment details and try again")

    event.available_tickets -= book_data.ticket_count
    transaction = await log_transaction(db, event.id, total_cost, True)
    await db.commit()

    return {
        "message": f"Ticket for {event.name} successfully booked",
        "transaction_id": transaction.id,
        "amount": total_cost,
        "tickets": book_data.ticket_count
    }