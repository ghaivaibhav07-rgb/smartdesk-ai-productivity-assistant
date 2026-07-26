from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.user import create_user
from app.database.session import get_db
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post("/", response_model=UserResponse)
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return create_user(db, user)