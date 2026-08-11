from app.services.ai import ask_ai


def generate_email(
    purpose: str,
    tone: str,
    details: str,
) -> str:

    prompt = f"""
Write a complete email.

Purpose:
{purpose}

Tone:
{tone}

Details:
{details}

Requirements:
- Include a suitable subject.
- Write professionally.
- Keep the email clear and concise.
- Use proper greetings and closing.
- Return only the email.
"""

    messages = [
        {
            "role": "user",
            "content": prompt,
        }
    ]

    return ask_ai(messages)