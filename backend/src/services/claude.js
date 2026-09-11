import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function executePrompt(prompt, options = {}) {
  const { model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022', max_tokens = 2000, temperature = 0.7, system = 'You are an AI assistant helping with medical travel research and operations.' } = options;
  try {
    const response = await client.messages.create({ model, max_tokens, temperature, system, messages: [{ role: 'user', content: prompt }] });
    return { content: response.content[0]?.text || '', usage: { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens } };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Claude API call failed: ${error.message}`);
  }
}

export async function executePromptJSON(prompt, options = {}) {
  const response = await executePrompt(prompt, { ...options, temperature: 0.2 });
  try {
    let clean = response.content.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    const parsed = JSON.parse(clean.trim());
    return { data: parsed, usage: response.usage };
  } catch (error) {
    throw new Error(`JSON parsing error: ${error.message}`);
  }
}

export async function researchClinics(destination, procedure) {
  const prompt = `You are a medical travel researcher. Research 30-50 clinics in ${destination} that offer ${procedure}. Extract: clinic_name, country, city, website, languages_spoken, specialties, years_in_business, review_score (1-5), typical_procedure_cost, patient_satisfaction_percent. Return ONLY a JSON array.`;
  return (await executePromptJSON(prompt, { max_tokens: 4000, temperature: 0.3, system: 'Extract data accurately. Return only valid JSON.' })).data;
}

export async function matchUserToClinics(userPreferences, clinics) {
  const prompt = `Match user with budget $${userPreferences.budget}, timeline ${userPreferences.timeline}, procedure ${userPreferences.procedure} to these clinics. Rank by: review (40%), price (25%), credentials (20%), timeline (10%), language (5%). Return JSON with ranked_clinics array including clinic_name, match_score (0-100), match_reasoning.`;
  return (await executePromptJSON(prompt, { max_tokens: 2000, temperature: 0.5 })).data;
}

export async function generateClinicProfile(clinicData) {
  const prompt = `Write a clinic profile for ${clinicData.clinic_name} in markdown with: Headline, Why Patients Choose This Clinic, The Team, Certifications, Patient Experience, Specialties, Contact.`;
  return (await executePrompt(prompt, { max_tokens: 1500, temperature: 0.7 })).content;
}

export default { executePrompt, executePromptJSON, researchClinics, matchUserToClinics, generateClinicProfile };
