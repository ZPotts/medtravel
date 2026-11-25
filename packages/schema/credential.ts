/** One credential claim about one clinic. **/

export type CredentialType =
  | "dentist-registration"
  | "facility-accreditation"
  | "association-member"
  | "materials-documented"
  | "warranty-written";

export type CredentialStatus =
  | "claimed"
  | "verified";

export type Credential = {
  id: string;
  clinicId: string;          // links to Clinic.id (the "many" side)
  type: CredentialType;
  status: CredentialStatus;  // claimed = clinic or agent said so; verified = we checked
  detail?: string;           // e.g. "JCI", or the registration number
  sourceUrl?: string;        // where we saw it
  checkedAt?: string;        // ISO date, set when verified
  runId?: string;            // which ResearchRun found it (optional)
};