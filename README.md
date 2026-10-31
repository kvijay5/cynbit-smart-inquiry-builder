# Cynbit Technologies — Smart Project Inquiry Builder

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?style=flat&logo=vitest)](https://vitest.dev/)
[![Tests](https://img.shields.io/badge/Tests-62%20Passed-brightgreen)](tests/)

An independent, enterprise-grade full-stack prototype inspired by **Cynbit Technologies** (`cynbit.in`). This application implements a service-aware, multi-step project inquiry wizard engineered for high conversion, robust backend validation, zero-leakage security, and database idempotency.

---

## Table of Contents
1. [Project Overview & Problem Statement](#project-overview--problem-statement)
2. [Six-Step User Journey](#six-step-user-journey)
3. [Technology Stack & Rationale](#technology-stack--rationale)
4. [System Architecture & Request Flow](#system-architecture--request-flow)
5. [Project Folder Structure](#project-folder-structure)
6. [Database Schema & Data Dictionary](#database-schema--data-dictionary)
7. [API Endpoint Documentation](#api-endpoint-documentation)
8. [Security, Validation & Idempotency](#security-validation--idempotency)
9. [Local Setup Instructions (macOS)](#local-setup-instructions-macos)
10. [Environment Variables](#environment-variables)
11. [Running Tests & Production Build](#running-tests--production-build)
12. [Current Limitations & Future Scope](#current-limitations--future-scope)

---

## Project Overview & Problem Statement

### The Problem
Traditional website contact forms are passive, unstructured, and often result in incomplete project inquiries. Sales and engineering leads spend days following up with prospective clients simply to identify their tech stack, scope boundaries, budget constraints, and expected timelines. Furthermore, public web forms are constantly exposed to automated spam bots, payload flooding, and network duplicate submissions.

### The Solution
The **Smart Project Inquiry Builder** transforms the intake process into an intuitive, guided 6-step interactive journey:
* **Grounded in Cynbit's Verified Offerings**: Directly aligned with Cynbit's 4 core published client service pillars (`cynbit.in`):
  1. *AI Automation & Autonomous Agents* (Verified offering)
  2. *Custom Software & Full-Stack Development* (Verified offering)
  3. *Cloud Solutions & IT Architecture* (Verified offering)
  4. *Digital Marketing, SEO & CRM Automation* (Verified offering)
  5. *UI/UX Design & Product Strategy* (Proposed prototype addition for discovery and design handoff)
* **Indicative Dual-Currency Awareness**: Explicit USD brackets with clear INR equivalents tailored to Cynbit's headquarters in Jaipur, India and its global client base (clearly labeled as indicative scoping estimates, not official public rate cards).
* **Server-Enforced Data Quality**: Shared Zod schemas validate and sanitize all fields on both client and server.
* **Zero-Trust Security**: Row Level Security (RLS) denies public reads, the privileged service role key never touches browser bundles, and a streaming byte counter protects against DoS memory exhaustion.
* **Hardware-Locked Idempotency**: Atomic PostgreSQL unique constraints eliminate race-condition duplicates while gracefully replaying references for retried submissions.

---

## Six-Step User Journey

```
[ Step 1: Services ] ──► [ Step 2: Scope ] ──► [ Step 3: Budget & Timeline ]
                                                          │
[ Step 6: Confirmation ] ◄── [ Step 5: Review ] ◄── [ Step 4: Contact & Consent ]
```

1. **Step 1: Service Category & Capabilities**
   * The user selects a primary service category (4 verified Cynbit service lines + 1 proposed prototype addition).
   * Dynamically reveals relevant sub-service checkboxes with clear descriptions.
   * Requires at least one sub-service.
2. **Step 2: Project Scope & Overview**
   * A structured textarea for project goals, existing architecture, and technical constraints.
   * Live character counter enforcing bounds (20 to 2,000 characters).
   * Contextual guidance callout prompts users on key information to include.
3. **Step 3: Budget Range & Target Timeline**
   * Selectable budget cards displaying indicative scoping estimates (not official fixed prices) with explicit USD and INR amounts:
     * `< $5,000 USD (~₹4 Lakhs INR)`
     * `$5,000 - $15,000 USD (~₹4L - ₹12L INR)`
     * `$15,000 - $30,000 USD (~₹12L - ₹25L INR)`
     * `$30,000+ USD (~₹25 Lakhs+ INR)`
   * Realistic timeline options: `< 1 Month (Urgent)`, `1 - 3 Months`, `3 - 6 Months`, `Flexible / Exploring`.
4. **Step 4: Contact Details & Consent**
   * Collects Name, Work Email, optional Phone, and optional Company.
   * Requires explicit communication and privacy consent.
   * Features a visually hidden honeypot bot trap field (`inquiry_bot_trap`).
5. **Step 5: Review & Confirm**
   * Displays an organized summary of all choices with dedicated **[Edit]** shortcuts to jump directly to any step.
   * Displays the active client-generated idempotency token.
   * Double-click protection on the submit button with loading spinner.
6. **Step 6: Confirmation Screen**
   * Only renders upon verified `201 Created` or `200 OK` response from the backend.
   * Prominently displays the unique server-generated reference number (`CYN-YYYYMMDD-XXXX`).
   * One-click **Copy to Clipboard** button.
   * Outlines clear next steps for architectural consultation.

---

## Technology Stack & Rationale

| Layer | Technology | Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 15.5 | Unified React frontend with server-side API Route Handlers. Eliminates need for a separate Node/Express server. |
| **Language** | TypeScript | 5.7 | End-to-end type safety, autocompletion, and compile-time error prevention across client and server. |
| **Styling** | Tailwind CSS | 3.4 | Utility-first, responsive design matching Cynbit's modern palette without heavyweight runtime CSS overhead. |
| **Icons** | Lucide React | 0.477 | Clean, modern SVG icons optimized for tree-shaking. |
| **Validation** | Zod | 3.24 | Shared schema validation used on both the frontend (instant feedback) and backend (security enforcement). |
| **Database** | Supabase (PostgreSQL) | Latest | Managed relational PostgreSQL with native JSON/array types and powerful Row Level Security (RLS). |
| **DB Client** | `@supabase/supabase-js` | 2.49 | Official PostgreSQL client configured strictly on the server (`server-only`). |
| **Testing** | Vitest | 3.2 | Fast ESM/TypeScript unit and API testing runner with native Vite module resolution. |
| **Deployment** | Vercel | Production | Native zero-configuration platform for Next.js App Router and serverless Route Handlers. |

---

## System Architecture & Request Flow

```
[ Browser / Client ]
  │
  ├─ 1. User fills 6-step form with persistent state retention
  ├─ 2. Client-side Zod validation provides instant field feedback
  ├─ 3. Generates UUIDv4 Idempotency Key upon initial page load
  │
  ▼ POST /api/inquiries (Content-Type: application/json)
[ Next.js Route Handler (Server Runtime) ]
  │
  ├─ 4. Enforce Content-Type ('application/json') -> 415 if missing
  ├─ 5. Read bounded stream (aborts immediately if > 100 KB) -> 413 if oversized
  ├─ 6. Honeypot Check: Inspects 'honeypot' and 'inquiry_bot_trap' -> 400 neutral error if filled
  ├─ 7. Server-side Zod validation & cross-reference verification -> 400 with field issues
  ├─ 8. Input Normalization: Emails trimmed and lowercased
  ├─ 9. Generates Server Consent Timestamp: consent_at = new Date().toISOString()
  ├─ 10. Generates Reference Number: CYN-YYYYMMDD-XXXX (Crypto-secure random bytes)
  │
  ▼ Private HTTPS Connection with SUPABASE_SERVICE_ROLE_KEY
[ Supabase PostgreSQL Table: 'inquiries' ]
  │
  ├─ 11. Row Level Security (RLS) is ENABLED (Public reads are completely DENIED)
  ├─ 12. Attempts INSERT into inquiries
  │        ├─ Success ────────────────────────────────────────► Returns 201 Created
  │        └─ Unique Violation (code 23505)?
  │             ├─ Reference collision: Retries insertion with fresh reference (up to 3x)
  │             └─ Idempotency Key collision: Looks up existing record -> Returns 200 OK
  │
  ▼ JSON Response { success: true, data: { reference: "CYN-...", status: "new" } }
[ Browser / Client ] Renders Step 6 Confirmation screen with Copy Code utility
```

---

## Project Folder Structure

```text
Cynbit-Assessment/
├── .env.example              # Public environment template (safe to commit)
├── .gitignore                # Protects node_modules, .env.local, .next, and secrets
├── package.json              # Project dependencies and script runner commands
├── tsconfig.json             # TypeScript compiler settings and path aliases (@/*)
├── tailwind.config.ts        # Tailwind theme colors and content paths
├── postcss.config.mjs        # PostCSS configuration
├── vitest.config.ts          # Vitest test runner configuration
├── README.md                 # Complete system documentation
├── TECHNICAL_REPORT.md       # Technical design and assessment evaluation report
├── supabase/
│   └── migrations/
│       └── 001_create_inquiries_table.sql # PostgreSQL schema, constraints, RLS policies
├── src/
│   ├── app/
│   │   ├── layout.tsx        # HTML shell, metadata, and global stylesheets
│   │   ├── page.tsx          # Main landing page hosting the inquiry wizard
│   │   ├── globals.css       # Tailwind base styles and font family
│   │   └── api/
│   │       └── inquiries/
│   │           └── route.ts  # POST /api/inquiries route handler
│   ├── components/
│   │   └── wizard/
│   │       ├── WizardHeader.tsx        # Cynbit branding header and assessment context
│   │       ├── StepProgressBar.tsx    # Mobile & desktop 6-step progress indicator
│   │       ├── Step1Service.tsx        # Service category & sub-service multi-select
│   │       ├── Step2Description.tsx    # Scope description & live character counter
│   │       ├── Step3BudgetTimeline.tsx # Budget cards (USD & INR) and timeline choices
│   │       ├── Step4Contact.tsx        # Contact details, privacy consent, and honeypot
│   │       ├── Step5Review.tsx         # Comprehensive answer review with Edit shortcuts
│   │       ├── Step6Confirmation.tsx   # Success screen with reference number & copy button
│   │       └── WizardContainer.tsx     # Master client state machine and API submitter
│   ├── lib/
│   │   ├── constants/
│   │   │   └── services.ts   # Cynbit service catalogue, budget options, and limits
│   │   ├── supabase/
│   │   │   └── server.ts     # Server-only Supabase client with safety assertions
│   │   ├── utils/
│   │   │   ├── reference.ts  # Cryptographically secure reference code generator
│   │   │   └── sanitize.ts   # Email normalizer and text sanitizers
│   │   └── validations/
│   │       └── inquiry.ts    # Shared Zod validation schemas
│   └── types/
│       └── inquiry.ts        # TypeScript interfaces and inferred Zod types
└── tests/
    ├── api/
    │   └── inquiries.test.ts # API route tests (honeypot, stream limits, idempotency, 23505)
    └── unit/
        ├── reference.test.ts # Reference generator format and uniqueness tests
        ├── sanitize.test.ts  # Email normalization and string sanitizer tests
        ├── smoke.test.ts     # Test harness sanity check
        ├── supabase.test.ts  # Server client configuration and browser-blocker tests
        ├── validation.test.ts# Zod validation schema rules and error message tests
        └── wizard-logic.test.ts # Wizard step progression and state retention tests
```

---

## Database Schema & Data Dictionary

### Table: `inquiries`
Created via [supabase/migrations/001_create_inquiries_table.sql](file:///Users/krutivijay/Cynbit-Assessment/supabase/migrations/001_create_inquiries_table.sql).

| Column Name | PostgreSQL Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY DEFAULT gen_random_uuid()` | Internal immutable record ID. |
| `reference` | `VARCHAR(50)` | No | `CONSTRAINT uq_inquiries_reference UNIQUE` | Human-friendly reference (`CYN-YYYYMMDD-XXXX`). |
| `idempotency_key` | `UUID` | No | `CONSTRAINT uq_inquiries_idempotency_key UNIQUE` | Client-generated UUID preventing duplicate submissions. |
| `service_category` | `VARCHAR(100)`| No | None | Selected category (`ai-automation`, etc.). |
| `sub_services` | `TEXT[]` | No | None | Array of selected capability IDs. |
| `project_description`| `TEXT` | No | None | Project scope brief (20 to 2,000 characters). |
| `budget_range` | `VARCHAR(50)` | No | None | Budget tier identifier (`under-5k`, `5k-15k`, etc.). |
| `timeline` | `VARCHAR(50)` | No | None | Timeline identifier (`urgent`, `1-3-months`, etc.). |
| `name` | `VARCHAR(100)`| No | None | Customer full name (2 to 100 characters). |
| `email` | `VARCHAR(255)`| No | `CONSTRAINT chk_inquiries_email` | Lowercased, validated work email address. |
| `phone` | `VARCHAR(25)` | Yes | None | Optional phone number. |
| `company` | `VARCHAR(100)`| Yes | None | Optional organization name. |
| `consent_at` | `TIMESTAMPTZ` | No | None | Server-generated ISO timestamp of consent. |
| `status` | `VARCHAR(20)` | No | `DEFAULT 'new'` `CHECK (status IN (...))` | Status: `'new'`, `'reviewed'`, `'contacted'`, `'archived'`. |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT now()` | UTC transaction creation timestamp. |

### Indexes & Performance
* `uq_inquiries_reference`: Underlying B-tree index automatically created by the `UNIQUE` constraint.
* `uq_inquiries_idempotency_key`: Underlying B-tree index automatically created by the `UNIQUE` constraint.
* `idx_inquiries_created_at`: Explicit descending B-tree index on `created_at` for rapid pagination and chronological sorting.
* `idx_inquiries_status`: Explicit B-tree index on `status` for fast filtering during administrative triage.

### Security: Row Level Security (RLS)
```sql
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
```
* **Public Client Access**: Completely denied. No `anon` or `authenticated` SELECT/INSERT/UPDATE policies are created. Direct queries from the browser console are rejected by PostgreSQL.
* **Server-Side Access**: The Next.js Route Handler connects with `SUPABASE_SERVICE_ROLE_KEY` (which assumes the `service_role` role with `BYPASSRLS` privileges), allowing secure insertions and idempotency lookups.

---

## API Endpoint Documentation

### `POST /api/inquiries`
Handles validation, idempotency checks, reference generation, and database persistence.

#### Request Headers
```http
POST /api/inquiries HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

#### Request Payload Example
```json
{
  "idempotencyKey": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "serviceCategory": "ai-automation",
  "subServices": ["custom-llm", "autonomous-agents"],
  "projectDescription": "We need an autonomous AI customer support workflow integrated with our SaaS CRM platform.",
  "budgetRange": "15k-30k",
  "timeline": "1-3-months",
  "name": "Jane Doe",
  "email": "jane.doe@company.com",
  "phone": "+91 9876543210",
  "company": "Acme Global Technologies",
  "consent": true,
  "honeypot": ""
}
```

#### Response: `201 Created` (New Inquiry)
```json
{
  "success": true,
  "data": {
    "reference": "CYN-20261101-7M9K",
    "createdAt": "2026-11-01T01:15:30.123Z",
    "status": "new",
    "message": "Project inquiry submitted successfully."
  }
}
```

#### Response: `200 OK` (Idempotent Replay on Duplicate Submission)
```json
{
  "success": true,
  "data": {
    "reference": "CYN-20261101-7M9K",
    "createdAt": "2026-11-01T01:15:30.123Z",
    "status": "new",
    "message": "Inquiry was already received (idempotent submission)."
  }
}
```

#### Error Responses
| HTTP Status | Code | Meaning |
| :--- | :--- | :--- |
| **`400 Bad Request`** | `VALIDATION_ERROR` | Schema validation failed; includes field-level `details`. |
| **`400 Bad Request`** | `INVALID_REQUEST` | Honeypot field was filled by an automated bot. |
| **`400 Bad Request`** | `MALFORMED_JSON` | Body text could not be parsed as valid JSON. |
| **`413 Payload Too Large`** | `PAYLOAD_TOO_LARGE` | Incoming request exceeds the 100 KB limit. |
| **`415 Unsupported Media Type`** | `UNSUPPORTED_MEDIA_TYPE` | `Content-Type` is not `application/json`. |
| **`500 Internal Server Error`** | `DATABASE_ERROR` | Database operation failed unexpectedly (details sanitized). |
| **`503 Service Unavailable`** | `DATABASE_UNAVAILABLE` | Server-side Supabase credentials are not configured. |

---

## Security, Validation & Idempotency

1. **Shared Zod Schemas**: Schemas in `src/lib/validations/inquiry.ts` provide instant client feedback while guaranteeing that unvalidated or forged requests can never bypass server inspection.
2. **Streaming Payload Protection**: Reads the raw incoming `ReadableStream` chunk-by-chunk and cancels the network stream immediately if bytes exceed 100 KB (`readBoundedRequestBody`), protecting against memory exhaustion DoS attacks even if `Content-Length` is omitted.
3. **Dual Honeypot Bot Trap**: Checks both `honeypot` and `inquiry_bot_trap`. Real users never see or tab into this off-screen input, while scrapers fill it in, triggering a silent neutral rejection.
4. **Input Normalization**: Emails are stripped of whitespace and converted to lowercase. Unprintable control characters are removed from strings.
5. **PostgreSQL 23505 Conflict Disambiguation**: 
   * If `uq_inquiries_idempotency_key` conflicts: Looks up the existing record and returns `200 OK` (Idempotent Replay).
   * If `uq_inquiries_reference` conflicts: Generates a new reference and retries insertion (up to 3 times), never returning an idempotency response for a reference collision.
6. **Information Leakage Prevention**: Server logs record only error codes (e.g. `23505`, `PGRST500`) and error names. Customer names, emails, phone numbers, and database connection strings are never output to logs or HTTP error payloads.

---

## Local Setup Instructions (macOS)

### Prerequisites
* **macOS**: Monterey (12.0) or newer
* **Node.js**: v20+ or v24 LTS (current environment: `v24.18.0`)
* **npm**: v10+ or v11 (current environment: `11.16.0`)
* **Git**: Installed and configured

### Step-by-Step Setup
1. **Clone the Repository**:
   ```bash
   git clone <your-repository-url> Cynbit-Assessment
   cd Cynbit-Assessment
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   *Note: For running unit and API tests, real Supabase credentials are not required because tests utilize mocked database responses.*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

The project uses exactly two server-side environment variables defined in [.env.example](file:///Users/krutivijay/Cynbit-Assessment/.env.example):

```env
# Supabase Project URL (e.g., https://your-project-id.supabase.co)
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Service Role Key (SERVER-SIDE ONLY)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Security Rules:
* Neither variable is prefixed with `NEXT_PUBLIC_`, ensuring Next.js never includes them in client-side JavaScript bundles.
* [.gitignore](file:///Users/krutivijay/Cynbit-Assessment/.gitignore) strictly blocks `.env` and `.env*.local` from Git tracking.
* The Supabase admin client imports `server-only` and executes an additional runtime assertion verifying that `typeof window === "undefined"`.

---

## Running Tests & Production Build

### Automated Test Suite (Vitest)
Execute all 62 unit and API tests:
```bash
npm test
```
*Note: All 62 automated tests are isolated unit and route handler tests using mocked Supabase responses (`vi.mock('@/lib/supabase/server')`). They verify validation logic, stream limits, honeypot traps, and error branches without requiring a live database connection or network dependencies.*

To run tests in interactive watch mode during development:
```bash
npm run test:watch
```

### Production Build
Compile TypeScript, validate types, and generate static and dynamic server routes:
```bash
npm run build
```

Start the production server locally:
```bash
npm run start
```

---

## Current Limitations & Future Scope

### Current MVP Boundaries
Per the approved assessment specification, the following features are intentionally out of scope for this prototype:
* No administrative authentication or back-office dashboard.
* No outbound email notifications (e.g., SendGrid/Resend confirmation emails).
* No direct production API integration with Cynbit's live CRM or live website.
* No file/attachment uploads.
* No payment processing or live price calculator.

### Future Scope & Production Roadmap
1. **Email Notification Engine**: Add a serverless webhook triggering branded confirmation emails with calendar booking links.
2. **Cynbit Admin Triage Portal**: Build an internal, role-based dashboard for Cynbit sales engineers to filter inquiries by category, budget tier, and timeline.
3. **CRM Integration**: Forward validated inquiries directly into Hubspot, Salesforce, or Cynbit's proprietary CRM tools via background queues.
4. **Interactive File Attachments**: Allow users to attach project RFP documents or Figma wireframes via Supabase Storage with strict MIME type checking and virus scanning.
