import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AuthCallback] Processando callback de autenticação...');
      console.log('[AuthCallback] URL:', window.location.href);
      console.log('[AuthCallback] Hash:', window.location.hash);
      
      try {
        // O Supabase automaticamente processa o hash fragment da URL
        // Verificar se há um erro na URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('[AuthCallback] Erro na URL:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          toast.error('Erro na confirmação', {
            description: errorDescription || errorParam,
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Aguardar um momento para o Supabase processar o hash
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verificar a sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthCallback] Erro ao obter sessão:', sessionError);
          
          // Se for erro de token inválido, tentar limpar e redirecionar
          if (sessionError.message.includes('Invalid token') || 
              sessionError.message.includes('signing method') ||
              sessionError.message.includes('ES256')) {
            console.log('[AuthCallback] Erro de token, limpando sessão...');
            await supabase.auth.signOut();
            localStorage.clear();
            toast.error('Sessão inválida', {
              description: 'Por favor, faça login novamente.',
            });
            setTimeout(() => navigate('/cadastro-instrutor'), 2000);
            return;
          }
          
          throw sessionError;
        }

        if (session) {
          console.log('[AuthCallback] Sessão encontrada para:', session.user.email);
          
          // Verificar se o usuário é instrutor e precisa completar o cadastro
          const userType = session.user.user_metadata?.user_type;
          console.log('[AuthCallback] Tipo de usuário:', userType);

          // Verificar se já existe registro na tabela instructors
          if (userType === 'instructor') {
            const { data: instructor, error: instructorError } = await supabase
              .from('instructors')
              .select('id')
              .eq('profile_id', session.user.id)
              .maybeSingle();

            if (instructorError) {
              console.error('[AuthCallback] Erro ao verificar instrutor:', instructorError);
            }

            if (!instructor) {
              console.log('[AuthCallback] Instrutor sem registro completo, redirecionando para completar...');
              toast.info('Complete seu cadastro', {
                description: 'Seus dados de instrutor precisam ser completados.',
              });
              navigate('/cadastro-instrutor');
              return;
            }
          }

          toast.success('Email confirmado com sucesso!', {
            description: 'Bem-vindo ao BalizaCerta!',
          });
          navigate('/');
        } else {
          console.log('[AuthCallback] Nenhuma sessão encontrada após callback');
          toast.info('Faça login para continuar');
          navigate('/');
        }
      } catch (err) {
        console.error('[AuthCallback] Erro:', err);
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        toast.error('Erro ao processar confirmação', {
          description: message,
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Erro na Autenticação</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Processando...</h1>
        <p className="text-muted-foreground">Aguarde enquanto confirmamos seu email.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
