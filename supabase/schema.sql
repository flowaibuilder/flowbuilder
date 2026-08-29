-- ==============================================================================
-- FLOW AI WEB BUILDER - MASTER SUPABASE DATABASE SCHEMA
-- ==============================================================================

-- 1. CLEANUP UNNEEDED MODULES
-- Remove legacy Data Agent tables if present
DROP TABLE IF EXISTS public.saved_dashboards CASCADE;

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CORE WEB BUILDER TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- TABLE: saved_websites
-- Description: Stores draft and saved website projects created by users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft', -- 'draft' or 'published'
    spec JSONB,                  -- AI-generated section structure & content
    theme JSONB,                 -- Custom color palette & design tokens
    config JSONB,                -- Site metadata (feel, font, logo, subdomain)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure status column exists for existing tables
ALTER TABLE public.saved_websites ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- ------------------------------------------------------------------------------
-- TABLE: published_sites
-- Description: Stores live published websites accessible via custom subdomains
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.published_sites (
    subdomain TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    website_id UUID REFERENCES public.saved_websites(id) ON DELETE SET NULL,
    config JSONB NOT NULL,       -- Live site configuration served to visitors
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE: shared_forms
-- Description: Stores contact/lead form schemas generated for websites
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    headers JSONB NOT NULL,      -- Array of field headers e.g. ["Name", "Email", "Message"]
    dashboard_name TEXT
);

-- ------------------------------------------------------------------------------
-- TABLE: form_submissions
-- Description: Stores live responses submitted by visitors on published websites
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.shared_forms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL          -- Submitted form response values
);

-- ==============================================================================
-- 3. SUPABASE REALTIME CONFIGURATION
-- ==============================================================================
-- Enable Realtime for form_submissions so lead submissions stream in real-time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'form_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.form_submissions;
  END IF;
END $$;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.saved_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLICIES: saved_websites
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage saved_websites" ON public.saved_websites;
CREATE POLICY "Users manage saved_websites" 
    ON public.saved_websites FOR ALL 
    USING (auth.uid() = user_id OR user_id IS NULL);

-- ------------------------------------------------------------------------------
-- POLICIES: published_sites
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read for published sites" ON public.published_sites;
CREATE POLICY "Public read for published sites" 
    ON public.published_sites FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users insert published sites" ON public.published_sites;
CREATE POLICY "Users insert published sites" 
    ON public.published_sites FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
