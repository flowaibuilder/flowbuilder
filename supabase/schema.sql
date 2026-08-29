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

-- Create the saved_dashboards table to store user dashboards
CREATE TABLE public.saved_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_name TEXT,
    csv_content TEXT,
    analysis_type TEXT DEFAULT 'general',
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can manage their own saved dashboards)
CREATE POLICY "Users can select their own dashboards" 
    ON public.saved_dashboards FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboards" 
    ON public.saved_dashboards FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards" 
    ON public.saved_dashboards FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards" 
    ON public.saved_dashboards FOR DELETE 
    USING (auth.uid() = user_id);

