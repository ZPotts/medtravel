# AGENTS.md

Guidance for AI agents working in this repo.

## Org Overview
This is an AI-driven business. And we should be running it like a real professional engineering org at every level. 

Every discussion and every decision should guide us toward operating at a professional level. If we want to sell this product to an enterprise one day, it should be a turnkey operation.

## Project overview

Medtravel is building a clinic research pipeline:

1. The admin page (`apps/web/admin/index.html`) builds a research prompt from a city and a category.
2. The user pastes that prompt into any web-browsing AI agent. There is no API key yet.
3. The agent returns JSON. The user pastes it back into the admin page, which shows it as a table and offers CSV export.
4. Validated results are merged into a master JSON file that the site uses.

## Folder layout

- `apps/web/admin/`: static admin page and prompt builder. `MANUAL_RESEARCH_PROMPT.md` should match the template in `index.html`.
- `packages/schema/`: shared TypeScript types. `clinic.ts` (including the `Category` union), `credential.ts`, `researchRun.ts` and `reviewSnapshot.ts` are done. `doctor.ts` and `observation.ts` are still empty.
- `docs/`: project documentation. `NEXT_STEPS.md` holds the current plan. `RESEARCH_SCRIPT_GUIDE.md` describes the research workflow.

## Conventions

### Ask before editing

Do not edit files by default. Explain the proposed change and why, then ask whether the agent should make it or the user will do it manually. The user wants to learn the codebase, so review their edits when they ask rather than rewriting them.

### Schema layering

- `Clinic` stays small. Keep it to core identity and location fields.
- Research data lives in separate one-to-many types: `ResearchRun`, `ReviewSnapshot`, `Credential`, `Doctor`, `Observation`.
- `Credential.runId` points at `ResearchRun`, so define `researchRun.ts` first.
- Raw per-run research files stay separate from the master JSON.

### Master JSON rules

- Planned shape: one file with arrays `clinics`, `reviewSnapshots`, `credentials` and `runs`.
- Dedupe by website, or by name plus city when there is no website.
- Never overwrite or downgrade `verified` data with `claimed` data.
- Map the agent's fields to `Clinic`, `ReviewSnapshot` and `Credential`. Skip incomplete rows.

### Validating pasted JSON

Before merging pasted agent output, check:

- Required fields are present.
- Scores are integers from 1 to 5.
- URLs start with `http`.
- Duplicates are flagged rather than silently merged.

## Open decisions

- How the static admin page saves the master file: a download, or a backend endpoint. Do not assume either until decided.
