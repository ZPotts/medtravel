# Quick Reference

## Setup
```bash
cp backend/.env.example backend/.env
# Edit with: ANTHROPIC_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_API_TOKEN

cd backend && npm install
cd ../frontend && npm install
```

## Run
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Test
curl http://localhost:3001/health
```

## Key Files
- `backend/config/airtable-schema.json` — Data structure
- `backend/config/business-rules.json` — Scoring + rules
- `backend/prompts/` — Claude instructions
- `backend/src/services/claude.js` — Claude API wrapper

## Debugging
- "Cannot find module" → `npm install`
- "API key not found" → Check `backend/.env`
- "Port in use" → `lsof -i :3001` then `kill -9 <PID>`
