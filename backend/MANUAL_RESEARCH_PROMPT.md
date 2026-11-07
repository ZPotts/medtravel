# Manual Research Prompt for Claude

Use this prompt in Claude Desktop or claude.ai (browser) to research clinics manually.

---

## Instructions

1. Copy the prompt below (everything after the line of dashes)
2. Open Claude Desktop or go to claude.ai in your browser
3. Paste the prompt into the chat
4. Wait for Claude to return the JSON
5. Copy the JSON output
6. Save it as a file: `research_results/[destination]_[procedure]_[date].json`

---

## Prompt to Copy-Paste

```
You are a medical travel researcher. Your job is to research and extract data about DENTAL clinics in MEXICO CITY.

Research approximately 50 clinics that offer DENTAL services in MEXICO CITY.

For EACH clinic, extract the following data in JSON format:

{
  "clinic_name": "Exact clinic name",
  "country": "Country name",
  "city": "City name",
  "website": "https://... or null if not found",
  "email": "clinic@example.com or null",
  "phone": "+country-code or null",
  "lead_doctor_name": "Doctor's full name or null",
  "doctor_certifications": "Comma-separated certifications (e.g., 'DDS, Prosthodontist, Harvard Dental School') or null",
  "clinic_certifications": ["JCI", "ISO", "AACD", "ASPS"] (only actual certifications found, empty array if none),
  "languages_spoken": ["English", "Spanish"] (languages where staff can communicate, minimum 2 chars),
  "specialties": ["Dental", "Cosmetic"] (medical specialties offered),
  "years_in_business": 15 (number only, null if unknown),
  "review_sources": {
    "google": {
      "rating": 4.8,
      "review_count": 245,
      "url": "https://maps.google.com/..."
    },
    "tripadvisor": {
      "rating": 4.7,
      "review_count": 189,
      "url": "https://www.tripadvisor.com/..."
    },
    "realself": {
      "rating": 4.6,
      "review_count": 127,
      "url": "https://www.realself.com/..."
    }
  },
  "computed_review_score": 4.7 (number 1-5, weighted average from sources),
  "total_review_count": 561 (sum of all reviews across sources),
  "typical_procedure_cost": "$1200-$3500" (range in USD or null),
  "patient_satisfaction_percent": 92 (0-100 or null),
  "common_feedback_themes": ["Professional staff", "Clean facility", "Good results", "English-speaking"],
  "data_sources": [
    "https://www.clinic-website.com",
    "https://maps.google.com/...",
    "https://www.tripadvisor.com/..."
  ],
  "research_confidence": "HIGH" (HIGH, MEDIUM, LOW based on data availability),
  "notes": "Any red flags, special observations, or additional context"
}

IMPORTANT RULES:
1. Return ONLY a valid JSON array. No preamble, no markdown, no explanations.
2. Each clinic must be a separate object in the array.
3. For fields with no data, use null (not empty string, not "N/A").
4. For arrays, use empty array [] if no data (not null).
5. Numbers should be numbers, not strings.
6. URLs must start with http:// or https://
7. Be conservative with review scores - only include sources you can verify.
8. years_in_business: number only, null if uncertain.
9. computed_review_score: round to 1 decimal (e.g., 4.7), calculate as weighted average.
10. For specialties, use only: Dental, Cosmetic, Orthopedic, Bariatric, Cardiac, Fertility, Other.

RESEARCH METHODOLOGY:
1. Search for: "Mexico City Dental clinic", "Mexico City medical tourism"
2. Prioritize clinics with: websites, multiple reviews, visible credentials
3. Extract from: clinic websites, Google Maps, TripAdvisor, RealSelf, medical forums
4. Verify data before including (don't speculate)
5. If information is missing, mark as null and set confidence appropriately

Return the JSON array now (no other text):
```

---

## After You Get the JSON

1. Claude will return a JSON array of clinics
2. Select all the JSON (Ctrl+A / Cmd+A in Claude's response)
3. Copy it
4. Create a new file on your Mac: `research_results/mexico-city_dental_2024-09-22.json`
5. Paste the JSON into that file
6. Save it

---

## Example File Path

```
~/Dev/medtravel/research_results/mexico-city_dental_2024-09-22.json
```

---

## Next: Analyze the Data

Once you have the JSON file, you can:

```bash
# View the file
cat ~/Dev/medtravel/research_results/mexico-city_dental_2024-09-22.json

# Count clinics
# (use a JSON viewer or text editor to see the structure)

# Compare against your notes
# (manually check a few clinics against your research)
```

---

## Customizing the Prompt

Want to research a different location/procedure? Change:
- `DENTAL` → `Cosmetic Surgery`, `Orthopedic`, etc.
- `MEXICO CITY` → `Bangkok`, `Istanbul`, etc.
- `50` (clinic count) → `30`, `100`, whatever you want

Everything else stays the same!

