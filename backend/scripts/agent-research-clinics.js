#!/usr/bin/env node

/**
 * Medical Travel Directory - AI Research Agent
 * 
 * An AI-driven agent that researches medical clinics for a given destination + procedure
 * using Claude API and outputs clean, structured JSON for data analysis.
 * 
 * Usage:
 *   node scripts/agent-research-clinics.js --destination "Mexico City" --procedure "Dental"
 * 
 * Output:
 *   research_results/mexico-city_dental_[timestamp].json
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Parse command-line arguments
 */
const argv = yargs(hideBin(process.argv))
  .option('destination', {
    alias: 'd',
    describe: 'Destination city/region (e.g., "Mexico City", "Bangkok")',
    type: 'string',
    demandOption: true,
  })
  .option('procedure', {
    alias: 'p',
    describe: 'Medical procedure (e.g., "Dental", "Cosmetic Surgery")',
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
    describe: 'Number of clinics to research (default: 50)',
    type: 'number',
    default: 50,
  })
  .parseSync();

const { destination, procedure, outputDir, count } = argv;

/**
 * Generate the research prompt for Claude
 */
function generateResearchPrompt(destination, procedure, targetCount) {
  return `You are a medical travel research agent. Your job is to research and extract data about ${procedure} clinics in ${destination}.

Research approximately ${targetCount} clinics that offer ${procedure} in ${destination}.

For EACH clinic, extract the following data in JSON format:

{
  "clinic_name": "Exact clinic name",
  "country": "Country name",
  "city": "City name",
  "website": "https://... or null if not found",
  "email": "clinic@example.com or null",
  "phone": "+country-code or null",
  "lead_doctor_name": "Doctor's full name or null",
  "doctor_certifications": "Comma-separated certifications (e.g., 'DDS, Prosthodontist, Harvard Dental School') or null",
  "clinic_certifications": ["JCI", "ISO", "AACD", "ASPS"] (only actual certifications found, empty array if none),
  "languages_spoken": ["English", "Spanish"] (languages where staff can communicate, minimum 2 chars),
  "specialties": ["Dental", "Cosmetic"] (medical specialties offered),
  "years_in_business": 15 (number only, null if unknown),
  "review_sources": {
    "google": {
      "rating": 4.8,
      "review_count": 245,
      "url": "https://maps.google.com/..."
    },
    "tripadvisor": {
      "rating": 4.7,
      "review_count": 189,
      "url": "https://www.tripadvisor.com/..."
    },
    "realself": {
      "rating": 4.6,
      "review_count": 127,
      "url": "https://www.realself.com/..."
    }
  },
  "computed_review_score": 4.7 (number 1-5, weighted average from sources),
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
9. computed_review_score: round to 1 decimal (e.g., 4.7), calculate as weighted average.
10. For specialties, use only: Dental, Cosmetic, Orthopedic, Bariatric, Cardiac, Fertility, Other.

RESEARCH METHODOLOGY:
1. Search for: "[${destination}] [${procedure}] clinic", "[${destination}] medical tourism"
2. Prioritize clinics with: websites, multiple reviews, visible credentials
3. Extract from: clinic websites, Google Maps, TripAdvisor, RealSelf, medical forums
4. Verify data before including (don't speculate)
5. If information is missing, mark as null and set confidence appropriately

Return the JSON array now (no other text):`;
}

/**
 * Call Claude API to research clinics
 */
async function researchClinics(destination, procedure, targetCount) {
  console.log(`\n🤖 Medical Travel Research Agent Activated`);
  console.log(`📍 Researching ${procedure} clinics in ${destination}...`);
  console.log(`🎯 Target: ${targetCount} clinics\n`);

  const prompt = generateResearchPrompt(destination, procedure, targetCount);

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      temperature: 0.3,
      system: 'You are a medical travel research agent. Extract data accurately and completely. Return ONLY valid JSON array, no other text.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = response.content[0]?.text || '';

    // Parse JSON response
    let clinics;
    try {
      clinics = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse Claude response as JSON');
      console.error('Response:', responseText.substring(0, 500));
      throw new Error('Invalid JSON response from Claude');
    }

    if (!Array.isArray(clinics)) {
      throw new Error('Claude response is not a JSON array');
    }

    console.log(`✅ Agent successfully researched ${clinics.length} clinics\n`);

    return {
      clinics,
      metadata: {
        destination,
        procedure,
        target_count: targetCount,
        actual_count: clinics.length,
        timestamp: new Date().toISOString(),
        agent_model: 'claude-3-5-sonnet-20241022',
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error('❌ Error calling Claude API:', error.message);
    throw error;
  }
}

/**
 * Validate clinic data structure
 */
function validateClinic(clinic, index) {
  const required = ['clinic_name', 'country', 'city', 'computed_review_score'];
  const missing = required.filter((field) => clinic[field] === null || clinic[field] === undefined);

  if (missing.length > 0) {
    console.warn(`⚠️  Clinic ${index + 1} (${clinic.clinic_name}) missing: ${missing.join(', ')}`);
  }

  return {
    clinic,
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Save results to JSON file
 */
function saveResults(data, outputDir) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename
  const sanitizedDestination = data.metadata.destination.toLowerCase().replace(/\s+/g, '-');
  const sanitizedProcedure = data.metadata.procedure.toLowerCase().replace(/\s+/g, '-');
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `${sanitizedDestination}_${sanitizedProcedure}_${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  // Write to file
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
  console.log(`Timestamp: ${metadata.timestamp}`);
  console.log(`\nTokens Used: ${metadata.total_tokens}`);
  console.log(`  - Input: ${metadata.input_tokens}`);
  console.log(`  - Output: ${metadata.output_tokens}`);
  console.log('\nTop 5 Clinics (by review score):');
  console.log('-'.repeat(80));

  const topClinics = clinics.sort((a, b) => (b.computed_review_score || 0) - (a.computed_review_score || 0)).slice(0, 5);

  topClinics.forEach((clinic, i) => {
    console.log(`${i + 1}. ${clinic.clinic_name}`);
    console.log(`   Location: ${clinic.city}, ${clinic.country}`);
    console.log(`   Review Score: ${clinic.computed_review_score}/5 (${clinic.total_review_count} reviews)`);
    console.log(`   Cost: ${clinic.typical_procedure_cost || 'N/A'}`);
    console.log(`   Languages: ${clinic.languages_spoken.join(', ') || 'N/A'}`);
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
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable not set');
    }

    // Research clinics
    const result = await researchClinics(destination, procedure, count);

    // Print summary
    printSummary(result);

    // Save to JSON
    const filepath = saveResults(result, outputDir);
    console.log(`💾 Results saved to: ${filepath}`);
    console.log(`\n✨ Research agent complete! You can now:`);
    console.log(`   1. Review the JSON file for data quality`);
    console.log(`   2. Compare against your notes`);
    console.log(`   3. Run data analysis`);
    console.log(`   4. Later: Import into PostgreSQL\n`);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run
main();