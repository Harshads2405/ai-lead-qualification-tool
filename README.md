# LeadLens — AI Lead Qualification Tool

A focused technical-assessment project that turns inbound lead details into an AI-assisted qualification.

## What it does

1. Collects company, website, service, budget, and goal.
2. Validates the input in the browser and again on the server.
3. Sends the structured lead to an LLM through a server-side API route.
4. Returns:
   - High / Medium / Low qualification
   - 0–100 supporting score
   - reasoning
   - missing information
   - next best action
5. Stores the lead and structured AI response in PostgreSQL/Supabase.
6. Shows loading, validation, API error, and success states.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- OpenAI Responses API with Structured Outputs
- Supabase PostgreSQL
- Zod for server-side validation
- Vercel for deployment

## Local setup

### 1. Install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

The Supabase service-role key must never be exposed to the browser.

### 3. Create the database

Create a Supabase project and run:

```text
supabase/schema.sql
```

in the Supabase SQL Editor.

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Architecture

```text
Browser
  |
  | POST /api/qualify
  v
Next.js Route Handler
  |
  +--> Zod validation
  |
  +--> OpenAI Responses API
  |       |
  |       +--> Structured JSON schema
  |
  +--> Supabase Postgres
  |
  v
Structured qualification response
  |
  v
Result UI
```

## Why this architecture?

The assignment explicitly says not to over-engineer. A single Next.js application keeps the UI and small backend boundary in one deployable unit. The LLM call is server-side so the API key is never sent to the browser. Supabase provides managed PostgreSQL without adding a separate backend service.

I used structured model output rather than free-form text because the application needs predictable fields for the UI and database.

I deliberately did **not** add authentication, CRM integrations, website scraping, background jobs, or a multi-service architecture. Those would increase scope without improving the core assessment significantly.

## Qualification logic

The LLM is instructed to use only supplied information and not invent website/company facts.

- High: 75–100
- Medium: 45–74
- Low: 0–44

The score is supporting context; the label is the primary qualification.

## Security decisions

- OpenAI key is server-side only.
- Supabase service-role key is server-side only.
- Browser access to the stored lead table is blocked with RLS and no public policies.
- Input is validated both client-side and server-side.
- The app does not fetch arbitrary websites, avoiding unnecessary SSRF/security complexity.

## Deployment

Recommended deployment:

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables in Vercel Project Settings.
4. Deploy.
5. Test the live URL with at least three cases:
   - strong/high-intent lead
   - ambiguous/medium lead
   - weak/low-intent lead

