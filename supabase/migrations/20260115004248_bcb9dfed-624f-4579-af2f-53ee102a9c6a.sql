-- Criar enum para tipo de usuário
CREATE TYPE public.user_type AS ENUM ('student', 'instructor');

-- Criar enum para plano do instrutor
CREATE TYPE public.instructor_plan AS ENUM ('free', 'pro');

-- Criar enum para categoria CNH
CREATE TYPE public.cnh_category AS ENUM ('A', 'B', 'AB', 'C', 'D', 'E');

-- Tabela de perfis
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  user_type public.user_type NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de instrutores (vinculada a profiles)
CREATE TABLE public.instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL DEFAULT 0,
  cnh_category public.cnh_category[] NOT NULL DEFAULT '{}',
  cnh_years INTEGER NOT NULL DEFAULT 0,
  has_vehicle BOOLEAN NOT NULL DEFAULT false,
  plan public.instructor_plan NOT NULL DEFAULT 'free',
  city TEXT,
  state TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conexões (contatos via WhatsApp)
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE CASCADE,
  contacted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, instructor_id, contacted_at)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Perfis são públicos para leitura"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem deletar seu próprio perfil"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Políticas para instructors
CREATE POLICY "Instrutores são públicos para leitura"
  ON public.instructors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Instrutores podem inserir seus próprios dados"
  ON public.instructors FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Instrutores podem atualizar seus próprios dados"
  ON public.instructors FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Instrutores podem deletar seus próprios dados"
  ON public.instructors FOR DELETE
  USING (auth.uid() = profile_id);

-- Políticas para connections
CREATE POLICY "Usuários podem ver suas próprias conexões"
  ON public.connections FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Usuários autenticados podem criar conexões"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instructors_updated_at
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente ao signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'Usuário'),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'user_type')::public.user_type, 'student')
  );
  RETURN new;
END;
$$;

-- Trigger para criar perfil ao signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices para melhor performance
CREATE INDEX idx_instructors_city ON public.instructors(city);
CREATE INDEX idx_instructors_state ON public.instructors(state);
CREATE INDEX idx_instructors_plan ON public.instructors(plan);
CREATE INDEX idx_instructors_rating ON public.instructors(rating DESC);
CREATE INDEX idx_connections_student ON public.connections(student_id);
CREATE INDEX idx_connections_instructor ON public.connections(instructor_id);