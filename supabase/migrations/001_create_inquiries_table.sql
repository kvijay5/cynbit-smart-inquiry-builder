-- ==============================================================================
-- Migration: 001_create_inquiries_table.sql
-- Description: Creates the 'inquiries' table with strict constraints, indexes,
--              and Row Level Security (RLS) for Cynbit Technologies.
-- ==============================================================================

-- 1. Ensure pgcrypto extension is available for UUID generation
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

    -- Audit timestamp when the record was inserted
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

    -- ==========================================================================
    -- Constraints
    -- ==========================================================================

    -- Guarantee unique human-friendly reference
    CONSTRAINT uq_inquiries_reference UNIQUE (reference),

    -- Guarantee idempotency: duplicate submissions with the same key will be rejected
    CONSTRAINT uq_inquiries_idempotency_key UNIQUE (idempotency_key),

    -- Validate allowable inquiry status values
    CONSTRAINT chk_inquiries_status CHECK (status IN ('new', 'reviewed', 'contacted', 'archived')),

    -- Basic database-level email syntax sanity check
    CONSTRAINT chk_inquiries_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ==============================================================================
-- Performance Indexes
-- ==============================================================================

-- Optimize sorting and listing by submission date (newest first)
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- Optimize filtering inquiries by review status
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- Optimize lookup by unique reference code
CREATE INDEX IF NOT EXISTS idx_inquiries_reference ON inquiries(reference);

-- Optimize idempotency key conflict lookups
CREATE INDEX IF NOT EXISTS idx_inquiries_idempotency_key ON inquiries(idempotency_key);

-- ==============================================================================
-- Security: Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 2. SECURITY POLICY: Strict Zero-Public-Access
-- By enabling RLS without creating any 'anon' or public SELECT policies, PostgreSQL
-- automatically denies all public read requests.
-- Only the backend server utilizing the SUPABASE_SERVICE_ROLE_KEY can insert
-- and query inquiry records.

COMMENT ON TABLE inquiries IS 'Customer inquiries for Cynbit Technologies. Public read access is completely forbidden by Row Level Security.';
