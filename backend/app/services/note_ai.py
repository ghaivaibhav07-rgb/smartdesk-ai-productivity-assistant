from app.services.ai import ask_ai


PROMPTS = {
    "improve": """
Improve the following note.

Requirements:
- Fix grammar.
- Improve clarity.
- Preserve the original meaning.
- Format using Markdown.
- Use headings and bullet points where appropriate.
- Do not add incorrect information.
""",

    "summarize": """
Summarize the following note.

Requirements:
- Keep important concepts.
- Use concise bullet points.
- Preserve technical information.
""",

    "grammar": """
Correct grammar and spelling only.

Do not change the meaning.
""",

    "bullets": """
Convert the following note into well-structured bullet points.

Do not remove important information.
""",

    "explain": """
Explain the following note in a simple way suitable for a beginner.

Use Markdown formatting.
""",
}


def process_note_with_ai(
    action: str,
    content: str,
) -> str:

    if action not in PROMPTS:
        raise ValueError("Unsupported AI action.")

    messages = [
        {
            "role": "user",
            "content": f"""
{PROMPTS[action]}

Note:

{content}
""",
        }
    ]

    return ask_ai(messages)