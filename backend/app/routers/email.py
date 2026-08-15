from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.email_ai import generate_email

router = APIRouter(
    prefix="/email",
    tags=["AI Email"],
)


class EmailRequest(BaseModel):
    purpose: str
    tone: str
    details: str


class EmailResponse(BaseModel):
    email: str


@router.post(
    "/generate",
    response_model=EmailResponse,
)
def generate_ai_email(
    request: EmailRequest,
    current_user: User = Depends(get_current_user),
):
    email = generate_email(
        purpose=request.purpose,
        tone=request.tone,
        details=request.details,
    )

    return EmailResponse(
        email=email,
    )