# Next steps (as of 2026-11-24)

## Plan
0. Update the markdown docs so they match what we decided (do this first):
   - fill in `AGENTS.md` (empty): project overview, folder layout, conventions (ask before editing, schema layering, master JSON rules)
   - refresh `ARCHITECTURE.md`, `GETTING_STARTED.md`, `docs/RESEARCH_SCRIPT_GUIDE.md`: they assume an Anthropic API key and an old script name, not the paste-into-any-agent workflow
   - sync `apps/web/admin/MANUAL_RESEARCH_PROMPT.md` with the template in `apps/web/admin/index.html`, or delete the `.md`
   - create a markdown file for general business operations. an operations bible, explaining that this is an AI-driven company.
1. Finish the schema in `packages/schema/`: `researchRun.ts` first (`Credential.runId` points at it), then `reviewSnapshot.ts`, `doctor.ts`, `observation.ts`.
2. Create a master JSON for pulled data and for use on the site. Suggested: one file with arrays `clinics`, `reviewSnapshots`, `credentials`, `runs`. Raw per-run research files stay separate.
3. Write a function that updates the master JSON from a research run:
   - dedupe by website, or by name + city
   - never overwrite or downgrade `verified` data with `claimed` data
   - map the agent's fields to `Clinic`, `ReviewSnapshot`, `Credential`; skip incomplete rows

## Also
- Validate pasted JSON before merging (required fields, score 1-5, URLs start with http, duplicates).
- Decide how the static admin page saves the master file: download it, or add a backend endpoint.
- Run a 3-clinic test with the new prompt.
- Decide what to do with the stale `backend/MANUAL_RESEARCH_PROMPT.md` (currently deleted in the working tree, not committed).
