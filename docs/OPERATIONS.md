# Operations

How MediTravel runs as a business. This is a living document. Sections marked **TBD** are not decided yet.

## We are an AI-driven company

Most of the research, drafting and data work is done by AI agents, with people setting direction, checking results and making decisions. That has consequences:

- **Every AI output is treated as a draft until a person checks it.** Verified data is marked as verified. Claims made by an agent or a clinic are marked as claimed.
- **Every decision is traceable.** Each research run is saved as its own file, so we can see what was asked, what came back and when.
- **Agents work from written rules.** The rules are in [AGENTS.md](../AGENTS.md), the research prompt in `apps/web/admin/index.html`, and the data model in `packages/schema/`. If a rule is not written down, agents cannot follow it.

## Run it like a professional engineering organization

We want MediTravel to work as a turnkey operation. If we sell this product to an enterprise one day, it should not depend on one person's memory or one person's laptop.

In practice:

- Decisions and their reasons are written down (in docs, or in ADRs once we add them).
- Changes go through version control with clear commit messages.
- Data rules are enforced in code, not left to memory.
- Anything a customer could depend on is documented.

## Our users and mission

See [CHARTER.md](../CHARTER.md). People considering treatment abroad need to compare clinics with confidence, not rely on sales material.

## Data quality standards

- Show claimed and verified data separately. Never present a claim as verified.
- Use `null` for unknown values. Do not guess.
- Keep the source (URL) for every claim where we have one.
- Mark clinics as `candidate` until checked against an official source.
- Never invent a clinic, rating or credential. If research finds fewer clinics than asked, that is the correct result.

## Research workflow

Described in [docs/RESEARCH_SCRIPT_GUIDE.md](RESEARCH_SCRIPT_GUIDE.md). In short: build the prompt in the admin page, run it in a web-browsing AI agent, check the JSON, save the raw run, then merge.

## Roles and approvals

**TBD.** Who reviews agent output before it reaches the site, and who approves changes to the data rules.

## Vendors and tools

**TBD.** List of tools and accounts we depend on (AI providers, Google Places, hosting), who owns each account, and what data each one receives.

Do not send personal details about users or the team to outside services.

## Privacy and data handling

**TBD.** What personal data we store, where, how long we keep it, and who can see it.

## Incidents and corrections

**TBD.** What to do when a listed clinic turns out to be wrong, closed, or misrepresented: who is told, how the record is fixed, and how we record the change.

## Open questions

- Who signs off on verified status?
- How often is each clinic re-checked?
- What is our policy for clinics that pay for listings, if any?
