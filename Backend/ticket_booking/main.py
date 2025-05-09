from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ticket_booking.api.endpoints import auth, events, booking
from ticket_booking.infrastructure.database import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(booking.router)

@app.on_event("startup")
async def on_startup():
    await init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)