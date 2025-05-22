from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ticket_booking.api.endpoints import auth, events, booking, profile
from ticket_booking.infrastructure.database import init_db, AsyncSessionLocal
from ticket_booking.services.event import EventService
from ticket_booking.domain.repositories.event import EventRepository
from ticket_booking.domain.repositories.user import UserRepository
from ticket_booking.domain.repositories.notification import NotificationRepository
from ticket_booking.services.notification import NotificationService
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import secrets
from ticket_booking.core.security import csrf_storage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["X-CSRF-Token"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.middleware("http")
async def add_csrf_token(request: Request, call_next):
    token = secrets.token_hex(16)
    client_ip = request.client.host
    csrf_storage[client_ip] = token
    response = await call_next(request)
    response.headers["X-CSRF-Token"] = token
    return response

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(booking.router)
app.include_router(profile.router)

async def run_generate_events():
    async with AsyncSessionLocal() as session:
        try:
            event_repo = EventRepository(session)
            event_service = EventService(event_repo)
            await event_service.generate_events(session, count=10)
            await event_service.delete_expired_events(session)
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e

async def run_check_and_notify_recommendations():
    async with AsyncSessionLocal() as session:
        try:
            event_repo = EventRepository(session)
            user_repo = UserRepository(session)
            notification_repo = NotificationRepository(session)
            notification_service = NotificationService(notification_repo, event_repo, user_repo, session)
            await notification_service.check_and_notify_recommendations()
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise e

@app.on_event("startup")
async def on_startup():
    await init_db()
    scheduler = AsyncIOScheduler()

    scheduler.add_job(
        run_generate_events,
        "interval",
        hours=4,
    )

    scheduler.add_job(
        run_check_and_notify_recommendations,
        "interval",
        hours=6,
    )

    scheduler.start()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)