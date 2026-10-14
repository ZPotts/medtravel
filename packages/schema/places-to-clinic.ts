import type { Clinic } from "./clinic";

/**
 * The fields we ask Google for (the "field mask"). Request only what is used below.
 * Pass as the X-Goog-FieldMask header on Text Search, e.g. prefixed with "places.".
 */
export const PLACES_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "websiteUri",
  "internationalPhoneNumber",
] as const;

type AddressComponent = {
  longText: string;
  shortText: string;
  types: string[];
};

/** The slice of a Google Places (New) result that we read. */
export type PlacesResult = {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
  websiteUri?: string;
  internationalPhoneNumber?: string;
};

function findComponent(place: PlacesResult, type: string): AddressComponent | undefined {
  return place.addressComponents?.find((c) => c.types.includes(type));
}

/**
 * Turns one Places result into a candidate Clinic.
 * Returns null if a required field is missing: we skip incomplete results, never guess.
 *
 * Note: this is an in-memory conversion for research. Before saving anything
 * beyond googlePlaceId, check Google's current storage terms.
 */
export function placesToClinic(place: PlacesResult): Clinic | null {
  const name = place.displayName?.text;
  const country = findComponent(place, "country")?.shortText;
  const city = (
    findComponent(place, "locality") ?? findComponent(place, "administrative_area_level_2")
  )?.longText;
  const address = place.formattedAddress;

  if (!name || !country || !city || !address) return null;

  return {
    id: `gp-${place.id}`,
    name,
    country,
    city,
    address,
    website: place.websiteUri,
    phone: place.internationalPhoneNumber,
    googlePlaceId: place.id,
    status: "candidate",
  };
}