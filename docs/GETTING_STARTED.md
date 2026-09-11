# Getting Started

## Prerequisites
- Node.js 18+
- Anthropic API key (from console.anthropic.com)
- Airtable account (free tier is fine)

## Setup

1. Clone the repo
2. Copy `backend/.env.example` to `backend/.env`
3. Fill in your API keys:
   - ANTHROPIC_API_KEY
   - AIRTABLE_BASE_ID
   - AIRTABLE_API_TOKEN

4. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

5. Create Airtable tables:
   - Go to airtable.com and create a new base
   - Create tables matching backend/config/airtable-schema.json
   - Or wait for automated seed script

6. Run locally:
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```

7. Test health endpoint:
```bash
curl http://localhost:3001/health
```

## Next Steps
- Read 00_START_HERE.md
- Read QUICK_REF.md for commands
- Check PROJECT.md for business context
