# Architecture

MediTravel helps people compare clinics abroad. See [CHARTER.md](CHARTER.md) for the mission.

This document describes what is built today and what is planned. Items marked **(planned)** do not exist yet.

## Current workflow

Research is done by AI agents that browse the web, and the results are checked by us before they enter the directory. We do not use an AI API for research yet, so the workflow is manual.

```
1. Admin page (apps/web/admin/index.html)
   Enter a city and a service, choose Test (3) or Live (25).
   It builds a research prompt.

2. AI agent with web browsing (any: Claude, ChatGPT, Gemini, Perplexity)
   The user pastes the prompt. The agent returns a JSON array of clinics.

3. Admin page, results check
   The user pastes the JSON. It is shown as a sortable table with CSV export.

4. Merge into the master JSON (planned)
   Validated rows are merged into one master file. Duplicates are skipped.
   Verified data is never overwritten by claimed data.

5. Site (planned)
   The site reads the master JSON.
```

## Components

| Path | What it is | Status |
|------|-----------|--------|
| `apps/web/admin/index.html` | Prompt builder and results table. Holds the single source of the research prompt (`TEMPLATE`). | Built |
| `apps/web/admin/MANUAL_RESEARCH_PROMPT.md` | Points to the admin page. The prompt is not copied here. | Built |
| `apps/web/index.html`, `clinic.html`, `preview*.html`, `shared.js`, `styles.css` | Public site pages. | Exists, not yet tied to master JSON |
| `packages/schema/` | Shared data types (TypeScript). | Partly built (see below) |
| `backend/scripts/agent-research-clinics.js` | Node script that calls the Claude API for research. Not used while we have no API key. | Built, out of date (see [docs/RESEARCH_SCRIPT_GUIDE.md](docs/RESEARCH_SCRIPT_GUIDE.md)) |
| `backend/scripts/poc-search.ts` | Proof of concept: lists candidate clinics from Google Places. Output goes to `out/`. | Experiment |
| Master JSON | One file that holds all merged data for the site. | **(planned)** |
| Merge function | Validates pasted JSON and merges it into the master file. | **(planned)** |

## Data model

The `Clinic` type stays small. Research data lives in separate types linked to a clinic by id, so one clinic can have many credentials, reviews and runs.

| Type | File | Status | Notes |
|------|------|--------|-------|
| `Clinic` | `packages/schema/clinic.ts` | Done | Core identity: name, country, city, address, category, status (`candidate` or `verified`). Includes the `Category` union. |
| `Credential` | `packages/schema/credential.ts` | Done | One credential claim about one clinic. Status is `claimed` or `verified`. Has an optional `runId`. |
| `ResearchRun` | `packages/schema/researchRun.ts` | Empty | Next to build. `Credential.runId` points here. |
| `ReviewSnapshot` | `packages/schema/reviewSnapshot.ts` | Empty | Review ratings from one source at one time. |
| `Doctor` | `packages/schema/doctor.ts` | Empty | |
| `Observation` | `packages/schema/observation.ts` | Empty | |

`packages/schema/places-to-clinic.ts` maps Google Places results to `Clinic` for the proof of concept. Only the Google place ID is stored long-term.

### Master JSON (planned)

One file with these arrays: `clinics`, `reviewSnapshots`, `credentials`, `runs`. Raw output from each research run stays in its own file and is not merged in as-is.

### Merge rules (planned)

- Dedupe by website, or by name plus city when there is no website.
- Never overwrite or downgrade `verified` data with `claimed` data.
- Skip incomplete rows and report them.
- Validate before merging: required fields present, scores from 1 to 5, URLs start with `http`.

## Open decisions

- **How the admin page saves the master file.** The page is static and cannot write files. Options: download the updated file, or add a small backend endpoint.
- **Storage later.** The master JSON is fine for now. If several people or processes write at the same time, or the data grows to the point that full-file reads are slow, we move to a database. Keep all reads and writes in one module so that change stays small.

## Principles

- Run the business like a professional engineering organization. See [AGENTS.md](AGENTS.md).
- Be honest with users. Show what is claimed and what is verified.
- Keep the data model simple, and add fields only when something needs them.
