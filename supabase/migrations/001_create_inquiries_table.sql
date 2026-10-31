-- ==============================================================================
-- Migration: 001_create_inquiries_table.sql
-- Description: Creates the 'inquiries' table with strict constraints, optimal indexes,
--              and Row Level Security (RLS) for Cynbit Technologies.
-- ==============================================================================

-- 1. Ensure pgcrypto extension is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
    -- Unique identifier for internal reference
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Human-readable unique reference number generated server-side (e.g., CYN-20261101-A1B2)
    reference VARCHAR(50) NOT NULL,

    -- UUID idempotency key provided by client to prevent duplicate submissions
    idempotency_key UUID NOT NULL,

    -- Selected Cynbit service category (e.g., 'ai-automation', 'custom-software')
    service_category VARCHAR(100) NOT NULL,

    -- Array of selected sub-services under the category
    sub_services TEXT[] NOT NULL,

    -- Project description provided by the customer (20 to 2000 characters)
    project_description TEXT NOT NULL,

    -- Selected budget range identifier
    budget_range VARCHAR(50) NOT NULL,

    -- Expected delivery timeline identifier
    timeline VARCHAR(50) NOT NULL,

    -- Customer contact details
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(25),
    company VARCHAR(100),

    -- Timestamp when customer consented to communication & privacy policy
    consent_at TIMESTAMPTZ NOT NULL,

    -- Inquiry status (managed by Cynbit admin review)
    status VARCHAR(20) NOT NULL DEFAULT 'new',

    -- UTC-safe audit timestamp when the record was inserted
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ==========================================================================
    -- Constraints
    -- Note: PostgreSQL automatically builds underlying unique B-tree indexes
    -- for both reference and idempotency_key when UNIQUE constraints are declared.
    -- ==========================================================================

    CONSTRAINT uq_inquiries_reference UNIQUE (reference),
    CONSTRAINT uq_inquiries_idempotency_key UNIQUE (idempotency_key),
    CONSTRAINT chk_inquiries_status CHECK (status IN ('new', 'reviewed', 'contacted', 'archived')),
    CONSTRAINT chk_inquiries_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ==============================================================================
-- Performance Indexes
-- (Redundant indexes on reference & idempotency_key are omitted because UNIQUE
--  constraints automatically generate them in PostgreSQL)
-- ==============================================================================

-- Optimize sorting and listing by submission date (newest first)
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- Optimize filtering inquiries by review status
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- ==============================================================================
-- Security: Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 2. ZERO PUBLIC ACCESS ENFORCEMENT:
-- In Supabase/PostgreSQL, when RLS is enabled on a table, all operations by
-- unauthenticated ('anon') and authenticated ('authenticated') public client roles
-- are DENIED by default unless an explicit POLICY is granted.
--
-- We deliberately define NO public policies (no SELECT, no INSERT, no UPDATE, no DELETE).
--
-- 3. SERVER-SIDE SERVICE-ROLE ACCESS:
-- The server-side client connects using the SUPABASE_SERVICE_ROLE_KEY, which assumes
-- the 'service_role' PostgreSQL role. In Supabase, 'service_role' possesses the
-- BYPASSRLS attribute, granting it full, secure access to insert inquiries and
-- handle idempotency checks from our Next.js Route Handler.

COMMENT ON TABLE inquiries IS 'Customer inquiries for Cynbit Technologies. Public access is completely blocked by Row Level Security; only the server-side service-role client has access.';
