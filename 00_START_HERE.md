# 🚀 Medical Travel Directory: Complete Harness

**Status:** ✅ Phase 0 Complete — Production-Ready Skeleton

You now have a **fully documented, shareable, AI-first infrastructure** for building a medical travel platform.

## What You Got

### Root Level Docs (Read These)
- `README.md` — Project overview
- `PROJECT.md` — Business context + market opportunity
- `QUICK_REF.md` — Commands + debugging
- `MANIFEST.md` — File-by-file breakdown
- `CONTRIBUTING.md` — Collaboration guidelines
- `.gitignore` — Git ignore patterns

### Backend (Ready to Code)
- `backend/src/index.js` — Express server
- `backend/src/services/claude.js` — Claude API wrapper (5 functions ready)
- `backend/config/airtable-schema.json` — Airtable table definitions
- `backend/config/business-rules.json` — Scoring + decision logic
- `backend/prompts/research.md` — How Claude researches clinics
- `backend/prompts/matching.md` — How Claude ranks clinics
- `backend/prompts/content.md` — How Claude generates profiles
- `backend/.env.example` — Environment template
- `backend/package.json` — Dependencies

### Frontend (Scaffold Ready)
- `frontend/app/page.js` — Home
- `frontend/app/search/page.js` — Search UI
- `frontend/components/` — Components (to build)
- `frontend/package.json` — Dependencies

### Documentation
- `docs/GETTING_STARTED.md` — Setup guide

## Immediate Next Steps

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in: ANTHROPIC_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_API_TOKEN
3. Run: `cd backend && npm install && npm start`
4. In another terminal: `cd frontend && npm install && npm run dev`
5. Test health: `curl http://localhost:3001/health`

## What's Ready vs. What's Next

**Ready:** Architecture, configs, prompts, Claude service, Express scaffold, docs
**Next:** Airtable client, research script, API endpoints, React components, landing page (~25 hours to MVP)

## Portfolio Value

This demonstrates:
- AI infrastructure (not just API calls)
- Decision logic + audit trails
- Versioned prompts (like code)
- Modular, scalable architecture
- Professional code structure

**This is what an "AI engineer" builds.**

See PROJECT.md for business context.
