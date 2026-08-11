
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.base import Base
from app.database.database import engine

# Import all models so they are registered with Base.metadata
from app.models.user import User
from app.models.task import Task
from app.models.category import Category
from app.models.note import Note
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage

from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.task import router as task_router
from app.routers.category import router as category_router
from app.routers.note import router as note_router
from app.routers.chat import router as chat_router
from app.routers.pdf import router as pdf_router
from app.routers.email import router as email_router
from app.routers.resume import router as resume_router



# Create missing database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="SmartDesk API",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(task_router)
app.include_router(category_router)
app.include_router(note_router)
app.include_router(chat_router)
app.include_router(pdf_router)
app.include_router(email_router)
app.include_router(resume_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to SmartDesk API"
    }

