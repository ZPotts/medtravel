/**
 * A clinic in the MediTravel directory.
 * Plain TypeScript, no dependencies. We add fields only when something needs them.
 */

/** "candidate" = found but not checked. "verified" = checked by us against an official source. */
export type ClinicStatus = "candidate" | "verified";

export type Clinic = {
  id: string;

  /** Name as the clinic writes it, in its own language. */
  localName: string;
  nameEnglish?: string;

  /** ISO 3166-1 alpha-2 code, e.g. "MX", "TR". */
  country: string;
  city: string;
  address: string;

  website?: string;
  phone?: string;

  /** Google place ID. The only Google field we store long-term. */
  googlePlaceId?: string;

  status: ClinicStatus;
};