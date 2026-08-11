from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryResponse


class NoteCreate(BaseModel):
    title: str
    content: str
    category_id: int | None = None


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    category_id: int | None = None


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str

    category: CategoryResponse | None = None

    model_config = ConfigDict(
        from_attributes=True,
    )