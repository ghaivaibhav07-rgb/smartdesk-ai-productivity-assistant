from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.core.security import create_access_token
from app.crud.auth import authenticate_user
from app.database.session import get_db
from app.schemas.token import Token

router = APIRouter(
    prefix="/login",
    tags=["Authentication"],
)


@router.post(
    "/",
    response_model=Token,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        form_data.username,   # username = email
        form_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={
            "sub": user.email,
        },
        expires_delta=timedelta(
            minutes=settings.access_token_expire_minutes,
        ),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }