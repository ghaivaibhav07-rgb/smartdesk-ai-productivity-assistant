from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.auth import login_user
from app.database.session import get_db
from app.schemas.auth import LoginRequest, Token


router = APIRouter(
    prefix="/login",
    tags=["Authentication"],
)


@router.post(
    "/",
    response_model=Token,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    token = login_user(
        db,
        request.email,
        request.password,
    )

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "access_token": token,
        "token_type": "bearer",
    }