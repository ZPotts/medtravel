# Contributing

## Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes + test locally
3. Push + create PR
4. Address feedback + merge

## Code Style
- Use `const` by default
- Arrow functions for callbacks
- Async/await, not `.then()` chains
- JSDoc comments for functions

## Adding Features

### Claude Prompts
- Add to `backend/prompts/`
- Wrap in service function in `backend/src/services/claude.js`
- Test with sample data

### API Endpoints
- Create in `backend/src/routes/`
- Include error handling + logging
- Document in comments

### Airtable Changes
- Update `backend/config/airtable-schema.json`
- Document in commit message

### Frontend
- Build React components in `frontend/components/`
- Test on multiple screen sizes
- Include loading/error states

## Auditing
Every Claude call should log: input, prompt version, output, timestamp, user.

Remember: This is portfolio-quality code. Treat it professionally.
