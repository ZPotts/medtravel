# Medical Travel Directory

An AI-first platform for self-serve discovery of vetted clinics and procedures for medical tourism.

## Quick Start

1. Read `00_START_HERE.md`
2. Copy `backend/.env.example` to `backend/.env`
3. Fill in your API keys (ANTHROPIC_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_API_TOKEN)
4. Run `npm install` in both backend/ and frontend/
5. Start backend: `cd backend && npm start`

## Architecture

```
Research Pipeline → Claude researches clinics → Save to Airtable
User Search → Query Airtable → Claude ranks clinics → Return to UI
Content Generation → Claude generates profiles → Store in Airtable
```

See `00_START_HERE.md` for full overview.
