-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (LENGTH(comment) >= 10 AND LENGTH(comment) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(instructor_id, student_id) -- One review per student per instructor
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public)
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Only authenticated students can insert their own reviews
CREATE POLICY "Students can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'student'
    )
    AND EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.student_id = auth.uid()
      AND l.instructor_id = reviews.instructor_id
      AND l.status = 'completed'
    )
  );

-- Students can update their own reviews
CREATE POLICY "Students can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = student_id);

-- Students can delete their own reviews
CREATE POLICY "Students can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = student_id);

-- Create index for faster lookups
CREATE INDEX idx_reviews_instructor_id ON public.reviews(instructor_id);
CREATE INDEX idx_reviews_student_id ON public.reviews(student_id);

-- Function to update instructor rating after review changes
CREATE OR REPLACE FUNCTION public.update_instructor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_instructor_id UUID;
  v_avg_rating NUMERIC;
  v_review_count INTEGER;
BEGIN
  -- Get the instructor_id from either NEW or OLD record
  IF TG_OP = 'DELETE' THEN
    v_instructor_id := OLD.instructor_id;
  ELSE
    v_instructor_id := NEW.instructor_id;
  END IF;

  -- Calculate new average rating and count
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_review_count
  FROM reviews
  WHERE instructor_id = v_instructor_id;

  -- Update instructor record
  UPDATE instructors
  SET 
    rating = ROUND(v_avg_rating, 1),
    review_count = v_review_count,
    updated_at = now()
  WHERE id = v_instructor_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to update rating on insert/update/delete
CREATE TRIGGER update_instructor_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_instructor_rating();

-- Function to check if a student can review an instructor
CREATE OR REPLACE FUNCTION public.can_student_review_instructor(p_instructor_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_student BOOLEAN;
  v_has_completed_lesson BOOLEAN;
  v_has_existing_review BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if user is logged in
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is a student
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE id = v_user_id AND user_type = 'student'
  ) INTO v_is_student;
  
  IF NOT v_is_student THEN
    RETURN FALSE;
  END IF;
  
  -- Check if student has a completed lesson with this instructor
  SELECT EXISTS(
    SELECT 1 FROM lessons
    WHERE student_id = v_user_id
    AND instructor_id = p_instructor_id
    AND status = 'completed'
  ) INTO v_has_completed_lesson;
  
  IF NOT v_has_completed_lesson THEN
    RETURN FALSE;
  END IF;
  
  -- Check if student already has a review for this instructor
  SELECT EXISTS(
    SELECT 1 FROM reviews
    WHERE student_id = v_user_id
    AND instructor_id = p_instructor_id
  ) INTO v_has_existing_review;
  
  -- Can only review if no existing review
  RETURN NOT v_has_existing_review;
END;
$$;