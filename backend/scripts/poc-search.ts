/**
 * Proof of concept: pull a list of candidate clinics from Google Places.
 *
 * Usage (Node 22.6+ runs .ts directly):
 *   GOOGLE_PLACES_API_KEY=... node scripts/poc-search.ts "dental clinic in Tijuana, Mexico" [maxResults]
 *
 * Prints a table and writes out/<query>.json for review. Nothing is saved long-term.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { PLACES_FIELDS, placesToClinic, type PlacesResult } from "../../packages/schema/places-to-clinic.ts";

const [query, maxArg] = process.argv.slice(2);
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (!query || !apiKey) {
  console.error('Usage: GOOGLE_PLACES_API_KEY=... node scripts/poc-search.ts "<query>" [maxResults]');
  process.exit(1);
}
const maxResults = Number(maxArg ?? 40);

// Rating fields are for judging usefulness in this experiment only; Clinic doesn't store them.
type Hit = PlacesResult & { rating?: number; userRatingCount?: number };
const fieldMask = [...PLACES_FIELDS, "rating", "userRatingCount"].map((f) => `places.${f}`).join(",") + ",nextPageToken";

async function search(languageCode?: string): Promise<Hit[]> {
  const hits: Hit[] = [];
  let pageToken: string | undefined;
  while (hits.length < maxResults) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey!,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify({ textQuery: query, pageSize: 20, ...(languageCode && { languageCode }), ...(pageToken && { pageToken }) }),
    });
    if (!res.ok) throw new Error(`Places API ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { places?: Hit[]; nextPageToken?: string };
    hits.push(...(data.places ?? []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return hits.slice(0, maxResults);
}

// Local-language pass gives localName; English pass is matched by place ID for nameEnglish.
const hits = await search();
const english = new Map((await search("en")).map((h) => [h.id, h.displayName?.text]));
const rows = hits.map((h) => ({ hit: h, clinic: placesToClinic(h, english.get(h.id)) }));
const kept = rows.filter((r) => r.clinic);

console.log(`\n${hits.length} results, ${kept.length} converted, ${hits.length - kept.length} skipped (missing required field)\n`);
console.table(
  kept.map(({ hit, clinic }) => ({
    name: clinic!.localName,
    english: clinic!.nameEnglish ?? "",
    city: clinic!.city,
    rating: hit.rating ?? "",
    reviews: hit.userRatingCount ?? "",
    website: clinic!.website ? "yes" : "no",
    phone: clinic!.phone ? "yes" : "no",
  })),
);

const withWebsite = kept.filter((r) => r.clinic!.website).length;
console.log(`With website: ${withWebsite}/${kept.length}`);

mkdirSync("out", { recursive: true });
const file = `out/${query.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
writeFileSync(file, JSON.stringify(kept.map((r) => ({ ...r.clinic, rating: r.hit.rating, reviewCount: r.hit.userRatingCount })), null, 2));
console.log(`Wrote ${file}`);
