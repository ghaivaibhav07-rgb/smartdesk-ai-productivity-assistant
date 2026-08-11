from sqlalchemy.orm import Session, joinedload

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def create_note(
    db: Session,
    note: NoteCreate,
    owner_id: int,
):
    db_note = Note(
        title=note.title,
        content=note.content,
        owner_id=owner_id,
        category_id=note.category_id,
    )

    db.add(db_note)
    db.commit()
    db.refresh(db_note)

    return db_note


def get_notes(
    db: Session,
    owner_id: int,
):
    return (
        db.query(Note)
        .options(joinedload(Note.category))
        .filter(Note.owner_id == owner_id)
        .order_by(Note.id.desc())
        .all()
    )


def get_note(
    db: Session,
    note_id: int,
    owner_id: int,
):
    return (
        db.query(Note)
        .options(joinedload(Note.category))
        .filter(
            Note.id == note_id,
            Note.owner_id == owner_id,
        )
        .first()
    )


def update_note(
    db: Session,
    db_note: Note,
    note: NoteUpdate,
):
    update_data = note.model_dump(
        exclude_unset=True,
    )

    for key, value in update_data.items():
        setattr(
            db_note,
            key,
            value,
        )

    db.commit()
    db.refresh(db_note)

    return db_note


def delete_note(
    db: Session,
    db_note: Note,
):
    db.delete(db_note)
    db.commit()