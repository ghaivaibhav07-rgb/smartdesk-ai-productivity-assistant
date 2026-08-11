from app.services.ai import ask_ai


PROMPTS = {
    "improve_resume": """
Improve the following resume.

Requirements:
- Improve grammar.
- Improve formatting.
- Make bullet points stronger.
- Preserve factual information.
- Return in Markdown.
""",

    "tailor_resume": """
Tailor the following resume for the given job description.

Requirements:
- Highlight relevant skills.
- Reorder achievements if needed.
- Keep all information truthful.
- Do not invent experience.
- Return in Markdown.
""",

    "cover_letter": """
Write a professional cover letter.

Requirements:
- Use the supplied resume information.
- Match the provided job description.
- Professional tone.
- Around 300 words.
- Return only the cover letter.
"""
}


def process_resume_ai(
    action: str,
    resume: str,
    job_description: str = "",
) -> str:

    if action not in PROMPTS:
        raise ValueError("Unsupported AI action.")

    prompt = f"""
{PROMPTS[action]}

Resume:

{resume}
"""

    if job_description.strip():
        prompt += f"""

Job Description:

{job_description}
"""

    messages = [
        {
            "role": "user",
            "content": prompt,
        }
    ]

    return ask_ai(messages)