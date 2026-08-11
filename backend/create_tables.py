from app.database.base import Base
from app.database.database import engine

# Import every model so SQLAlchemy registers them
from app.models import (
    User,
    Task,
    Note,
    Category,
    ChatSession,
    ChatMessage,
)

Base.metadata.create_all(bind=engine)

print("All tables created successfully!")