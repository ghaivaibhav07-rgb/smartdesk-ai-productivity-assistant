from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.services.ai import ask_ai


MAX_HISTORY_MESSAGES = 20


def create_chat_session(
    db: Session,
    user_id: int,
    title: str,
):
    session = ChatSession(
        title=title[:255],
        user_id=user_id,
        created_at=datetime.now(UTC),
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


def save_message(
    db: Session,
    session_id: int,
    role: str,
    content: str,
):
    message = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        created_at=datetime.now(UTC),
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def get_chat_history(
    db: Session,
    session_id: int,
    limit: int = MAX_HISTORY_MESSAGES,
):
    """
    Return the most recent messages for AI context.

    The messages are reversed after querying so the AI receives
    them in chronological order.
    """

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id,
        )
        .order_by(
            ChatMessage.created_at.desc(),
        )
        .limit(limit)
        .all()
    )

    messages.reverse()

    return [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in messages
    ]


def get_user_sessions(
    db: Session,
    user_id: int,
):
    return (
        db.query(ChatSession)
        .filter(
            ChatSession.user_id == user_id,
        )
        .order_by(
            ChatSession.created_at.desc(),
        )
        .all()
    )


def get_session_messages(
    db: Session,
    session_id: int,
):
    return (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id,
        )
        .order_by(
            ChatMessage.created_at,
        )
        .all()
    )


def get_chat_session(
    db: Session,
    session_id: int,
    user_id: int,
):
    return (
        db.query(ChatSession)
        .filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        )
        .first()
    )


def delete_chat_session(
    db: Session,
    session_id: int,
    user_id: int,
):
    session = get_chat_session(
        db,
        session_id,
        user_id,
    )

    if session is None:
        return False

    db.delete(session)
    db.commit()

    return True


def chat_with_ai(
    db: Session,
    user_id: int,
    session_id: int | None,
    message: str,
):
    message = message.strip()

    if not message:
        raise ValueError("Message cannot be empty.")

    if len(message) > 10000:
        raise ValueError(
            "Message is too long. Please keep it under 10,000 characters."
        )

    # Create a new conversation when required.
    if session_id in (None, 0):
        session = create_chat_session(
            db=db,
            user_id=user_id,
            title=message[:40],
        )

        session_id = session.id

    else:
        session = get_chat_session(
            db=db,
            session_id=session_id,
            user_id=user_id,
        )

        if session is None:
            raise ValueError("Chat session not found.")

    # Save user message.
    save_message(
        db=db,
        session_id=session_id,
        role="user",
        content=message,
    )

    # Retrieve only the recent conversation context.
    history = get_chat_history(
        db=db,
        session_id=session_id,
        limit=MAX_HISTORY_MESSAGES,
    )

    # Generate AI response.
    try:
        reply = ask_ai(
            messages=history,
            temperature=0.4,
            max_tokens=2048,
        )
    except Exception as exc:
        raise ValueError(
            "AI service is currently unavailable. Please try again."
        ) from exc

    # Persist AI response.
    save_message(
        db=db,
        session_id=session_id,
        role="assistant",
        content=reply,
    )

    return {
        "session_id": session_id,
        "reply": reply,
    }