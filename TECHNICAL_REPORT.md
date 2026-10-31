# Cynbit Full Stack Developer Internship Assessment — Technical Report

**Candidate:** Kruti Vijay  
**Focus:** BCA (Artificial Intelligence Specialization)  
**Project:** Smart Project Inquiry Builder  
**Inspired By:** Cynbit Technologies (`cynbit.in`)  
**Date:** November 2026  

---

## Executive Summary

This report documents the architectural design, implementation details, testing strategies, security mechanisms, and deployment preparation for the **Smart Project Inquiry Builder** prototype. 

Built as an independent, full-stack application inspired by Cynbit Technologies, this system replaces passive, unstructured contact forms with a guided, service-aware, 6-step inquiry wizard. The architecture prioritizes data integrity, defense-in-depth security, graceful race-condition handling, and beginner-friendly maintainability.

---

## 1. Problem Statement & Proposed Solution

### The Business Challenge
In modern technology consulting and enterprise AI engineering, inbound project inquiries are frequently ambiguous. Clients often submit generic messages (e.g., *"Need an app, call me"*) without indicating:
1. Target service capabilities (e.g., autonomous AI agents vs. custom SaaS platforms vs. cloud migrations).
2. Defined project scopes and technical integrations.
3. Realistic budget parameters and delivery timelines.
4. Verifiable contact credentials.

Furthermore, traditional contact forms face severe technical challenges:
* Automated spam bots flooding submission endpoints.
* Unbounded payload attacks causing server denial-of-service (DoS).
* Duplicate submissions caused by impatient users double-clicking submit buttons or intermittent mobile network timeouts.
* Vulnerable database exposure when frontend clients communicate directly with databases using public keys.

### The Engineering Solution
The Smart Project Inquiry Builder solves these challenges through:
1. **A Guided 6-Step Intake Flow**: Progresses through Services, Scope, Budget/Timeline, Contact, Review/Edit, and Confirmation.
2. **Grounded Service Catalogue**: Aligned with Cynbit's 4 verified published client service lines (AI Automation, Custom Software, Cloud Solutions, and Digital Marketing/SEO), plus 1 proposed prototype addition (UI/UX Design & Product Strategy) introduced to represent design handoff.
3. **Indicative Dual-Currency Awareness**: Explicit USD and approximate INR budget brackets, clearly labeled as indicative scoping estimates rather than official Cynbit fixed rate cards.
4. **Idempotency by Design**: Generates a UUIDv4 idempotency key on the client and hardware-locks it via an atomic PostgreSQL unique constraint.
5. **Zero-Public-Access Database**: Enforces PostgreSQL Row Level Security (RLS) with zero public read policies, executing all database operations through a server-only Supabase client.

---

## 2. Design Decisions & Technical Architecture

### Why Next.js App Router (v15.5)?
* **Unified Full-Stack Runtime**: Allows co-locating interactive React client components with server-side Route Handlers (`app/api/...`) in a single TypeScript codebase.
* **Security Isolation**: Route handlers execute in a secure Node.js server environment where private secrets (`SUPABASE_SERVICE_ROLE_KEY`) are physically isolated from browser bundles.
* **Optimized Bundle Splitting**: Server components are pre-rendered statically, keeping client JavaScript light (first-load JS ~129 kB).

### Why Shared Zod Validation?
* **Single Source of Truth**: The validation schema is written once in `src/lib/validations/inquiry.ts` and imported by both the frontend wizard (for immediate field validation) and the backend route handler (for authoritative security).
* **Cross-Field Refinement**: Zod's `.superRefine()` enables semantic cross-validation (e.g. verifying that selected sub-services actually belong to the chosen category).

### Why Server-Only Supabase Architecture?
* **Zero Trust Client**: Direct browser-to-database connections (even with Supabase anon keys) require exposing database table schemas and relying entirely on RLS policies. 
* By channeling all requests through our Next.js Route Handler, we inspect media types, enforce byte limits, filter honeypots, and normalize inputs before PostgreSQL is ever contacted.
* We installed the official `server-only` package and added a runtime assertion (`typeof window !== "undefined"`), ensuring a compile-time build error if the admin client is ever imported into client code.

---

## 3. Database Design & Security Architecture

### Schema Design (`inquiries` table)
Defined in `supabase/migrations/001_create_inquiries_table.sql`:
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`): Non-sequential primary key preventing enumeration attacks.
* `reference` (`VARCHAR(50) UNIQUE NOT NULL`): Human-readable reference (`CYN-YYYYMMDD-XXXX`).
* `idempotency_key` (`UUID UNIQUE NOT NULL`): Hardware-enforced unique token.
* `service_category` & `sub_services` (`TEXT[]`): Native PostgreSQL array storing multiple selected capabilities cleanly.
* `project_description` (`TEXT NOT NULL`): Bounded 20 to 2,000 characters.
* `budget_range` & `timeline` (`VARCHAR(50) NOT NULL`): Categorical identifiers.
* `name`, `email`, `phone`, `company`: Normalized contact details.
* `consent_at` (`TIMESTAMPTZ NOT NULL`): Server-generated UTC timestamp.
* `status` (`VARCHAR(20) DEFAULT 'new'`): Managed state (`new`, `reviewed`, `contacted`, `archived`).
* `created_at` (`TIMESTAMPTZ DEFAULT now()`): UTC-safe creation timestamp.

### Indexing Decisions
* In PostgreSQL, declaring `CONSTRAINT uq_inquiries_reference UNIQUE` and `CONSTRAINT uq_inquiries_idempotency_key UNIQUE` automatically builds underlying B-tree indexes. Explicit duplicate indexes were identified and removed during our code audit.
* Added explicit descending index on `created_at` (`idx_inquiries_created_at`) and status index (`idx_inquiries_status`) for fast administrative querying.

### Row Level Security (RLS) Policy
```sql
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
```
* **Zero Public Access**: We intentionally declare **zero** public policies for `anon` or `authenticated` roles. PostgreSQL's default deny rule blocks all client-side queries.
* **Server Access via BypassRLS**: The server-side client authenticates using `SUPABASE_SERVICE_ROLE_KEY`, which holds the internal `service_role` role with `BYPASSRLS` privileges in Supabase.

---

## 4. Backend Implementation & Error Handling

### Request Handling Pipeline (`POST /api/inquiries`)
1. **Content-Type Validation**: Rejects requests missing `application/json` with `415 Unsupported Media Type`.
2. **Streaming Byte Bounding (`readBoundedRequestBody`)**: Consumes the `ReadableStream` chunk-by-chunk and cancels the network stream immediately if bytes exceed 100 KB (`413 Payload Too Large`), preventing memory exhaustion DoS attacks.
3. **Dual Honeypot Bot Trap**: Checks both `honeypot` and `inquiry_bot_trap`. If populated, returns a neutral `400 Bad Request` (`INVALID_REQUEST`) without alerting the bot to the honeypot mechanism.
4. **Server-Side Validation**: Executes `inquirySubmissionSchema.safeParse()`, returning `400 Validation Error` with field-level issues if invalid.
5. **Input Normalization**: Strips control characters and converts emails to lowercase.
6. **Server Consent Timestamp**: Generates `new Date().toISOString()`, never trusting client-supplied timestamps.
7. **PostgreSQL 23505 Unique Violation Disambiguation**:
   * **If `idempotency_key` conflicts**: The submission was repeated. The handler queries the existing record and returns `200 OK` (Idempotent Replay).
   * **If `reference` conflicts**: Extremely rare collision. The server retries insertion with a newly generated reference (up to 3 times) and returns `201 Created`. It never returns an idempotency replay for a reference collision.
8. **Sanitized Error Logging**: Logs only error codes (e.g. `23505`, `PGRST500`) and error names. Customer names, emails, phone numbers, and database connection strings are never logged or returned in HTTP error payloads.

---

## 5. Testing Methodology & Verification Results

### Test Suite Structure (Vitest)
All 62 tests run and pass without a live database connection by using mocked Supabase responses (`vi.mock('@/lib/supabase/server')`). They are strictly unit and Route Handler integration tests; no live database connection is made during test execution to ensure fast, isolated, and deterministic testing:

| Test File | Tests | Focus Area |
| :--- | :--- | :--- |
| `tests/unit/smoke.test.ts` | 1 | Verifies test harness operational status. |
| `tests/unit/reference.test.ts` | 4 | Format verification (`CYN-YYYYMMDD-XXXX`), UTC date parsing, and cryptographic entropy check. |
| `tests/unit/sanitize.test.ts` | 9 | Email lowercasing, whitespace trimming, and unprintable control character removal. |
| `tests/unit/supabase.test.ts` | 6 | Configuration verification, singleton caching, and browser-runtime blockage test. |
| `tests/unit/validation.test.ts` | 20 | Zod rules, sub-service cross-validation, character bounds, and phone validation. |
| `tests/unit/wizard-logic.test.ts` | 10 | Step progression rules, review payload assembly, and state retention. |
| `tests/api/inquiries.test.ts` | 12 | Route handler tests: 415 media type, 413 stream limits, 400 honeypot, 400 validation, 503 DB unavailable, 201 created, 200 idempotent replay, 23505 reference collision retry, and 500 sanitized DB failure. |

### Test Execution Output
```text
Test Files  7 passed (7)
     Tests  62 passed (62)
  Duration  307ms
```

### Production Build Verification
```text
✓ Compiled successfully in 1052ms
✓ Linting and checking validity of types 
✓ Generating static pages (5/5)
✓ Finalizing page optimization 
```

---

## 6. Deployment Preparation Guide

Follow these beginner-friendly, manual instructions when you are ready to deploy:

### Part 1: Setting Up the Supabase Database
1. Go to [supabase.com](https://supabase.com/) and create a free account.
2. Click **New Project**, choose an organization, name the project (e.g., `cynbit-inquiry-builder`), set a secure database password, and choose a region close to your target users (e.g., `ap-south-1` Mumbai).
3. Once provisioned, navigate to the **SQL Editor** in the left sidebar.
4. Click **New Query**, open the project file [supabase/migrations/001_create_inquiries_table.sql](file:///Users/krutivijay/Cynbit-Assessment/supabase/migrations/001_create_inquiries_table.sql), copy its entire contents, paste them into the SQL editor, and click **Run**.
5. Verify in **Table Editor** that the `inquiries` table exists and displays the lock icon indicating **RLS is enabled**.
6. Navigate to **Project Settings** -> **API**:
   * Copy the **Project URL** (this will be `SUPABASE_URL`).
   * Scroll down to **Project API keys** and copy the **`service_role`** key (this will be `SUPABASE_SERVICE_ROLE_KEY`).  
   *(Never share or commit this key!)*

### Part 2: Deploying to Vercel
1. Push your clean Git repository to your personal GitHub account.
2. Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
3. Click **Add New** -> **Project**, and select your `Cynbit-Assessment` repository.
4. In the configuration screen, expand **Environment Variables** and add:
   * `SUPABASE_URL`: Paste your Project URL.
   * `SUPABASE_SERVICE_ROLE_KEY`: Paste your private service role key.
5. Click **Deploy**. Vercel will run `npm run build` and provision your globally distributed application.

### Part 3: Verifying the Live Deployment
1. Visit your live Vercel URL (e.g., `https://cynbit-assessment.vercel.app`).
2. Complete all 6 steps of the wizard and submit a test inquiry.
3. Confirm that Step 6 displays a newly generated reference number (`CYN-YYYYMMDD-XXXX`).
4. Click **Submit Another Inquiry**, submit a second inquiry, and verify a unique second reference is generated.
5. Open your **Supabase Dashboard** -> **Table Editor** -> `inquiries` table, and verify that both test records were inserted with UTC timestamps, normalized emails, and `status: new`.

---

## 7. Known Limitations & Future Scope

### Current Limitations
1. **Single-Node Idempotency In-Flight**: Idempotency is enforced by PostgreSQL at commit time. For ultra-high volume distributed clusters, adding an in-memory Redis cache for locking in-flight requests would be beneficial.
2. **Prototype Scope**: As agreed in the assessment specification, features like back-office admin login, file attachments, and automated outbound email delivery are omitted from this MVP.

### Future Scope
1. **Automated Customer Confirmations**: Integrate Resend or SendGrid to email customers their reference number and inquiry summary immediately.
2. **Sales Engineer Admin Dashboard**: Create an authenticated Next.js dashboard (`/admin`) for Cynbit staff to filter inquiries by status (`new`, `reviewed`, `contacted`) and add internal notes.
3. **Automated CRM Sync**: Push validated inquiries directly into Cynbit's internal CRM or Slack notifications via webhook events.

---

## 8. Conclusion

The Cynbit Smart Project Inquiry Builder meets all technical, architectural, and security requirements set out in the assessment specification. The codebase is fully type-safe, backed by 62 automated unit and API tests, strictly protects customer data via PostgreSQL Row Level Security, and maintains a clean, documented commit history ready for evaluation.
