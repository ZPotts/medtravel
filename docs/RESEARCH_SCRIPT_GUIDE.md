# Research Script Guide

## Overview

`research-clinics.js` is a Node.js CLI script that uses Claude API to research medical clinics for a given destination + procedure and outputs **clean, structured JSON** for analysis.

## Features

✅ **Super Structured JSON** — Every clinic field is consistent, clean, ready for analysis
✅ **Data Quality Validation** — Tracks confidence levels (HIGH/MEDIUM/LOW)
✅ **Multi-Source Reviews** — Aggregates Google, TripAdvisor, RealSelf ratings
✅ **Audit Trail** — Logs API usage, timestamp, token count
✅ **Summary Report** — Prints quality metrics + top 5 clinics to console
✅ **Safe Defaults** — Uses `null` for missing data (not "N/A" or empty strings)

## Installation

```bash
cd backend

# Install dependencies (if not already installed)
npm install anthropic yargs dotenv

# Verify script is executable
chmod +x scripts/research-clinics.js
```

## Usage

```bash
# Basic usage
node scripts/research-clinics.js --destination "Mexico City" --procedure "Dental"

# With options
node scripts/research-clinics.js \
  --destination "Mexico City" \
  --procedure "Dental" \
  --count 50 \
  --output-dir research_results

# Short flags
node scripts/research-clinics.js -d "Bangkok" -p "Cosmetic Surgery" -c 30
```

## Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--destination` | `-d` | string | required | City/region (e.g., "Mexico City") |
| `--procedure` | `-p` | string | required | Medical procedure (e.g., "Dental") |
| `--count` | `-c` | number | 50 | Number of clinics to research |
| `--output-dir` | `-o` | string | `research_results` | Output directory |

## Output

The script creates a JSON file: `research_results/mexico-city_dental_2024-09-21.json`

```json
{
  "clinics": [
    {
      "clinic_name": "Smile Dental Mexico",
      "country": "Mexico",
      "city": "Mexico City",
      "website": "https://smiledentalmexico.com",
      "email": "contact@smiledentalmexico.com",
      "phone": "+52-55-1234-5678",
      "lead_doctor_name": "Dr. Carlos Mendez",
      "doctor_certifications": "DDS, Prosthodontist, Harvard Dental School",
      "clinic_certifications": ["JCI", "ISO"],
      "languages_spoken": ["English", "Spanish"],
      "specialties": ["Dental"],
      "years_in_business": 15,
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
      "computed_review_score": 4.7,
      "total_review_count": 561,
      "typical_procedure_cost": "$1200-$3500",
      "patient_satisfaction_percent": 92,
      "common_feedback_themes": ["Professional staff", "Clean facility", "Good results"],
      "data_sources": ["https://smiledentalmexico.com", "https://maps.google.com/..."],
      "research_confidence": "HIGH",
      "notes": "Well-established clinic with strong reputation"
    },
    ...
  ],
  "metadata": {
    "destination": "Mexico City",
    "procedure": "Dental",
    "target_count": 50,
    "actual_count": 47,
    "timestamp": "2024-09-21T15:30:00.000Z",
    "claude_model": "claude-3-5-sonnet-20241022",
    "input_tokens": 2500,
    "output_tokens": 5800,
    "total_tokens": 8300
  }
}
```

## JSON Schema

Each clinic object has:

```typescript
{
  clinic_name: string,              // Clinic's official name
  country: string,                  // Country name
  city: string,                     // City name
  website: string | null,           // URL or null
  email: string | null,             // Email or null
  phone: string | null,             // International format or null
  lead_doctor_name: string | null,  // Primary doctor or null
  doctor_certifications: string | null,  // Comma-separated (e.g., "DDS, Prosthodontist")
  clinic_certifications: string[],  // Array of certs (JCI, ISO, AACD, ASPS)
  languages_spoken: string[],       // Languages staff can communicate in
  specialties: string[],            // Dental, Cosmetic, Orthopedic, etc.
  years_in_business: number | null, // Number of years operating
  review_sources: {
    google?: { rating: number, review_count: number, url: string },
    tripadvisor?: { rating: number, review_count: number, url: string },
    realself?: { rating: number, review_count: number, url: string }
  },
  computed_review_score: number,    // Weighted average (1-5), 1 decimal place
  total_review_count: number,       // Sum across all sources
  typical_procedure_cost: string | null,  // "$1000-$3000" or null
  patient_satisfaction_percent: number | null,  // 0-100 or null
  common_feedback_themes: string[], // Array of themes from reviews
  data_sources: string[],           // URLs where data was found
  research_confidence: "HIGH" | "MEDIUM" | "LOW",
  notes: string | null              // Any special observations
}
```

## Console Output Example

```
📍 Researching Dental clinics in Mexico City...
Target: 50 clinics

✅ Successfully researched 47 clinics

================================================================================
RESEARCH SUMMARY
================================================================================
Destination: Mexico City
Procedure: Dental
Clinics Found: 47 / 50 target
Timestamp: 2024-09-21T15:30:00.000Z

Tokens Used: 8300
  - Input: 2500
  - Output: 5800

Top 5 Clinics (by review score):
────────────────────────────────────────────────────────────────────────────────
1. Smile Dental Mexico
   Location: Mexico City, Mexico
   Review Score: 4.8/5 (561 reviews)
   Cost: $1200-$3500
   Languages: English, Spanish
   Website: https://smiledentalmexico.com

2. Bright Smile Clinic
   Location: Mexico City, Mexico
   Review Score: 4.7/5 (432 reviews)
   Cost: $800-$2500
   Languages: English, Spanish
   Website: https://brightsmiledental.mx

...

Data Quality:
────────────────────────────────────────────────────────────────────────────────
✅ Valid records: 47/47
📊 Confidence Levels:
   - HIGH: 42
   - MEDIUM: 5
   - LOW: 0

================================================================================

💾 Results saved to: research_results/mexico-city_dental_2024-09-21.json

✨ Research complete! You can now:
   1. Review the JSON file for data quality
   2. Compare against your notes
   3. Run data analysis
   4. Later: Import into PostgreSQL
```

## Data Analysis (Next Steps)

Once you have the JSON file, you can:

```bash
# View the file
cat research_results/mexico-city_dental_2024-09-21.json | jq .

# Get clinic count
jq '.clinics | length' research_results/mexico-city_dental_2024-09-21.json

# Get all clinic names
jq '.clinics[].clinic_name' research_results/mexico-city_dental_2024-09-21.json

# Get top 10 by review score
jq '.clinics | sort_by(.computed_review_score) | reverse | .[0:10]' research_results/mexico-city_dental_2024-09-21.json

# Get all high-confidence clinics
jq '.clinics[] | select(.research_confidence == "HIGH")' research_results/mexico-city_dental_2024-09-21.json

# Compare your notes against the JSON
# (write your own analysis script)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "ANTHROPIC_API_KEY not found" | Set env var: `export ANTHROPIC_API_KEY=sk-ant-...` |
| "command not found: node" | Install Node.js 18+ from nodejs.org |
| "Cannot find module 'anthropic'" | Run `npm install anthropic yargs dotenv` |
| "Invalid JSON output" | Claude didn't return valid JSON. Try again (occasional issue). |
| "Timeout (30+ sec)" | Claude API taking time. Script will retry. |

## Quality Checklist

Before using the data, verify:

- [ ] All `clinic_name`, `country`, `city` are populated (not null)
- [ ] `computed_review_score` is between 1-5
- [ ] `research_confidence` is HIGH for most clinics
- [ ] `languages_spoken` includes at least one language
- [ ] `data_sources` URLs are valid
- [ ] Procedure costs look reasonable for the procedure type
- [ ] No obviously duplicate clinic names

## Example: First Run

```bash
cd ~/Dev/medtravel

# Make sure .env is set up
# cp backend/.env.example backend/.env
# Edit with ANTHROPIC_API_KEY

# Run research
node backend/scripts/research-clinics.js --destination "Mexico City" --procedure "Dental" --count 50

# Check results
ls -la backend/research_results/
cat backend/research_results/mexico-city_dental_*.json | jq '.metadata'
```

## Next Steps

1. Run the script for your first destination
2. Review the JSON output
3. Compare against your own notes
4. Run data analysis
5. Once verified: import into PostgreSQL

Good luck! 🚀
