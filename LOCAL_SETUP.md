# Local Setup

This repo has no build step for the admin page. You can open it in a browser.

## Prerequisites

- **Git**, for version control
- **A web browser**, for the admin page
- **Node.js 18+** (only needed for the backend scripts; check with `node --version`)
- **A web-browsing AI agent**, for research (any of: Claude, ChatGPT, Gemini, Perplexity)

## 1. Get the code

```bash
cd ~/Dev/medtravel
git status
```

## 2. Open the admin page

Open `apps/web/admin/index.html` in a browser. You can double-click it in Finder, or run:

```bash
open apps/web/admin/index.html
```

The page is static. It cannot save files, so results are saved by hand (see [docs/RESEARCH_SCRIPT_GUIDE.md](docs/RESEARCH_SCRIPT_GUIDE.md)).

## 3. Run a test research pass

1. Enter a city (for example, `Tijuana`) and choose a service.
2. Keep Mode on **Test (3 clinics)**.
3. Click **Generate prompt**, then **Copy prompt**.
4. Paste the prompt into an AI agent that can browse the web.
5. Copy the JSON array the agent returns.
6. Paste it into the **Check results** box and click **Show table**.
7. Save the JSON as `research_results/<city>_<service>_<date>.json`, for example `research_results/tijuana_dental_2026-11-25.json`.

## Optional: backend scripts

Only needed if we use the Claude API directly. We have no API key yet.

```bash
cd backend
cp .env.example .env        # then add your key to .env
npm install
npm run agent:research -- --destination "Tijuana" --procedure "Dental" --count 3
```

Do not commit `backend/.env`. It holds secrets.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| The admin page does not show the table | Check that the pasted text is a JSON array. Remove any text the agent added before or after it. |
| The prompt has the wrong city or service | Generate it again. The form fields are read on submit. |
| `npm install` fails in `backend/` | Check `node --version` is 18 or later. |
| `ANTHROPIC_API_KEY` is missing | Set it in `backend/.env` (no quotes). Only needed for the API script. |
