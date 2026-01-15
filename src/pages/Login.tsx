import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Lock, Car } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[Login] Erro de autenticação:', authError);
        
        if (authError.message.includes('Invalid login credentials')) {
          toast.error('Credenciais inválidas', {
            description: 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.',
          });
        } else if (authError.message.includes('Email not confirmed')) {
          toast.error('E-mail não confirmado', {
            description: 'Por favor, verifique sua caixa de entrada e confirme seu e-mail.',
          });
        } else {
          toast.error('Erro ao fazer login', {
            description: authError.message,
          });
        }
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao fazer login', {
          description: 'Não foi possível obter os dados do usuário.',
        });
        return;
      }

      // Verificar se o usuário é instrutor
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('[Login] Erro ao buscar perfil:', profileError);
        // Se não encontrou perfil, pode ser que ainda não foi criado
        toast.error('Perfil não encontrado', {
          description: 'Houve um problema ao carregar seu perfil. Tente novamente.',
        });
        await supabase.auth.signOut();
        return;
      }

      if (profile.user_type === 'student') {
        toast.error('Área exclusiva para instrutores', {
          description: 'Esta área é exclusiva para instrutores. Alunos podem acessar seus recursos na Home.',
        });
        await supabase.auth.signOut();
        return;
      }

      // É instrutor - redirecionar para o dashboard
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
    if (!email) {
      toast.error('Informe seu e-mail', {
        description: 'Digite seu e-mail para receber o link de redefinição de senha.',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        toast.error('Erro ao enviar e-mail', {
          description: error.message,
        });
        return;
      }

      toast.success('E-mail enviado!', {
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error) {
      console.error('[Login] Erro ao enviar reset:', error);
      toast.error('Erro inesperado ao enviar e-mail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              BalizaCerta
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Área do Instrutor - Faça login para acessar seu painel
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="email"
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="current-password"
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
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{' '}
              <Link
                to="/cadastro-instrutor"
                className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
