import pypdf

reader = pypdf.PdfReader("public/Mentis Gizli Dosyalar_ Cilt 1 (4).pdf")
print("Total pages:", len(reader.pages))

with open("extracted_text.txt", "w", encoding="utf-8") as f:
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        f.write(f"\n=== PAGE {i+1} ===\n")
        f.write(text)
        f.write("\n")

print("Saved all pages text to extracted_text.txt")
