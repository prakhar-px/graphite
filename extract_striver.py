import requests
from bs4 import BeautifulSoup
import pandas as pd
import json

URL = "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z"

headers = {
    "User-Agent": "Mozilla/5.0"
}

response = requests.get(URL, headers=headers)

print("Status:", response.status_code)

soup = BeautifulSoup(response.text, "html.parser")

# -----------------------------
# Find all headings + links
# -----------------------------

data = []
current_topic = "Unknown"

# Get all elements in body
elements = soup.find_all([
    "h1", "h2", "h3", "h4", "a"
])

for element in elements:

    # Update topic when heading found
    if element.name in ["h1", "h2", "h3", "h4"]:

        text = element.get_text(strip=True)

        if len(text) > 3:
            current_topic = text

    # Extract problem links
    elif element.name == "a":

        title = element.get_text(strip=True)

        href = element.get("href")

        if not href:
            continue

        # Skip useless links
        if len(title) < 3:
            continue

        # Optional filtering
        if "takeuforward.org" not in href:
            continue

        data.append({
            "topic": current_topic,
            "question": title,
            "link": href
        })

# Remove duplicates
seen = set()
cleaned = []

for item in data:

    key = (item["question"], item["link"])

    if key not in seen:
        seen.add(key)
        cleaned.append(item)

# -----------------------------
# SAVE CSV
# -----------------------------

df = pd.DataFrame(cleaned)

df.to_csv("striver_sheet.csv", index=False)

# -----------------------------
# SAVE JSON
# -----------------------------

with open("striver_sheet.json", "w", encoding="utf-8") as f:
    json.dump(cleaned, f, indent=4, ensure_ascii=False)

print("Questions Extracted:", len(cleaned))
print("CSV + JSON created")