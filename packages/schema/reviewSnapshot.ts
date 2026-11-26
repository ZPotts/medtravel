/**
 * ReviewSnapshot: one rating from one review source for one clinic, at one point in time.
 *
 * The agent reports a rating and review count from wherever it finds reviews: global
 * sites, national sites, forums, and reviews written in the local language. Each figure
 * is saved as its own snapshot, so we can see how a clinic's reviews change over time
 * and where each number came from. The clinic's overall review score is computed from
 * its snapshots and is not stored here.
 *
 * Every snapshot comes from a ResearchRun (`runId`). Starts as "claimed" like
 * credentials, and becomes "verified" only after we check it against the source.
 */

/**
 * Where the figure came from. Free text on purpose, so searches are not limited to a
 * fixed list. Use a short lowercase name, e.g. "google", "tripadvisor", "realself",
 * "trustpilot", "healthgrades", "doctoralia", "yelp", "reddit", "pantip".
 * The examples are not a complete list.
 */
export type ReviewSource = string;

/** Same meaning as CredentialStatus: "claimed" = the agent reported it, "verified" = we checked it. */
export type ReviewSnapshotStatus = "claimed" | "verified";

export type ReviewSnapshot = {
  id: string;
  clinicId: string;          // links to Clinic.id
  runId: string;             // the ResearchRun that reported this figure

  source: ReviewSource;

  /** Language the reviews are written in, as a BCP 47 tag: "en", "es", "tr", "th". Omit if mixed or unknown. */
  language?: string;

  /** Average rating on the source's own scale. */
  rating: number;
  /** Top of that scale: 5 for most sites, 10 for some. Needed to compare sources fairly. */
  ratingScale: number;
  reviewCount: number;

  /** Page the figure came from. */
  url?: string;

  /** ISO 8601 date the figure was observed on the source, if the agent could tell. */
  observedAt?: string;

  status: ReviewSnapshotStatus;
  checkedAt?: string;        // ISO date, set when verified
};
