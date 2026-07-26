from app.database.base import Base
from app.database.database import engine

# Import all models so SQLAlchemy knows about them
from app.models import User

Base.metadata.create_all(bind=engine)

print("All tables created successfully!")