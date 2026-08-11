from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.crud.category import (
    create_category,
    delete_category,
    get_categories,
    get_category,
    update_category,
)
from app.database.session import get_db
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
)

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.post(
    "/",
    response_model=CategoryResponse,
)
def create(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_category(
        db,
        category,
        current_user,
    )


@router.get(
    "/",
    response_model=list[CategoryResponse],
)
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_categories(
        db,
        current_user,
    )


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
)
def read_one(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = get_category(
        db,
        category_id,
        current_user,
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return category


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update(
    category_id: int,
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = update_category(
        db,
        category_id,
        category,
        current_user,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return updated


@router.delete("/{category_id}")
def delete(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = delete_category(
        db,
        category_id,
        current_user,
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    return {
        "message": "Category deleted successfully",
    }