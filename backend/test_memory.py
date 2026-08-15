from app.services.chat_memory import (
    add_message,
    get_history,
    clear_history,
)

clear_history(1)

add_message(1, "user", "Hello")
add_message(1, "assistant", "Hi!")
add_message(1, "user", "Explain Binary Search")

history = get_history(1)

print(history)