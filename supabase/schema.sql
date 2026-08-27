-- Create the shared_forms table to store form configurations
CREATE TABLE public.shared_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    headers JSONB NOT NULL,
    dashboard_name TEXT
);

-- Create the form_submissions table to store user responses
CREATE TABLE public.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.shared_forms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL
);

-- Enable Realtime for form_submissions (Optional, but good if you want to use Supabase Realtime in the future)
alter publication supabase_realtime add table public.form_submissions;

-- Protect Network Security by Enabling Row Level Security (RLS)
-- This blocks all public (anon) access by default, but our backend's Service Role Key bypasses it.
ALTER TABLE public.shared_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
