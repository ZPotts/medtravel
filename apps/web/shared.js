/* Sample data and helpers shared by index.html and clinic.html.
   Everything here is made up for the mockup. When the backend is ready,
   replace the data below with API calls and keep the helpers. */

const SAMPLE_TREATMENT = "Dental care";
const SAMPLE_COUNTRY = "Mexico";
const FETCHED = "Nov 2, 2026";          // when ratings were last pulled
const CRED_DATE = "Oct 28, 2026";       // when credentials were last checked
const ADVISORY_SAMPLE = "Level 2 (sample)";

/* The five credential checks: what each one means and the question to ask
   a clinic when we could not verify it yet. */
const CHECK_INFO = [
  {label:"Registered dentist identified",
   what:"The dentist who will treat you is named, and their professional registration (cédula profesional) matches.",
   ask:"Who exactly will treat me, and what is their registration number?"},
  {label:"Facility accreditation (ISO or JCI)",
   what:"The facility holds a recognized quality certification such as ISO or JCI.",
   ask:"Does the facility hold ISO or JCI certification? Can you send the certificate?"},
  {label:"Professional association member",
   what:"The treating dentists belong to a recognized dental association.",
   ask:"Which dental associations are the treating dentists members of?"},
  {label:"Implant and material brands documented",
   what:"The brands of implants and materials are published, so you can look them up yourself.",
   ask:"Which brand and model of implant and materials will you use? Please put it in writing."},
  {label:"Written treatment warranty",
   what:"Warranty terms are provided in writing.",
   ask:"What does your warranty cover, for how long, and how do I claim it from home?"}
];
const CHECKS = CHECK_INFO.map(k => k.label);

/* Questions worth asking any clinic, verified or not. */
const GENERAL_ASKS = [
  "What is the total cost, in writing, including any follow-up visits?",
  "What happens if I need care after I'm back home?"
];

/* Ratings: clinics with few reviews are pulled toward the average clinic.
   adjusted = (v / (v + m)) * rating + (m / (v + m)) * mean */
const GLOBAL_MEAN = 4.4;
const PRIOR_REVIEWS = 60;
const adjust = (rating, reviews) =>
  Math.round(((reviews / (reviews + PRIOR_REVIEWS)) * rating +
              (PRIOR_REVIEWS / (reviews + PRIOR_REVIEWS)) * GLOBAL_MEAN) * 10) / 10;

const CLINICS = [
  {id:"molar-row", name:"Molar Row Dental", city:"Los Algodones", tags:"Implants, crowns, All-on-4",
   score:91, rating:4.8, reviews:1240, checks:[1,1,1,1,0], conf:"High",
   read:"Consistently high ratings across more than a thousand reviews, and most credentials check out. Travelers often mention clear written quotes.",
   strengths:["More than a thousand reviews with steady, high ratings","Four of five credential checks verified","English spoken almost everywhere nearby"],
   watch:"Warranty terms aren’t verified yet. Ask for them in writing before paying a deposit."},
  {id:"andrade-gate", name:"Andrade Gate Implant Center", city:"Los Algodones", tags:"Implants, bone grafts",
   score:86, rating:4.9, reviews:212, checks:[1,1,0,1,0], conf:"Medium",
   read:"Excellent ratings from a smaller group of travelers, and the operating dentist is named and registered. There is less history to judge than for the top result.",
   strengths:["The operating dentist is named and registered","Implant and material brands are documented","Steps from the pedestrian border crossing"],
   watch:"Most reviews were posted in the last six months."},
  {id:"plaza-dorada", name:"Plaza Dorada Dentistas", city:"Tijuana", tags:"Veneers, crowns, general dentistry",
   score:84, rating:4.6, reviews:2030, checks:[1,1,1,1,0], conf:"High",
   read:"A large, steady base of reviews and strong credential coverage. Ratings run a little lower than the top two, mostly over waiting times.",
   strengths:["Large, steady base of reviews","Four of five credential checks verified","Many hotels and easy hospital access nearby"],
   watch:"Several reviews mention long waits on busy weekends."},
  {id:"sol-sierra", name:"Sol y Sierra Dental", city:"Cancún", tags:"Implants, orthodontics",
   score:78, rating:4.7, reviews:640, checks:[1,0,1,0,0], conf:"Medium",
   read:"Good ratings from a healthy number of reviews. We could confirm the dentist’s registration and professional membership, but not the facility accreditation.",
   strengths:["Good ratings from a healthy number of reviews","Dentist registration and association membership verified","Easy to pair with a longer stay: many hotels and an airport nearby"],
   watch:"Only two of five checks verified so far."},
  {id:"yuma-crossing", name:"Yuma Crossing Dental", city:"Los Algodones", tags:"Dentures, crowns, root canals",
   score:74, rating:4.5, reviews:3410, checks:[1,0,0,0,0], conf:"Medium",
   read:"The most reviewed clinic in this sample, with solid but not standout ratings. Only the dentist’s registration is verified so far.",
   strengths:["The most reviewed clinic in the sample","Dentist registration verified","Solid ratings held across a very large number of reviews"],
   watch:"High volume with few verified credentials. Ask who will be treating you."},
  {id:"costa-azul", name:"Costa Azul Smile Studio", city:"Playa del Carmen", tags:"Whitening, veneers",
   score:52, rating:5.0, reviews:9, checks:[0,0,0,0,0], conf:"Low",
   read:"A perfect rating, but from only nine reviews, so we pull it toward the average. No credentials are verified yet, which is why it sits lower.",
   strengths:["Well placed for a longer stay, with plenty of hotels and restaurants","Every one of its nine reviews is five stars"],
   watch:"Too few reviews to trust the rating, and no credentials verified yet."}
].map(c => ({...c, adj: adjust(c.rating, c.reviews)}));

/* Where the clinic is: neighborhood scores out of 5 for US visitors. */
const PLACE = {
  "molar-row":     {hood:"Zona Centro",      stay:3.0, english:4.8, resources:3.4, note:"Compact and walkable, with English spoken almost everywhere. Hotels are limited, so many travelers sleep on the US side and cross each day."},
  "andrade-gate":  {hood:"Border gate area", stay:3.2, english:4.9, resources:3.6, note:"Steps from the pedestrian crossing, which keeps day trips simple. Services are close, but lodging options are limited."},
  "plaza-dorada":  {hood:"Zona Río",         stay:4.5, english:4.0, resources:4.6, note:"A business district with many hotels, a large mall and easy hospital access. English is common in clinics and hotels, less so on the street."},
  "sol-sierra":    {hood:"Hotel Zone",       stay:4.9, english:4.6, resources:4.4, note:"Built for visitors: plenty of places to stay, English widely spoken and an international airport nearby. Lodging costs more than elsewhere."},
  "yuma-crossing": {hood:"East side",        stay:2.8, english:4.4, resources:3.0, note:"Quieter streets away from the main strip. Fewer hotels and services within walking distance, so plan your transport."},
  "costa-azul":    {hood:"Centro",           stay:4.7, english:4.2, resources:4.1, note:"A walkable center with plenty of hotels and restaurants. English is common in tourist areas and less so a few blocks away."}
};
const CITY = {"Los Algodones":3.7, "Tijuana":4.4, "Cancún":4.6, "Playa del Carmen":4.3};
const locScore = id => {
  const p = PLACE[id];
  return Math.round((p.stay + p.english + p.resources) / 3 * 10) / 10;
};

const BY_SCORE = [...CLINICS].sort((a,b) => b.score - a.score);
const RANK = Object.fromEntries(BY_SCORE.map((c,i) => [c.id, i + 1]));

/* The "verified" stamp used next to the credentials meter. */
const STAMP = '<svg class="stamp" viewBox="0 0 48 48" width="24" height="24" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2.2"/><circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M16.5 24.5l5 5 10-11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
