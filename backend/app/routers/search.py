from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.core.dependencies import get_current_user

from app.models.note import Note
from app.models.task import Task
from app.models.user import User

router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


@router.get("/")
def search(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    tasks = (
        db.query(Task)
        .filter(
            Task.owner_id == current_user.id,
            Task.title.ilike(f"%{query}%"),
        )
        .all()
    )

    notes = (
        db.query(Note)
        .filter(
            Note.owner_id == current_user.id,
            Note.title.ilike(f"%{query}%"),
        )
        .all()
    )

    return {
        "tasks": tasks,
        "notes": notes,
    }