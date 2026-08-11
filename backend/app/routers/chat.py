from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.crud.chat import (
    chat_with_ai,
    delete_chat_session,
    get_chat_session,
    get_session_messages,
    get_user_sessions,
)
from app.database.session import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse


router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"],
)


@router.post(
    "/",
    response_model=ChatResponse,
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = chat_with_ai(
            db=db,
            user_id=current_user.id,
            session_id=request.session_id,
            message=request.message,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        )

    return ChatResponse(
        session_id=result["session_id"],
        reply=result["reply"],
    )


@router.get("/sessions")
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_sessions(
        db=db,
        user_id=current_user.id,
    )


@router.get("/{session_id}")
def get_chat(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = get_chat_session(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return get_session_messages(
        db=db,
        session_id=session_id,
    )


@router.delete("/{session_id}")
def delete_chat(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = delete_chat_session(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Chat not found",
        )

    return {
        "message": "Chat deleted successfully",
    }