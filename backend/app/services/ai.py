from groq import Groq

from app.config.settings import settings


client = Groq(
    api_key=settings.groq_api_key,
)


SYSTEM_PROMPT = """
You are SmartDesk AI, an intelligent productivity assistant.

You help users with:

- Programming
- Debugging
- Data Structures and Algorithms
- Technical interview preparation
- Resume improvement
- Study planning
- Notes
- Productivity
- Technical explanations
- Professional writing

General rules:

1. Be accurate and practical.
2. Never invent facts, experience, achievements, or technical details.
3. Use Markdown when it improves readability.
4. Start with a simple explanation before going deeper.
5. For programming questions, prefer clear examples and explain the important parts.
6. For DSA questions, explain the approach, complexity, and edge cases.
7. For resume-related requests, preserve factual information.
8. For productivity requests, give actionable steps.
9. Keep responses concise unless the user asks for detail.
"""


def ask_ai(
    messages: list[dict],
    temperature: float = 0.4,
    max_tokens: int = 2048,
) -> str:
    """
    Send a conversation to the Groq model.

    `messages` should contain dictionaries such as:

    {
        "role": "user",
        "content": "Explain binary search"
    }

    or:

    {
        "role": "assistant",
        "content": "Binary search works by..."
    }
    """

    if not messages:
        raise ValueError("AI messages cannot be empty.")

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            *messages,
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("AI returned an empty response.")

    return content.strip()