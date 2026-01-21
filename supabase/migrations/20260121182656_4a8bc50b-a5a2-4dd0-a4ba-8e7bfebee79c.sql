-- Add student-specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_vehicle boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS difficulties text;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.has_vehicle IS 'Whether the student has their own vehicle for practice';
COMMENT ON COLUMN public.profiles.difficulties IS 'Student self-reported difficulties (e.g., fear of hills, parking issues)';