CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT profiles_name_not_empty CHECK (name <> '')
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);

-- Create index for sorting by created_at
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own profiles
CREATE POLICY "Users can view their own profiles"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own profiles
CREATE POLICY "Users can insert their own profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own profiles
CREATE POLICY "Users can update their own profiles"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own profiles
CREATE POLICY "Users can delete their own profiles"
    ON public.profiles FOR DELETE
    USING (auth.uid() = user_id);
