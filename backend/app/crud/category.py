from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate


def create_category(
    db: Session,
    category: CategoryCreate,
    user: User,
):
    db_category = Category(
        name=category.name,
        owner_id=user.id,
    )

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category


def get_categories(
    db: Session,
    user: User,
):
    return (
        db.query(Category)
        .filter(Category.owner_id == user.id)
        .order_by(Category.id.desc())
        .all()
    )


def get_category(
    db: Session,
    category_id: int,
    user: User,
):
    return (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.owner_id == user.id,
        )
        .first()
    )


def update_category(
    db: Session,
    category_id: int,
    category: CategoryCreate,
    user: User,
):
    db_category = get_category(
        db,
        category_id,
        user,
    )

    if db_category is None:
        return None

    db_category.name = category.name

    db.commit()
    db.refresh(db_category)

    return db_category


def delete_category(
    db: Session,
    category_id: int,
    user: User,
):
    db_category = get_category(
        db,
        category_id,
        user,
    )

    if db_category is None:
        return False

    db.delete(db_category)
    db.commit()

    return True