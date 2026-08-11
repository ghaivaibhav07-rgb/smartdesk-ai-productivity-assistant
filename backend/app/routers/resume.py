from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.models.user import User
from app.services.resume_ai import process_resume_ai

router = APIRouter(
    prefix="/resume",
    tags=["AI Resume"],
)


class ResumeAIRequest(BaseModel):
    action: str
    resume: str
    job_description: str = ""


class ResumeAIResponse(BaseModel):
    result: str


@router.post(
    "/generate",
    response_model=ResumeAIResponse,
)
def generate_resume_ai(
    request: ResumeAIRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        result = process_resume_ai(
            action=request.action,
            resume=request.resume,
            job_description=request.job_description,
        )

        return ResumeAIResponse(
            result=result,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )