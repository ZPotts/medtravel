# Research Guide

How we research clinics for a city and service, and how the results are checked.

## Two ways to research

| Method | Status | Needs |
|--------|--------|-------|
| **Paste workflow** (primary) | In use | A browser and any web-browsing AI agent |
| **API script** `backend/scripts/agent-research-clinics.js` | Updated, not yet run against the live API | An Anthropic API key |

We use the paste workflow for now. The API script is ready once we have a key.

## Paste workflow

### 1. Build the prompt

Open `apps/web/admin/index.html` in a browser.

- **City:** the city to research, for example `Tijuana`.
- **Service:** Dental, Cosmetic, Orthopedic, Bariatric, Cardiac, Fertility or Other.
- **Mode:**
  - **Test (3 clinics)** for checking the prompt and the output.
  - **Live (25 clinics)** for real research.

Click **Generate prompt**, then **Copy prompt**.

The prompt text lives in one place: the `TEMPLATE` constant in `index.html`. Change it there. Do not copy it anywhere else. [apps/web/admin/MANUAL_RESEARCH_PROMPT.md](../apps/web/admin/MANUAL_RESEARCH_PROMPT.md) points here.

### 2. Run it in an agent

Paste the prompt into an AI agent that can browse the web. The agent should return a JSON array, one object per clinic, and nothing else.

Do not accept answers from memory. The prompt tells the agent to browse the live web.

### 3. Check the results

1. Copy the JSON array the agent returned.
2. Paste it into the **Check results** box on the admin page.
3. Click **Show table**. Click a column header to sort.
4. Look for empty fields, scores outside 1 to 5, URLs that do not start with `http`, and duplicate clinics.
5. Use **Download CSV** if you want to review it in a spreadsheet.

### 4. Save the raw output

Save the JSON as a file in `research_results/`, named:

```
<city>_<service>_<date>.json
```

Example: `research_results/tijuana_dental_2026-11-25.json`

Raw run files stay separate from the master JSON. They are the audit trail for each run.

## Output fields

The fields are defined in the prompt. The prompt is the reference. Summary of the main fields:

| Field | Type | Notes |
|-------|------|-------|
| `clinic_name` | string | Name as the clinic writes it |
| `english_name` | string or null | Only if different |
| `country`, `country_code` | string | `country_code` is ISO 3166-1 alpha-2 |
| `city`, `address` | string | |
| `website`, `email`, `phone` | string or null | URLs start with `http` |
| `lead_doctor_name`, `doctor_certifications` | string or null | |
| `clinic_certifications` | string[] | Only certifications the agent found. Empty array if none. |
| `languages_spoken`, `specialties` | string[] | Specialties come from a fixed list |
| `years_in_business` | number or null | |
| `review_sources` | array of objects | One object per review source the agent found, in any language. Each has `source`, `language` (BCP 47, or null), `rating`, `rating_scale` (usually 5, sometimes 10), `review_count`, `url`, `observed_at`. |
| `computed_review_score` | number 1 to 5 | One decimal place. Each rating is converted to a 1-5 scale, then averaged weighted by `review_count`. |
| `total_review_count` | number | Sum across sources |
| `typical_procedure_cost` | string or null | USD range |
| `patient_satisfaction_percent` | number 0 to 100 or null | |
| `common_feedback_themes` | string[] | |
| `data_sources` | string[] | URLs the agent used |
| `research_confidence` | `HIGH`, `MEDIUM` or `LOW` | |
| `notes` | string or null | Red flags and context |

Rules the agent follows: use `null` for missing values (not `"N/A"` or `""`), use `[]` for empty arrays, use real numbers (not strings), and never invent a clinic, URL, rating or credential.

## Rules for merging (planned)

These apply when we build the merge function. See [ARCHITECTURE.md](../ARCHITECTURE.md#merge-rules-planned).

- Validate before merging: required fields, scores from 1 to 5, URLs start with `http`.
- Dedupe by website, or by name plus city.
- Never overwrite or downgrade `verified` data with `claimed` data.
- Skip incomplete rows and report them.

## Quality checklist

Before using a run's data:

- [ ] `clinic_name`, `country`, `city` are filled in
- [ ] `computed_review_score` is between 1 and 5
- [ ] `research_confidence` is HIGH for most clinics
- [ ] `languages_spoken` has at least one language
- [ ] `data_sources` URLs look valid
- [ ] Prices look reasonable for the service
- [ ] No duplicate clinic names

## API script

`backend/scripts/agent-research-clinics.js` runs the same prompt as the admin page through the Claude API and writes JSON to `research_results/`.

```bash
cd backend
npm install
npm run agent:research -- --destination "Tijuana" --procedure "Dental" --count 3
```

What it does:

- Uses the server-side web search tool, so the model browses the live web instead of answering from memory.
- Uses `claude-opus-5-5` by default. Set `ANTHROPIC_MODEL` in `backend/.env` to change it.
- Streams the response, and continues if the server pauses a long search.
- Opts in to server-side refusal fallbacks (`fallbacks: "default"`). Tell the team if you want this off.
- Saves the same JSON shape the admin page expects.

Things to know:

- It needs `ANTHROPIC_API_KEY` in `backend/.env`.
- The prompt is copied from `TEMPLATE` in `apps/web/admin/index.html`. If one changes, change the other. Moving the prompt to one shared file would remove this risk.
- The script has not yet been run against the live API. The first run should be the 3-clinic test.
- Each run costs tokens and web searches. Check the summary's token counts after the first run.

Setup steps are in [LOCAL_SETUP.md](../LOCAL_SETUP.md).

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Table does not show | The pasted text is not a valid JSON array. Remove any text the agent added before or after the array. |
| Agent returned fewer clinics than asked | Fine. The prompt says to return fewer if it cannot find real clinics. |
| Agent returned clinics with no sources | Do not merge them. Re-run, or mark them `candidate` and check by hand. |
| Prompt has old text | Regenerate it. Make sure you copied the prompt after clicking **Generate prompt**. |
