from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
)


def create_task(
    db: Session,
    task: TaskCreate,
    user: User,
):
    db_task = Task(
        title=task.title,
        description=task.description,
        category_id=task.category_id,
        owner_id=user.id,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task


def get_tasks(
    db: Session,
    user: User,
):
    return (
        db.query(Task)
        .filter(Task.owner_id == user.id)
        .order_by(Task.id.desc())
        .all()
    )


def get_task(
    db: Session,
    task_id: int,
    user: User,
):
    return (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.owner_id == user.id,
        )
        .first()
    )


def update_task(
    db: Session,
    task_id: int,
    task: TaskUpdate,
    user: User,
):
    db_task = get_task(
        db,
        task_id,
        user,
    )

    if db_task is None:
        return None

    update_data = task.model_dump(
        exclude_unset=True,
    )

    for key, value in update_data.items():
        setattr(
            db_task,
            key,
            value,
        )

    db.commit()
    db.refresh(db_task)

    return db_task


def delete_task(
    db: Session,
    task_id: int,
    user: User,
):
    db_task = get_task(
        db,
        task_id,
        user,
    )

    if db_task is None:
        return False

    db.delete(db_task)
    db.commit()

    return True