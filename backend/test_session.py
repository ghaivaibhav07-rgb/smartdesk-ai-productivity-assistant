from app.database.session import SessionLocal

db = SessionLocal()

print(db)

db.close()

print("Session Closed")