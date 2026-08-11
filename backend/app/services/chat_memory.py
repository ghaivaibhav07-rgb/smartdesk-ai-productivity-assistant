"""
Legacy chat-memory module.

SmartDesk stores conversation history in the database using:

ChatSession
ChatMessage

The database-backed history is persistent across:
- page refreshes
- browser restarts
- backend restarts
- multiple API requests

This module is intentionally kept for compatibility but should not
be used as the primary chat-memory implementation.
"""


def get_history(user_id: int):
    """
    Database-backed chat history should be retrieved through
    app.crud.chat instead.

    This function is kept only for backward compatibility.
    """
    return []


def add_message(
    user_id: int,
    role: str,
    content: str,
):
    """
    No-op compatibility function.

    Chat messages are persisted through ChatMessage.
    """
    return None


def clear_history(user_id: int):
    """
    No-op compatibility function.

    Chat history should be deleted through the database CRUD layer.
    """
    return None