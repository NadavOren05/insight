# Insight Backend

TypeScript Express backend skeleton for Insight, using Supabase JS for Postgres access and Claude for AI-generated academic insights.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill `.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-or-anon-key
CLAUDE_API_KEY=your-claude-api-key
PORT=4000
```

## Scripts

```bash
npm run dev
npm run build
npm start
```

## Routes

- `GET /health`
- `POST /api/auth/login`
- `GET /api/students/:id/overview`
- `GET /api/students/:id/subject/:subjectId`
- `POST /api/generate-lesson`

## Architecture

The backend uses controller-service-repository boundaries:

- `controllers/`: HTTP request parsing, Zod validation, JSON responses.
- `services/`: business logic, AI orchestration, cache decisions.
- `repositories/`: Supabase queries and SQL join boundaries.
- `middleware/`: logging, not-found, and global error handling.

## Supabase Notes

Database interfaces in `src/types/database.ts` are inferred from the requested Insight schema because no final SQL schema file exists yet. Repository methods isolate snake_case Supabase rows and map them into camelCase TypeScript objects.

Attendance rows must include `topic_id` and `subject_id` so AI analysis can correlate missed lessons with weak topics.

## Claude Notes

`aiService.getOrCreateAnalysis(studentId, subjectId)` checks `student_ai_analysis` for an analysis generated today. If no cached row exists, it fetches raw grades and attendance, prompts Claude for strict JSON, validates the response with Zod, then saves the analysis and topic rows.
