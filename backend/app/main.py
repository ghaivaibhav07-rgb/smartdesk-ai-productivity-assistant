from fastapi import FastAPI

from app.routers.user import router as user_router

app = FastAPI(
    title="SmartDesk API",
    version="1.0.0",
)

app.include_router(user_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to SmartDesk API"
    }