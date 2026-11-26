#!/usr/bin/env node

/**
 * MediTravel - AI research agent (Anthropic API version)
 *
 * Runs the same research prompt as the admin page (apps/web/admin/index.html, TEMPLATE)
 * through the Claude API with the server-side web search tool, so the model browses the
 * live web instead of answering from memory. Output is clean JSON for review.
 *
 * Usage:
 *   node scripts/agent-research-clinics.js --destination "Tijuana" --procedure "Dental" --count 3
 *
 * Setup:
 *   ANTHROPIC_API_KEY in backend/.env
 *   Optional: ANTHROPIC_MODEL to override the default model
 *
 * Output:
 *   research_results/tijuana_dental_2026-11-25.json
 *
 * NOTE: the prompt below mirrors TEMPLATE in apps/web/admin/index.html. If you change one,
 * change the other.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load environment variables before creating the client
dotenv.config();

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';
const MAX_TOKENS = 64000;      // streamed, so large outputs don't hit HTTP timeouts
const MAX_WEB_SEARCHES = 20;   // cap on server-side searches per run
const MAX_PAUSE_TURNS = 5;     // cap on pause_turn continuations

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Parse command-line arguments
 */
const argv = yargs(hideBin(process.argv))
  .option('destination', {
    alias: 'd',
    describe: 'City to research (e.g., "Tijuana", "Mexico City")',
    type: 'string',
    demandOption: true,
  })
  .option('procedure', {
    alias: 'p',
    describe: 'Service to research (e.g., "Dental", "Cosmetic")',
    type: 'string',
    demandOption: true,
  })
  .option('output-dir', {
    alias: 'o',
    describe: 'Output directory for results',
    type: 'string',
    default: 'research_results',
  })
  .option('count', {
    alias: 'c',
    describe: 'Number of clinics to research (admin page: test = 3, live = 25)',
    type: 'number',
    default: 25,
  })
  .parseSync();

const { destination, procedure, outputDir, count } = argv;

/**
 * Build the research prompt. Mirrors TEMPLATE in apps/web/admin/index.html.
 */
function buildPrompt(city, service, targetCount) {
  return `You are a medical travel researcher with web browsing access. Your job is to research and extract data about clinics offering ${service} in ${city}.

Research approximately ${targetCount} clinics that offer ${service} in ${city}. Browse the live web; do not answer from memory.

For EACH clinic, extract the following data in JSON format:

{
  "clinic_name": "Name as the clinic writes it, in its own language",
  "english_name": "English name if different from clinic_name, else null",
  "country": "Country name",
  "country_code": "MX" (ISO 3166-1 alpha-2, exactly 2 uppercase letters),
  "city": "City name",
  "address": "Av. Revolución 123, Zona Centro, Tijuana" (street address as published by the clinic or Google Maps, or null),
  "website": "https://... or null if not found",
  "email": "clinic@example.com or null",
  "phone": "+country-code or null",
  "lead_doctor_name": "Doctor's full name or null",
  "doctor_certifications": "Comma-separated certifications (e.g., 'DDS, Prosthodontist, Harvard Dental School') or null",
  "clinic_certifications": ["JCI", "ISO", "AACD", "ASPS"] (only actual certifications found, empty array if none),
  "languages_spoken": ["English", "Spanish"] (languages where staff can communicate, minimum 2 chars),
  "specialties": ["Dental", "Cosmetic"] (medical specialties offered),
  "years_in_business": 15 (number only, null if unknown),
  "review_sources": [
    {
      "source": "google" (lowercase site name, e.g. google, tripadvisor, realself, trustpilot, doctoralia, or a local site),
      "language": "es" (BCP 47 language of the reviews, e.g. en, es, tr, th; null if mixed or unknown),
      "rating": 4.8,
      "rating_scale": 5 (top of the site's own scale: usually 5, sometimes 10),
      "review_count": 245,
      "url": "https://maps.google.com/...",
      "observed_at": "2026-11-25" (date shown on the source, or null)
    }
  ] (one object per review source you can verify; empty array if none),
  "computed_review_score": 4.7 (number 1-5: convert each rating to a 1-5 scale, then average weighted by review_count),
  "total_review_count": 561 (sum of all reviews across sources),
  "typical_procedure_cost": "$1200-$3500" (range in USD or null),
  "patient_satisfaction_percent": 92 (0-100 or null),
  "common_feedback_themes": ["Professional staff", "Clean facility", "Good results", "English-speaking"],
  "data_sources": [
    "https://www.clinic-website.com",
    "https://maps.google.com/...",
    "https://www.tripadvisor.com/..."
  ],
  "research_confidence": "HIGH" (HIGH, MEDIUM, LOW based on data availability),
  "notes": "Any red flags, special observations, or additional context"
}

IMPORTANT RULES:
1. Return ONLY a valid JSON array. No preamble, no markdown, no explanations.
2. Each clinic must be a separate object in the array.
3. For fields with no data, use null (not empty string, not "N/A").
4. For arrays, use empty array [] if no data (not null).
5. Numbers should be numbers, not strings.
6. URLs must start with http:// or https://
7. Be conservative with review scores - only include sources you can verify.
8. years_in_business: number only, null if uncertain.
9. computed_review_score: convert each rating to a 1-5 scale (rating / rating_scale * 5), average them weighted by review_count, round to 1 decimal. null if there are no review sources.
10. For specialties, use only: Dental, Cosmetic, Orthopedic, Bariatric, Cardiac, Fertility, Other.
11. Never invent a clinic, URL, rating or credential. If you find fewer than ${targetCount} real clinics, return fewer.
12. Include every review source you can verify, in any language. Do not limit yourself to the examples above.

RESEARCH METHODOLOGY:
1. Search in English AND in the local language of ${city}. For example, for "${service} clinic" also search the translated terms and "reseñas" or "opiniones" in Spanish, "yorumlar" in Turkish, or "รีวิว" in Thai, as the country requires.
2. Prioritize clinics with: websites, multiple reviews, visible credentials
3. Extract reviews from: clinic websites, Google Maps, and any review site, directory, forum or local platform that lists the clinic (international or local)
4. Verify data before including (don't speculate)
5. If information is missing, mark as null and set confidence appropriately

Return the JSON array now (no other text):`;
}

/**
 * Run the research. Uses server-side web search so the model browses instead of
 * answering from memory. Streams the response, continues on pause_turn, and opts in
 * to refusal fallbacks (server-side, routed by refusal category).
 */
async function runResearch(prompt) {
  const messages = [{ role: 'user', content: prompt }];
  let pauses = 0;

  while (true) {
    const response = await client.beta.messages
      .stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'high' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        tools: [
          {
            type: 'web_search_20260209',
            name: 'web_search',
            max_uses: MAX_WEB_SEARCHES,
          },
        ],
        messages,
      })
      .finalMessage();

    if (response.stop_reason !== 'pause_turn') {
      return response;
    }

    pauses += 1;
    if (pauses > MAX_PAUSE_TURNS) {
      throw new Error(`Research paused more than ${MAX_PAUSE_TURNS} times; giving up`);
    }
    // Send the assistant turn back unchanged so the server can resume it
    messages.push({ role: 'assistant', content: response.content });
  }
}

/**
 * Pull the clinic array out of the response.
 */
function extractClinics(response) {
  if (response.stop_reason === 'refusal') {
    const category = response.stop_details?.category ?? 'unknown';
    throw new Error(`Model refused the request (category: ${category})`);
  }
  if (response.stop_reason === 'max_tokens') {
    throw new Error('Output hit max_tokens. Try a smaller --count.');
  }

  const textBlocks = response.content.filter((block) => block.type === 'text');
  const last = textBlocks[textBlocks.length - 1]?.text ?? '';
  const cleaned = last.replace(/```(?:json)?/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');

  if (start === -1 || end < start) {
    console.error('Response (first 500 chars):', cleaned.substring(0, 500));
    throw new Error('Response did not contain a JSON array');
  }

  try {
    const clinics = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(clinics)) {
      throw new Error('Parsed value is not an array');
    }
    return clinics;
  } catch (e) {
    console.error('Response (first 500 chars):', cleaned.substring(0, 500));
    throw new Error(`Failed to parse clinic JSON: ${e.message}`);
  }
}

/**
 * Call the API to research clinics
 */
async function researchClinics(city, service, targetCount) {
  console.log(`\n🤖 Medical Travel Research Agent Activated`);
  console.log(`📍 Researching ${service} clinics in ${city}...`);
  console.log(`🎯 Target: ${targetCount} clinics`);
  console.log(`🧠 Model: ${MODEL}\n`);

  const prompt = buildPrompt(city, service, targetCount);
  const response = await runResearch(prompt);
  const clinics = extractClinics(response);

  console.log(`✅ Agent successfully researched ${clinics.length} clinics\n`);

  return {
    clinics,
    metadata: {
      destination: city,
      procedure: service,
      target_count: targetCount,
      actual_count: clinics.length,
      timestamp: new Date().toISOString(),
      agent_model: response.model,
      web_searches: response.usage.server_tool_use?.web_search_requests ?? null,
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

/**
 * Check required fields on a clinic record
 */
function validateClinic(clinic, index) {
  const required = ['clinic_name', 'country', 'city', 'computed_review_score'];
  const missing = required.filter((field) => clinic[field] === null || clinic[field] === undefined);

  if (missing.length > 0) {
    console.warn(`⚠️  Clinic ${index + 1} (${clinic.clinic_name ?? 'unnamed'}) missing: ${missing.join(', ')}`);
  }

  return { clinic, valid: missing.length === 0, missing };
}

/**
 * Save results to JSON file
 */
function saveResults(data, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sanitizedDestination = data.metadata.destination.toLowerCase().replace(/\s+/g, '-');
  const sanitizedProcedure = data.metadata.procedure.toLowerCase().replace(/\s+/g, '-');
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${sanitizedDestination}_${sanitizedProcedure}_${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

  return filepath;
}

/**
 * Print summary to console
 */
function printSummary(data) {
  const { clinics, metadata } = data;

  console.log('\n' + '='.repeat(80));
  console.log('RESEARCH AGENT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Destination: ${metadata.destination}`);
  console.log(`Procedure: ${metadata.procedure}`);
  console.log(`Clinics Found: ${metadata.actual_count} / ${metadata.target_count} target`);
  console.log(`Web searches: ${metadata.web_searches ?? 'n/a'}`);
  console.log(`Timestamp: ${metadata.timestamp}`);
  console.log(`\nTokens Used: ${metadata.total_tokens}`);
  console.log(`  - Input: ${metadata.input_tokens}`);
  console.log(`  - Output: ${metadata.output_tokens}`);
  console.log('\nTop 5 Clinics (by review score):');
  console.log('-'.repeat(80));

  const topClinics = [...clinics]
    .sort((a, b) => (b.computed_review_score || 0) - (a.computed_review_score || 0))
    .slice(0, 5);

  topClinics.forEach((clinic, i) => {
    const languages = (clinic.languages_spoken ?? []).join(', ') || 'N/A';
    console.log(`${i + 1}. ${clinic.clinic_name}`);
    console.log(`   Location: ${clinic.city}, ${clinic.country}`);
    console.log(`   Review Score: ${clinic.computed_review_score ?? 'N/A'}/5 (${clinic.total_review_count ?? 0} reviews)`);
    console.log(`   Cost: ${clinic.typical_procedure_cost || 'N/A'}`);
    console.log(`   Languages: ${languages}`);
    console.log(`   Website: ${clinic.website || 'N/A'}`);
    console.log('');
  });

  console.log('Data Quality:');
  console.log('-'.repeat(80));
  const validationResults = clinics.map((clinic, i) => validateClinic(clinic, i));
  const validCount = validationResults.filter((v) => v.valid).length;
  console.log(`✅ Valid records: ${validCount}/${clinics.length}`);

  const confidenceHigh = clinics.filter((c) => c.research_confidence === 'HIGH').length;
  const confidenceMedium = clinics.filter((c) => c.research_confidence === 'MEDIUM').length;
  const confidenceLow = clinics.filter((c) => c.research_confidence === 'LOW').length;
  console.log(`📊 Confidence Levels:`);
  console.log(`   - HIGH: ${confidenceHigh}`);
  console.log(`   - MEDIUM: ${confidenceMedium}`);
  console.log(`   - LOW: ${confidenceLow}`);

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable not set (add it to backend/.env)');
    }

    const result = await researchClinics(destination, procedure, count);

    printSummary(result);

    const filepath = saveResults(result, outputDir);
    console.log(`💾 Results saved to: ${filepath}`);
    console.log(`\n✨ Research agent complete! Next:`);
    console.log(`   1. Review the JSON file for data quality`);
    console.log(`   2. Compare against your notes`);
    console.log(`   3. Merge into the master JSON once that function exists\n`);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
