# Getting Started: Medical Travel Directory

## Prerequisites

- **Node.js 18+** (check: `node --version`)
- **Anthropic API key** (get from https://console.anthropic.com/api-keys)
- **Git** (for version control)

---

## Step 1: Set Up Your Environment

### 1a. Get Anthropic API Key

1. Go to https://console.anthropic.com/api-keys
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-...`)

### 1b. Configure Environment File

```bash
cd ~/Dev/medtravel
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-XXXXX... (your key from 1a)
STORAGE_BACKEND=json
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

## Step 3: Initialize Data Files

Data is stored as JSON files in `backend/data/` (we'll move to MySQL when we need to scale; see ARCHITECTURE.md → Storage Strategy).

Once we build `backend/scripts/init-data.js`, run:
```bash
node backend/scripts/init-data.js
```

This creates empty `clinics.json`, `procedures.json`, `reviews.json`, `resources.json`, and `operations-log.json` matching `backend/config/data-schema.json`. No account or database setup needed.

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
4. (Later: save to backend/data/clinics.json)

If you see clinic data printed, **you're set!**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` in backend/ and frontend/ |
| "ANTHROPIC_API_KEY is undefined" | Check `.env` file exists and has your key (no quotes) |
| "ENOENT ... data/clinics.json" | Run `node backend/scripts/init-data.js` to create the data files |
| "Port 3001 already in use" | Kill existing process: `lsof -i :3001` then `kill -9 <PID>` |
| "research-clinics.js not found" | We haven't built the script yet. We'll do this next step. |

---

## What's Next?

1. ✅ You've read ARCHITECTURE.md (how everything fits together)
2. ✅ You've set up locally (backend running on 3001, frontend on 3000)
3. ⏳ We'll build the data model (JSON data schema + business rules)
4. ⏳ We'll build the research pipeline (research-clinics.js script)
5. ⏳ We'll build the matching engine (/api/match endpoint)
6. ⏳ We'll build the UI (React search + clinic detail)

---

## Quick Reference

See **QUICK_REF.md** for common commands + debugging.

Ready to move forward? Let's build the data model next!
