from app.services.ai import ask_ai

reply = ask_ai(
    "Say hello in one sentence."
)

print(reply)