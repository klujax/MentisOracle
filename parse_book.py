import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

# Load the extracted text
with open("extracted_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Replace double/multiple spaces with a single space
text = re.sub(r' {2,}', ' ', text)

# Split by PAGE marker
pages = text.split("=== PAGE ")

# Map of section key -> text lines
sections = {}
current_key = None
current_lines = []

# List of section patterns to check in order
# We will match headings like:
# - ÖNSÖZ: Körlüğün Sonu
# - BÖLÜM 1: Gözlem ve Algı...
# - BÖLÜM 1.1: Kalibrasyon...
# - SON

def get_section_key(line, p_idx):
    line_clean = line.strip().upper()
    
    # Check SON (Epilogue) - only at the very end of the book (page 71)
    if line_clean == "SON" and p_idx >= 71:
        return "epilogue"
        
    # Check ÖNSÖZ
    if "ÖNSÖZ:" in line_clean or line_clean.startswith("ÖNSÖZ"):
        return "preface"
        
    # Check BÖLÜM X.Y
    m_sub = re.match(r"^BÖLÜM\s+(\d+)\.(\d+)", line_clean)
    if m_sub:
        ch = m_sub.group(1)
        sec = m_sub.group(2)
        return f"{ch}.{sec}"
        
    # Check BÖLÜM X
    m_main = re.match(r"^BÖLÜM\s+(\d+)\b", line_clean)
    if m_main:
        ch = m_main.group(1)
        # Avoid matching BÖLÜM 10.5 FİNAL as BÖLÜM 10
        # If there's a dot after the number, it's not a main chapter intro
        if not re.match(r"^BÖLÜM\s+(\d+)\.", line_clean):
            return f"intro_{ch}"
            
    return None

# We ignore page 1 (cover) and page 2 (TOC) to avoid matching headings in TOC
for p_idx in range(3, len(pages)):
    page_text = pages[p_idx]
    # Remove the page number at the end of page text (like "1 === ", "2 === " at split boundaries)
    # We split by lines
    lines = page_text.split("\n")
    
    # Clean up page marker residuals at first line
    if lines and lines[0].strip().isdigit():
        lines = lines[1:]
        
    for line in lines:
        line_strip = line.strip()
        if not line_strip:
            continue
            
        # Check if this line is a heading
        key = get_section_key(line_strip, p_idx)
        if key:
            # Save previous section
            if current_key and current_lines:
                sections[current_key] = current_lines
            # Start new section
            current_key = key
            current_lines = []
            print(f"Detected Section: {key} -> '{line_strip}'")
        else:
            if current_key:
                current_lines.append(line_strip)

# Save the final section
if current_key and current_lines:
    sections[current_key] = current_lines

# Reconstruct paragraphs for each section
final_book = {}

def clean_paragraphs(lines):
    cleaned = []
    current_para = []
    
    for line in lines:
        # Avoid page numbers that get extracted inside the page text
        if line.isdigit() and len(line) <= 3:
            continue
            
        current_para.append(line)
        # Check sentence endings
        if (line.endswith(".") or line.endswith("?") or line.endswith("!") or line.endswith(":")):
            cleaned.append(" ".join(current_para))
            current_para = []
        elif len(line) >= 2 and line[-1] in ['"', '”', '’', '\''] and line[-2] in ['.', '?', '!', ':']:
            cleaned.append(" ".join(current_para))
            current_para = []
            
    if current_para:
        cleaned.append(" ".join(current_para))
        
    return "\n\n".join(cleaned)

for k, lines in sections.items():
    final_book[k] = clean_paragraphs(lines)

# Write to secret_cache_v1.json
with open("secret_cache_v1.json", "w", encoding="utf-8") as f:
    json.dump(final_book, f, ensure_ascii=False, indent=2)

print("\nSaved parsed book to secret_cache_v1.json!")
print("Keys in parsed book:", list(final_book.keys()))
