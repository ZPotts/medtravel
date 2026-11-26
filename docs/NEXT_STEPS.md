# Next steps (updated 2026-11-25)

## Done

0. **Docs updated.** Matches the paste-into-any-agent workflow.
   - `AGENTS.md`: project overview, folder layout, conventions.
   - `ARCHITECTURE.md`: current workflow, components, data model status, merge rules (planned).
   - `LOCAL_SETUP.md`: setup for the admin page, plus optional backend script. (There was no `GETTING_STARTED.md`; this file is the setup doc.)
   - `docs/RESEARCH_SCRIPT_GUIDE.md`: paste workflow as primary, API script marked out of date.
   - `apps/web/admin/MANUAL_RESEARCH_PROMPT.md`: now a pointer to the prompt in `index.html`. The duplicate prompt text was removed.
   - `docs/OPERATIONS.md`: new operations doc for the AI-driven company. Sections marked TBD need your decisions.
1. **Schema:** `researchRun.ts` and `reviewSnapshot.ts` are done. Review sources are open (any site, any language), and the prompt, admin table, backend script and guide all match.

## Plan

1. Finish the schema in `packages/schema/`: `doctor.ts` and `observation.ts` are still empty.
2. Create the master JSON for pulled data and for the site. Suggested: one file with arrays `clinics`, `reviewSnapshots`, `credentials`, `runs`. Raw per-run research files stay separate.
3. Write a function that updates the master JSON from a research run:
   - dedupe by website, or by name + city
   - never overwrite or downgrade `verified` data with `claimed` data
   - map the agent's fields to `Clinic`, `ReviewSnapshot`, `Credential`; skip incomplete rows

## Also

- Validate pasted JSON before merging (required fields, score 1-5, URLs start with http, duplicates).
- Decide how the static admin page saves the master file: download it, or add a backend endpoint.
- Run a 3-clinic test with the new prompt.
- Run `backend/scripts/agent-research-clinics.js` once with an API key (after `npm install` in `backend/`). It has been updated (model, web search, SDK package, prompt) but not run against the live API.
- Decide what to do with the stale `backend/MANUAL_RESEARCH_PROMPT.md` (currently deleted in the working tree, not committed).
- Fill in the TBD sections of `docs/OPERATIONS.md`.
