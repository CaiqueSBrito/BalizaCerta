-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp TEXT NOT NULL,
  tem_veiculo BOOLEAN NOT NULL DEFAULT false,
  dificuldades TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Policy: Students can insert their own record
CREATE POLICY "Students can insert their own record"
ON public.students
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Students can view their own data
CREATE POLICY "Students can view their own data"
ON public.students
FOR SELECT
USING (auth.uid() = id);

-- Policy: Students can update their own data
CREATE POLICY "Students can update their own data"
ON public.students
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Students can delete their own data
CREATE POLICY "Students can delete their own data"
ON public.students
FOR DELETE
USING (auth.uid() = id);

-- Policy: Admins can view all students
CREATE POLICY "Admins can view all students"
ON public.students
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Policy: Admins can update any student
CREATE POLICY "Admins can update any student"
ON public.students
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Policy: Instructors can view connected students (whatsapp and dificuldades only via function)
-- We'll create a secure function for this instead of direct table access
CREATE POLICY "Instructors can view connected students"
ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.connections c
    JOIN public.instructors i ON c.instructor_id = i.id
    WHERE c.student_id = students.id
    AND i.profile_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create secure function to get student info for instructors
CREATE OR REPLACE FUNCTION public.get_connected_student_info(p_student_id UUID)
RETURNS TABLE(whatsapp TEXT, dificuldades TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the caller is an instructor with a connection to this student
  IF NOT EXISTS (
    SELECT 1 FROM connections c
    JOIN instructors i ON c.instructor_id = i.id
    WHERE c.student_id = p_student_id
    AND i.profile_id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT s.whatsapp, s.dificuldades
  FROM students s
  WHERE s.id = p_student_id;
END;
$$;