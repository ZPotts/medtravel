# Getting Started: Medical Travel Directory

## Prerequisites

- **Node.js 18+** (check: `node --version`)
- **Anthropic API key** (get from https://console.anthropic.com/api-keys)
- **Airtable account** (https://airtable.com, free tier is fine)
- **Git** (for version control)

---

## Step 1: Set Up Your Environment

### 1a. Get Anthropic API Key

1. Go to https://console.anthropic.com/api-keys
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-...`)

### 1b. Create Airtable Base

1. Go to https://airtable.com
2. Click "Create" → "Start from scratch"
3. Name it: "Medical Travel Directory"
4. Note the **Base ID** from the URL: `https://airtable.com/appXXXXXXXXX/...` (the `appXXX` part)
5. Go to https://airtable.com/api
6. Click "Generate API token"
7. Copy the token (starts with `pat_...`)

### 1c. Configure Environment File

```bash
cd ~/Dev/medtravel
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-XXXXX... (your key from 1a)
AIRTABLE_BASE_ID=appXXXXXX... (your base ID from 1b)
AIRTABLE_API_TOKEN=pat_XXXXX... (your token from 1b)
PORT=3001
NODE_ENV=development
```

---

## Step 2: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

---

## Step 3: Create Airtable Tables

You have two options:

### Option A: Manual (5 minutes)
1. Go to your Airtable base
2. Create tables: Clinics, Procedures, Reviews, Resources, Operations Log
3. Add fields matching `backend/config/airtable-schema.json`

### Option B: Automated Script (later)
Once we build `backend/scripts/seed-airtable.js`, run:
```bash
node backend/scripts/seed-airtable.js
```

For now, do **Option A** (manual).

---

## Step 4: Run Locally

### Terminal 1: Backend

```bash
cd backend
npm start
```

You should see:
```
Backend running on port 3001
```

### Terminal 2: Test It

```bash
curl http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-09-11T...",
  "environment": "development"
}
```

### Terminal 3: Frontend (Optional for now)

```bash
cd frontend
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

---

## Step 5: First Test

Once everything is running, test the research pipeline:

```bash
cd backend
node scripts/research-clinics.js --destination "Mexico City" --procedure "Dental"
```

This will:
1. Call Claude API
2. Research 30-50 clinics
3. Print results to console
4. (Later: save to Airtable)

If you see clinic data printed, **you're set!**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` in backend/ and frontend/ |
| "ANTHROPIC_API_KEY is undefined" | Check `.env` file exists and has your key (no quotes) |
| "Airtable connection failed" | Verify BASE_ID and TOKEN in `.env` are correct |
| "Port 3001 already in use" | Kill existing process: `lsof -i :3001` then `kill -9 <PID>` |
| "research-clinics.js not found" | We haven't built the script yet. We'll do this next step. |

---

## What's Next?

1. ✅ You've read ARCHITECTURE.md (how everything fits together)
2. ✅ You've set up locally (backend running on 3001, frontend on 3000)
3. ⏳ We'll build the data model (Airtable schema + business rules)
4. ⏳ We'll build the research pipeline (research-clinics.js script)
5. ⏳ We'll build the matching engine (/api/match endpoint)
6. ⏳ We'll build the UI (React search + clinic detail)

---

## Quick Reference

See **QUICK_REF.md** for common commands + debugging.

Ready to move forward? Let's build the data model next!
