# Medical Travel Directory: Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Medical Travel Directory                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  LAYER 1: DATA (Airtable)                                   │
│  ├─ Clinics: clinic_name, country, city, reviews, pricing   │
│  ├─ Procedures: procedure_name, description, cost range     │
│  ├─ Reviews: rating, text, source (Google, TripAdvisor)     │
│  ├─ Resources: hotels, airports, logistics nearby           │
│  └─ Operations Log: audit trail of all AI decisions         │
│                                                               │
│  LAYER 2: DECISION ENGINE (Claude API)                      │
│  ├─ Research: "Find clinics in [destination] for [procedure]"
│  ├─ Matching: "Rank these clinics for this user"            │
│  ├─ Content: "Generate a profile for this clinic"           │
│  └─ Logging: Every decision logged with reasoning           │
│                                                               │
│  LAYER 3: BUSINESS LOGIC (Node.js)                          │
│  ├─ Services: claude.js (API wrapper)                       │
│  ├─ Routes: /api/clinics, /api/match, /api/content         │
│  ├─ Config: airtable-schema.json, business-rules.json       │
│  └─ Scripts: research-clinics.js, seed-airtable.js         │
│                                                               │
│  LAYER 4: FRONTEND (React/Next.js)                          │
│  ├─ Search UI: destination + procedure input                │
│  ├─ Results: ranked clinics with explanations               │
│  ├─ Detail pages: clinic profile + reviews + resources      │
│  └─ Landing page: email capture for demand validation       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Workflows

### Workflow 1: Research Pipeline

**Trigger:** You run `node scripts/research-clinics.js --destination "Mexico City" --procedure "Dental"`

```
1. CLI Script (research-clinics.js)
   ├─ Parse arguments: destination="Mexico City", procedure="Dental"
   └─ Call: researchClinics(destination, procedure)

2. Claude Service (claude.js:researchClinics)
   ├─ Load prompt from: backend/prompts/research.md
   ├─ Inject: destination, procedure
   ├─ Call Claude API with prompt
   └─ Return: JSON array of clinics

3. Claude API Call
   ├─ Instruction: "Research 30-50 clinics in Mexico City offering Dental"
   ├─ Extract data: clinic_name, website, languages, certifications, reviews
   ├─ Score: review_score (1-5) based on Google/TripAdvisor/RealSelf
   └─ Return: JSON array

4. Save to Airtable
   ├─ For each clinic: create record in "Clinics" table
   ├─ Fields: clinic_name, country, city, website, languages, specialties, review_score, price_range, etc.
   └─ Log operation: Input, Prompt, Output, Timestamp, Status

5. Result
   ├─ 50 clinic records in Airtable
   ├─ Operation logged for audit trail
   └─ Ready for matching + content generation
```

**Key Files:**
- `backend/scripts/research-clinics.js` — CLI entry point
- `backend/src/services/claude.js` — researchClinics() function
- `backend/prompts/research.md` — Claude instructions
- `backend/config/airtable-schema.json` — Clinics table definition

---

### Workflow 2: Matching Engine

**Trigger:** User submits search form: "Dental in Mexico City, under $3000, can travel in 2 weeks"

```
1. Frontend (React)
   ├─ User fills: destination, procedure, budget, timeline, languages
   ├─ Submit to API: POST /api/match
   └─ Body: { destination, procedure, budget: 3000, timeline: "2 weeks", languages: ["English"] }

2. Backend Route (routes/api.js:matchEndpoint)
   ├─ Validate input
   ├─ Query Airtable: Get clinics matching destination + procedure
   └─ Call: matchUserToClinics(userPrefs, clinics)

3. Claude Service (claude.js:matchUserToClinics)
   ├─ Load prompt from: backend/prompts/matching.md
   ├─ Inject: user preferences + clinic data
   ├─ Call Claude API with prompt
   └─ Return: Ranked clinics with reasoning

4. Claude API Call
   ├─ Instruction: "Rank these 20 Mexico City dental clinics for this user"
   ├─ Scoring: review_score (40%) + price_fit (25%) + credentials (20%) + timeline (10%) + language (5%)
   ├─ Output: Top 3-5 clinics with match_score (0-100) + reasoning
   └─ Return: JSON with ranked_clinics array

5. Response to Frontend
   ├─ ranked_clinics: [
   │    { clinic_name, match_score, match_reasoning, key_strengths, concerns },
   │    ...
   │  ]
   └─ Log operation: Input, Prompt, Output, Timestamp, Status

6. Frontend Display
   ├─ Show ranked clinics
   ├─ Highlight key strengths
   ├─ Flag any concerns
   └─ Link to clinic detail pages
```

**Key Files:**
- `frontend/app/search/page.js` — Search form
- `backend/src/routes/api.js` — /api/match endpoint
- `backend/src/services/claude.js` — matchUserToClinics() function
- `backend/prompts/matching.md` — Claude instructions

---

### Workflow 3: Content Generation

**Trigger:** Admin/script generates profile for each clinic

```
1. Script (scripts/generate-content.js)
   ├─ Loop through all clinics in Airtable
   ├─ For each clinic: call generateClinicProfile(clinicData)
   └─ Save result to Airtable "Clinics" table (profile_content field)

2. Claude Service (claude.js:generateClinicProfile)
   ├─ Load prompt from: backend/prompts/content.md
   ├─ Inject: clinic data (name, certifications, reviews, etc.)
   ├─ Call Claude API
   └─ Return: Markdown profile text

3. Claude API Call
   ├─ Instruction: "Write a patient-friendly profile for this clinic"
   ├─ Include: Headline, Why Patients Choose, The Team, Certifications, Reviews, Specialties, Contact
   ├─ Guidelines: Be honest, highlight differentiators, no outcome promises
   └─ Return: Markdown text

4. Save to Airtable
   ├─ Update clinic record with profile_content field
   ├─ Log operation: Input, Prompt, Output, Timestamp, Status
   └─ Mark as ready for frontend display

5. Frontend Display
   ├─ Clinic detail page: /clinic/[id]
   ├─ Show rendered profile (markdown → HTML)
   ├─ Show reviews, resources, booking button
   └─ Link to related clinics
```

**Key Files:**
- `backend/scripts/generate-content.js` — Content generation script
- `backend/src/services/claude.js` — generateClinicProfile() function
- `backend/prompts/content.md` — Claude instructions

---

## Configuration Files

### `backend/config/airtable-schema.json`

Defines all Airtable tables + fields:

```json
{
  "Clinics": ["clinic_name", "country", "city", "website", "languages", "specialties", "review_score", "price_range", "status"],
  "Procedures": ["procedure_name", "category", "description", "cost_range", "recovery_time"],
  "Reviews": ["clinic_name", "rating", "review_text", "source"],
  "Resources": ["name", "type", "city", "price_range", "website"],
  "Operations Log": ["timestamp", "operation_type", "input", "output", "status"]
}
```

### `backend/config/business-rules.json`

Decision logic + thresholds:

```json
{
  "clinic_scoring": {
    "weights": {
      "review_score": 0.40,
      "price_fit": 0.25,
      "doctor_credentials": 0.20,
      "timeline_fit": 0.10,
      "language_availability": 0.05
    }
  },
  "quality_standards": {
    "minimum_review_score": 3.5,
    "preferred_review_score": 4.2,
    "required_certifications": ["JCI", "ISO"]
  },
  "user_budget_tiers": {
    "budget_conscious": { "min": 0, "max": 2000 },
    "mid_range": { "min": 2000, "max": 10000 },
    "premium": { "min": 10000, "max": 50000 }
  }
}
```

---

## Audit Trail (Operations Log)

Every Claude decision is logged:

```
Operation: Research
Input: { destination: "Mexico City", procedure: "Dental" }
Prompt: research.md v1.0
Output: [ { clinic_name: "Clinic A", review_score: 4.5 }, ... ]
Reasoning: "Found 45 clinics matching criteria. Scored by: review average (weighted), certifications, years in business"
Timestamp: 2024-09-11T20:52:00Z
User: zachary
Status: Complete
```

This enables:
- **Debugging:** Why did we rank Clinic A above Clinic B?
- **Iteration:** How do results change if we tweak scoring weights?
- **Transparency:** Show users exactly why they got these results
- **Accountability:** Track all AI decisions

---

## Data Flow (End-to-End)

```
Research Phase
↓
Clinics in Airtable with: name, location, certifications, reviews, pricing
↓
User Search
↓
Matching Phase (Claude ranks)
↓
Ranked clinics returned to frontend
↓
Content Generation Phase (async)
↓
Profiles + guides generated + stored in Airtable
↓
Frontend displays complete clinic profiles
↓
User clicks "Contact Clinic" → referral logged
↓
Revenue (if referral commission)
```

---

## Extensibility (Multi-User Operations)

Currently: Single-user (you running scripts)

Future: Team of researchers can submit tasks:

```
Researcher submits: "Research cosmetic surgery clinics in Thailand"
↓
Task queued (Bull queue, AWS SQS, etc.)
↓
Worker processes: runs research pipeline
↓
Results stored in Airtable
↓
Researcher notified: "50 clinics added to Airtable"
↓
Operations logged: who submitted, when, results
```

Same infrastructure, just with an extra queue layer.

---

## Next: Data Model

Once you approve this architecture, we'll define:
1. Airtable table schemas (detailed fields + types)
2. Business rules (scoring weights, thresholds)
3. Claude prompts (detailed instructions)

Ready?
