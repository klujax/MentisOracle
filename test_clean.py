import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("extracted_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

pages = text.split("=== PAGE ")
page_3 = pages[3] # PAGE 3 is index 3

lines = [line.strip() for line in page_3.split("\n") if line.strip()]

cleaned_paragraphs = []
current_para = []

for line in lines:
    current_para.append(line)
    # Check if the line ends with sentence-ending punctuation or if it's a heading
    if line.endswith(".") or line.endswith("?") or line.endswith("!") or line.endswith(":") or line.endswith('"') or line.endswith("”"):
        cleaned_paragraphs.append(" ".join(current_para))
        current_para = []

if current_para:
    cleaned_paragraphs.append(" ".join(current_para))

print("\n--- RECONSTRUCTED PARAGRAPHS ---")
for p in cleaned_paragraphs:
    print(p)
    print()
