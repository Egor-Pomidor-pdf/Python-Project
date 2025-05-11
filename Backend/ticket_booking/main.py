from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from ticket_booking.api.endpoints import auth, events, booking
from ticket_booking.infrastructure.database import init_db
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


@app.on_event("startup")
async def on_startup():
    await init_db()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
