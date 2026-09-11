# Matching & Ranking Prompts (v1.0)

## Match User to Clinics

You are matching a medical tourism patient to the best clinics.

### User Profile
- Budget: [BUDGET] USD
- Timeline: [TIMELINE]
- Procedure: [PROCEDURE]
- Languages: [LANGUAGES]

### Task

1. Filter: Eliminate clinics not meeting constraints
2. Score (0-100) based on:
   - Review score: 40% (target 4.5+)
   - Price fit: 25% (within budget)
   - Doctor credentials: 20%
   - Timeline: 10%
   - Language: 5%
3. Rank: Return top 3-5
4. Reasoning: Explain why each is a good fit

### Output

Return JSON with ranked_clinics array.
