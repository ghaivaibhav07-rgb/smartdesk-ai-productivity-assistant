from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.crud.note import (
    create_note,
    delete_note,
    get_note,
    get_notes,
    update_note,
)
from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.note import (
    NoteCreate,
    NoteResponse,
    NoteUpdate,
)
from app.services.note_ai import process_note_with_ai

router = APIRouter(
    prefix="/notes",
    tags=["Notes"],
)


# ----------------------------
# AI Schemas
# ----------------------------

class NoteAIRequest(BaseModel):
    action: str
    content: str


class NoteAIResponse(BaseModel):
    result: str

# ----------------------------
# CRUD
# ----------------------------

@router.post(
    "/",
    response_model=NoteResponse,
)
def create_new_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_note(
        db=db,
        note=note,
        owner_id=current_user.id,
    )


@router.get(
    "/",
    response_model=list[NoteResponse],
)
def read_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_notes(
        db=db,
        owner_id=current_user.id,
    )


@router.get(
    "/{note_id}",
    response_model=NoteResponse,
)
def read_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = get_note(
        db=db,
        note_id=note_id,
        owner_id=current_user.id,
    )

    if note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    return note


@router.put(
    "/{note_id}",
    response_model=NoteResponse,
)
def update_existing_note(
    note_id: int,
    note: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_note = get_note(
        db=db,
        note_id=note_id,
        owner_id=current_user.id,
    )

    if db_note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    return update_note(
        db=db,
        db_note=db_note,
        note=note,
    )


@router.delete(
    "/{note_id}",
)
def delete_existing_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_note = get_note(
        db=db,
        note_id=note_id,
        owner_id=current_user.id,
    )

    if db_note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    delete_note(
        db=db,
        db_note=db_note,
    )

    return {
        "message": "Note deleted successfully",
    }


# ----------------------------
# AI Improve Note
# ----------------------------

@router.post(
    "/ai",
    response_model=NoteAIResponse,
)
def ai_note(
    request: NoteAIRequest,
    current_user: User = Depends(get_current_user),
):
    try:

        result = process_note_with_ai(
            action=request.action,
            content=request.content,
        )

        return NoteAIResponse(
            result=result,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )