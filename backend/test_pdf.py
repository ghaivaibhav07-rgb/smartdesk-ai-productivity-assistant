from app.services.pdf import extract_text_from_pdf

with open("sample.pdf", "rb") as f:
    text = extract_text_from_pdf(f)

print(text)