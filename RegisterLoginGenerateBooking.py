from fastapi import FastAPI, HTTPException, Depends, status, Body
from pydantic import BaseModel, Field
from bcrypt import hashpw, gensalt, checkpw
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, select, Float, ForeignKey, DateTime
from faker import Faker
import random
from datetime import datetime

SQL_DATABASE_URL = "sqlite+aiosqlite:///./ticket_booking.db"
engine = create_async_engine(SQL_DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

"""Classes"""
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
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
    event_name: str
    ticket_count: int = Field(..., gt=0, le=10)


class RequestPayment(BaseModel):
    card_number: str = Field(..., min_length=16, max_length=19, pattern=r'^[\d]{4}[\s][\d]{4}[\s][\d]{4}[\s][\d]{4}$')
    expiry_date: str = Field(..., pattern=r'^(0[1-9]|1[0-2])\/?([0-9]{2})$')
    card_holder: str = Field(..., min_length=2, pattern=r"^[A-Z]+[\s][A-Z]+$")
    cvv: str = Field(..., min_length=3, max_length=3, pattern=r'^\d+$')

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    amount = Column(Float)
    status = Column(String)
    transaction_date = Column(DateTime)
""""""

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

    if  int(year) < (datetime.now().year % 100) or (int(year) == (datetime.now().year % 100) and int(month) < datetime.now().month):
        return False

    return True

def proccess_payment(payment_data: RequestPayment):
    return random.random() < 0.95

async def log_transaction(db: AsyncSession, event_id: int, amount: float, success: bool):
    transaction = Transaction(event_id=event_id, amount=amount, status="completed" if success else "failed", transaction_date=datetime.now())

    db.add(transaction)
    await db.flush()
    return transaction
""""""

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
    fake = Faker()
    for i in range(50):
        event = Event(
            name=fake.sentence(nb_words=4),
            date=fake.future_datetime(end_date='+30d').strftime('%Y-%m-%d %H:%M:%S'),
            city=fake.city(),
            price=round(random.uniform(1000, 10000), 2),
            available_tickets=random.randint(50, 200)
        )
        db.add(event)
    await db.commit()
    return {"message": "Events generated successfully"}

@app.post("/book_ticket/")
async def book_ticket(event_data: BookTicketRequest = Body(...), payment_data: RequestPayment = Body(...), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Event).where(Event.name.ilike(event_data.event_name)))
    event = res.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Мероприятие не найдено ")
    if event.available_tickets < event_data.ticket_count:
        raise HTTPException(status_code=400, detail=f"Доступно только {event.available_tickets} билетов")

    total_cost = event.price * event_data.ticket_count

    if not validate_payment_data(payment_data):
        raise HTTPException(status_code=400, detail="Неверные платежные данные")

    if not proccess_payment(payment_data):
        await log_transaction(db, event.id, total_cost, False)
        raise HTTPException(status_code=402, detail="Платеж не прошел. Пожалуйста, проверьте свои платежные реквизиты и повторите попытку")

    event.available_tickets -= event_data.ticket_count
    transaction = await log_transaction(db, event.id, total_cost, True)
    await db.commit()

    return {"message": f"Билет на {event.name} успешно приобретен",
            "id транзакции": transaction.id,
            "Сумма платежа": total_cost,
            }