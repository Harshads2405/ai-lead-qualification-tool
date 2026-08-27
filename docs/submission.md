# Assessment Submission Notes

## Live application

`PASTE_VERCEL_URL_HERE`

## GitHub

`PASTE_GITHUB_REPOSITORY_URL_HERE`

## Database structure

Table: `lead_qualifications`

| Column | Type | Purpose |
|---|---|---|
| id | uuid | Primary key |
| created_at | timestamptz | Creation timestamp |
| company | text | Lead company |
| website | text | Lead website |
| service | text | Requested service |
| budget | text | Stated budget |
| goal | text | Business goal |
| qualification | text | High / Medium / Low |
| score | integer | 0–100 supporting score |
| reasoning | text | AI reasoning |
| missing_information | jsonb | Qualification gaps |
| next_best_action | text | Recommended sales action |
| model | text | Model used |

## Architecture snapshot

```text
                   ┌─────────────────────┐
                   │     Next.js UI      │
                   │  Lead form + result │
                   └──────────┬──────────┘
                              │
                       POST /api/qualify
                              │
                   ┌──────────▼──────────┐
                   │ Next.js API Route   │
                   │ validation + logic  │
                   └───────┬───────┬─────┘
                           │       │
                    ┌──────▼───┐ ┌─▼─────────────┐
                    │ OpenAI   │ │ Supabase      │
                    │ LLM      │ │ PostgreSQL    │
                    └──────────┘ └───────────────┘
```

## Technical decisions

### 1. Next.js instead of separate frontend/backend

The task is intentionally small. One application reduces deployment and integration overhead while still providing a clear server-side API boundary.

### 2. Structured Outputs

The model is asked to return a strict JSON schema so the frontend receives predictable fields instead of parsing natural language.

### 3. Supabase

Supabase gives the project a managed PostgreSQL database and an easy dashboard for demonstrating stored structured results.

### 4. No website scraping

The URL is captured as lead context but the application does not crawl it. This keeps the assessment focused and avoids introducing SSRF, scraping reliability, robots.txt, timeouts, and content extraction concerns.

### 5. No authentication

Authentication is intentionally outside the requested scope. The stored table is not exposed to the public browser, and the server writes through a server-only service-role credential.

## Demo cases

### High

Company: Acme SaaS
Website: https://acme.example
Service: B2B website redesign and conversion optimization
Budget: ₹5–8 lakh
Goal: Increase qualified demo requests by 40% in the next quarter.

Expected: High.

### Medium

Company: Example Retail
Website: https://example.example
Service: E-commerce development
Budget: Budget to be finalized
Goal: Improve online sales and make the checkout easier to use.

Expected: Medium.

### Low

Company: Small Local Business
Website: https://example.example
Service: Full digital transformation
Budget: No budget yet
Goal: We want to see what is possible.

Expected: Low or Medium depending on model reasoning; the key is that the response should explain the uncertainty and request missing qualification details.
