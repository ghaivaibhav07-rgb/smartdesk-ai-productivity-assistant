from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.core.dependencies import get_current_user

from app.models.note import Note
from app.models.task import Task
from app.models.user import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    total_tasks = (
        db.query(Task)
        .filter(Task.owner_id == current_user.id)
        .count()
    )

    completed_tasks = (
        db.query(Task)
        .filter(
            Task.owner_id == current_user.id,
            Task.status == "Completed",
        )
        .count()
    )

    pending_tasks = (
        db.query(Task)
        .filter(
            Task.owner_id == current_user.id,
            Task.status != "Completed",
        )
        .count()
    )

    notes = (
        db.query(Note)
        .filter(Note.owner_id == current_user.id)
        .count()
    )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "notes": notes,
    }