from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.crud.task import (
    create_task,
    delete_task,
    get_task,
    get_tasks,
    update_task,
)
from app.database.session import get_db
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.post(
    "/",
    response_model=TaskResponse,
)
def create(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_task(
        db,
        task,
        current_user,
    )


@router.get(
    "/",
    response_model=list[TaskResponse],
)
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tasks(
        db,
        current_user,
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def read_one(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task(
        db,
        task_id,
        current_user,
    )

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
def update(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = update_task(
        db,
        task_id,
        task,
        current_user,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return updated


@router.delete("/{task_id}")
def delete(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = delete_task(
        db,
        task_id,
        current_user,
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return {
        "message": "Task deleted successfully",
    }