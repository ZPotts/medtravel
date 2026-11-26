/**
 * ResearchRun: one research pass, from prompt to pasted result.
 *
 * Each time we run the admin page's prompt through an AI agent and save the JSON,
 * that is one ResearchRun. It records what was asked for, what came back, which
 * agent and prompt produced it, and where the raw file lives. Credentials point
 * back to the run that found them through `runId`, so we can trace a claim to its
 * source. ReviewSnapshot will do the same when we add it.
 *
 * Runs are kept separate from the master JSON. The master file holds the merged
 * result; each run's raw file stays in research_results/ as the audit trail.
 */

import type { Category } from "./clinic";

/** Test mode asks for 3 clinics, live mode for 25. Matches the admin page's modes. */
export type RunMode = "test" | "live";

/**
 * "imported" = JSON pasted in and saved, not yet checked.
 * "merged"   = checked and merged into the master file.
 * "failed"   = the run was unusable (refused, malformed, or empty).
 */
export type ResearchRunStatus = "imported" | "merged" | "failed";

/** One research pass: one city, one category, one AI agent, one pasted result. */
export type ResearchRun = {
  id: string;
  category: Category;

  /** City as entered on the admin page, e.g. "Tijuana". */
  city: string;

  mode: RunMode;
  requestedCount: number;
  returnedCount: number;

  /** Free text for the paste workflow, e.g. "Claude", "ChatGPT", "Gemini". */
  agent: string;
  /** Exact model name when known (API script), e.g. "claude-opus-5-5". */
  agentModel?: string;

  /** ISO 8601 timestamp of when the JSON was pasted or the API call finished. */
  runAt: string;

  /** Version of the research prompt used, so results can be compared later. */
  promptVersion?: string;

  /** Path to the raw JSON file kept in research_results/, e.g. "research_results/tijuana_dental_2026-11-25.json". */
  rawFile: string;

  /** Token counts, only when the API script produced the run. */
  tokens?: { input: number; output: number };

  status: ResearchRunStatus;
  notes?: string;
};