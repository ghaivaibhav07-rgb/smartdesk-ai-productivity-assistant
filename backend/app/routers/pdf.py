from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.ai import ask_ai
from app.services.pdf import extract_text_from_pdf


router = APIRouter(
    prefix="/pdf",
    tags=["PDF"],
)


MAX_PDF_TEXT = 12000


@router.post("/summarize")
async def summarize_pdf(
    file: UploadFile = File(...),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    try:
        text = extract_text_from_pdf(file.file)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to read the PDF.",
        ) from exc

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF.",
        )

    text = text[:MAX_PDF_TEXT]

    messages = [
        {
            "role": "user",
            "content": (
                "Summarize the following PDF in clear Markdown.\n\n"
                "Requirements:\n"
                "- Start with a short overview.\n"
                "- Use headings where useful.\n"
                "- Use bullet points for important information.\n"
                "- Preserve important technical details.\n"
                "- Do not invent information.\n\n"
                f"PDF content:\n{text}"
            ),
        }
    ]

    try:
        summary = ask_ai(
            messages,
            temperature=0.3,
            max_tokens=2500,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="AI service is currently unavailable.",
        ) from exc

    return {
        "summary": summary,
    }