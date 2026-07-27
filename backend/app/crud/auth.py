from sqlalchemy.orm import Session

from app.core.security import (
    verify_password,
    create_access_token,
)

from app.models.user import User


def login_user(
    db: Session,
    email: str,
    password: str,
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.hashed_password,
    ):
        return None

    token = create_access_token(
        {
            "sub": user.email,
        }
    )

    return token