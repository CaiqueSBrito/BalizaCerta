-- Tabela de aulas agendadas entre instrutores e alunos
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_lessons_instructor_id ON public.lessons(instructor_id);
CREATE INDEX idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX idx_lessons_scheduled_date ON public.lessons(scheduled_date);
CREATE INDEX idx_lessons_status ON public.lessons(status);

-- Habilitar RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lessons
-- Instrutores podem ver suas próprias aulas
CREATE POLICY "Instructors can view their own lessons"
ON public.lessons FOR SELECT
USING (
  auth.uid() IN (
    SELECT profile_id FROM public.instructors WHERE id = lessons.instructor_id
  )
);

-- Alunos podem ver suas próprias aulas
CREATE POLICY "Students can view their own lessons"
ON public.lessons FOR SELECT
USING (auth.uid() = student_id);

-- Instrutores podem criar aulas
CREATE POLICY "Instructors can create lessons"
ON public.lessons FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT profile_id FROM public.instructors WHERE id = instructor_id
  )
);

-- Alunos podem criar aulas (solicitar)
CREATE POLICY "Students can create lessons"
ON public.lessons FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Instrutores podem atualizar suas aulas
CREATE POLICY "Instructors can update their lessons"
ON public.lessons FOR UPDATE
USING (
  auth.uid() IN (
    SELECT profile_id FROM public.instructors WHERE id = lessons.instructor_id
  )
);

-- Alunos podem atualizar suas aulas (cancelar, etc)
CREATE POLICY "Students can update their lessons"
ON public.lessons FOR UPDATE
USING (auth.uid() = student_id);

-- Instrutores podem deletar suas aulas
CREATE POLICY "Instructors can delete their lessons"
ON public.lessons FOR DELETE
USING (
  auth.uid() IN (
    SELECT profile_id FROM public.instructors WHERE id = lessons.instructor_id
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();