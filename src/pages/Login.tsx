import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, Car, GraduationCap } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { mapErrorToUserMessage } from '@/lib/sanitize';

type UserTab = 'student' | 'instructor';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState<UserTab>('student');

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        setIsCheckingSession(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile?.user_type === 'instructor') {
        navigate('/dashboard', { replace: true });
      } else if (profile?.user_type === 'student') {
        navigate('/aluno-dashboard', { replace: true });
      } else {
        setIsCheckingSession(false);
      }
    };

    redirectIfLoggedIn();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('E-mail inválido', {
        description: 'Por favor, insira um e-mail válido.',
      });
      return;
    }

    if (trimmedEmail.length > 255) {
      toast.error('E-mail muito longo');
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (authError) {
        toast.error(mapErrorToUserMessage(authError));
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao fazer login', {
          description: 'Não foi possível obter os dados do usuário.',
        });
        return;
      }

      const userId = authData.user.id;

      const { data: existingProfile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .maybeSingle();

      if (profileFetchError) {
        console.error('[Login] Erro ao carregar perfil:', profileFetchError);
        toast.error(mapErrorToUserMessage(profileFetchError));
        await supabase.auth.signOut();
        return;
      }

      let userType = existingProfile?.user_type;

      if (!existingProfile) {
        const meta = authData.user.user_metadata ?? {};
        const firstName = typeof meta.first_name === 'string' ? meta.first_name.slice(0, 50) : '';
        const lastName = typeof meta.last_name === 'string' ? meta.last_name.slice(0, 50) : '';
        const fullName = `${firstName} ${lastName}`.trim().slice(0, 100) || authData.user.email?.slice(0, 100) || 'Usuário';

        const metaUserType = meta.user_type === 'instructor' ? 'instructor' : 'student';

        const { error: createProfileError } = await supabase.from('profiles').insert({
          id: userId,
          email: (authData.user.email || trimmedEmail).slice(0, 255),
          full_name: fullName,
          first_name: firstName || null,
          last_name: lastName || null,
          user_type: metaUserType,
          whatsapp: typeof meta.whatsapp === 'string' ? meta.whatsapp.replace(/[^\d]/g, '').slice(0, 11) : null,
          age: typeof meta.age === 'number' ? Math.max(18, Math.min(meta.age, 100)) : null,
        });

        if (createProfileError) {
          console.error('[Login] Erro ao criar perfil:', createProfileError);
          toast.error(mapErrorToUserMessage(createProfileError));
          await supabase.auth.signOut();
          return;
        }

        userType = metaUserType;
      }

      // Validar tipo de usuário vs aba selecionada
      if (activeTab === 'student' && userType === 'instructor') {
        toast.warning('Parece que você é um instrutor', {
          description: 'Por favor, use a aba "Sou Instrutor" ao lado.',
        });
        await supabase.auth.signOut();
        setActiveTab('instructor');
        return;
      }

      if (activeTab === 'instructor' && userType === 'student') {
        toast.warning('Parece que você é um aluno', {
          description: 'Por favor, use a aba "Sou Aluno" ao lado.',
        });
        await supabase.auth.signOut();
        setActiveTab('student');
        return;
      }

      // Redirecionar baseado no tipo de usuário
      if (userType === 'student') {
        toast.success('Login realizado com sucesso!', {
          description: 'Bem-vindo de volta, futuro motorista!',
        });
        navigate('/aluno-dashboard');
        return;
      }

      // Instrutor - verificar se tem cadastro completo
      const { data: instructorRow, error: instructorError } = await supabase
        .from('instructors')
        .select('id')
        .eq('profile_id', userId)
        .maybeSingle();

      if (instructorError) {
        console.error('[Login] Erro ao carregar instrutor:', instructorError);
        toast.error(mapErrorToUserMessage(instructorError));
        return;
      }

      if (!instructorRow) {
        toast.info('Complete seu cadastro', {
          description: 'Encontramos sua conta, mas faltam dados do instrutor. Complete o cadastro para continuar.',
        });
        navigate('/cadastro-instrutor');
        return;
      }

      toast.success('Login realizado com sucesso!', {
        description: 'Bem-vindo de volta!',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('[Login] Erro inesperado:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao processar o login. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      toast.error('Informe seu e-mail', {
        description: 'Digite seu e-mail para receber o link de redefinição de senha.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('E-mail inválido');
      return;
    }

    setIsLoading(true);
    
    try {
      const productionUrl = 'https://balizacerta.lovable.app';
      
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${productionUrl}/auth/callback?type=recovery`,
      });

      if (error) {
        console.error('[Login] Erro ao enviar reset:', error);
        toast.success('Se este e-mail estiver cadastrado, você receberá um link de redefinição.');
        return;
      }

      toast.success('E-mail enviado!', {
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error) {
      console.error('[Login] Erro ao enviar reset:', error);
      toast.error('Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-16 md:pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const isStudent = activeTab === 'student';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      
      <main className="flex-1 flex items-center justify-center pt-24 md:pt-28 pb-12 px-4">
        <Card className="w-full max-w-md shadow-xl border-primary/10">
          <CardHeader className="text-center space-y-4 pb-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UserTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
                <TabsTrigger 
                  value="student" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  <GraduationCap className="w-4 h-4" />
                  Sou Aluno
                </TabsTrigger>
                <TabsTrigger 
                  value="instructor" 
                  className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Car className="w-4 h-4" />
                  Sou Instrutor
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              isStudent ? 'bg-secondary/20' : 'bg-primary/10'
            }`}>
              {isStudent ? (
                <GraduationCap className="w-8 h-8 text-secondary" />
              ) : (
                <Car className="w-8 h-8 text-primary" />
              )}
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {isStudent ? 'Área do Aluno' : 'Área do Instrutor'}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {isStudent 
                  ? 'Bem-vindo de volta, futuro motorista!' 
                  : 'Faça login para acessar seu painel'
                }
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.slice(0, 255))}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="email"
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value.slice(0, 128))}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="current-password"
                    maxLength={128}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                disabled={isLoading}
              >
                Esqueci minha senha
              </button>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className={`w-full transition-colors ${
                  isStudent 
                    ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  isStudent ? 'Entrar como Aluno' : 'Entrar como Instrutor'
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Não tem uma conta?{' '}
                <Link
                  to={isStudent ? '/cadastro-aluno' : '/cadastro-instrutor'}
                  className={`font-medium transition-colors hover:underline ${
                    isStudent ? 'text-secondary hover:text-secondary/80' : 'text-primary hover:text-primary/80'
                  }`}
                >
                  {isStudent ? 'Cadastre-se como aluno' : 'Cadastre-se como instrutor'}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
