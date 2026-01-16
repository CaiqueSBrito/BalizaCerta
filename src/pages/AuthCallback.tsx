import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { mapErrorToUserMessage, sanitizeName, sanitizeWhatsApp, sanitizeAge } from '@/lib/sanitize';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processando confirmação...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AuthCallback] Processando callback de autenticação...');
      console.log('[AuthCallback] URL:', window.location.href);
      console.log('[AuthCallback] Hash:', window.location.hash);
      
      try {
        // Verificar se há um erro na URL (NÃO expor detalhes técnicos)
        const errorParam = searchParams.get('error');
        const errorCode = searchParams.get('error_code');
        
        if (errorParam || errorCode) {
          console.error('[AuthCallback] Erro na URL:', errorParam, errorCode);
          setError('Erro na confirmação do email');
          toast.error('Erro na confirmação', {
            description: 'Não foi possível confirmar seu email. Tente novamente.',
          });
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        setStatus('Verificando sessão...');
        
        // Aguardar um momento para o Supabase processar o hash
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verificar a sessão
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[AuthCallback] Erro ao obter sessão:', sessionError);
          
          if (sessionError.message.includes('Invalid token') || 
              sessionError.message.includes('signing method') ||
              sessionError.message.includes('ES256')) {
            console.log('[AuthCallback] Erro de token, limpando sessão...');
            await supabase.auth.signOut();
            localStorage.clear();
            toast.error('Sessão inválida', {
              description: 'Por favor, faça login novamente.',
            });
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
          
          throw sessionError;
        }

        if (!session) {
          console.log('[AuthCallback] Nenhuma sessão encontrada após callback');
          toast.info('Faça login para continuar');
          navigate('/login');
          return;
        }

        console.log('[AuthCallback] Sessão encontrada para:', session.user.email);
        setStatus('Verificando perfil...');
        
        const userId = session.user.id;
        const userType = session.user.user_metadata?.user_type;
        console.log('[AuthCallback] Tipo de usuário:', userType);

        // Verificar/criar perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('[AuthCallback] Erro ao verificar perfil:', profileError);
        }

        // Se não existe perfil, criar um baseado nos metadados (sanitizados)
        if (!profile) {
          console.log('[AuthCallback] Criando perfil para o usuário...');
          const metadata = session.user.user_metadata;
          
          // Sanitizar todos os dados de metadados
          const firstName = sanitizeName(metadata?.first_name || '');
          const lastName = sanitizeName(metadata?.last_name || '');
          const fullName = `${firstName} ${lastName}`.trim().slice(0, 100) || session.user.email?.slice(0, 100) || '';
          const whatsapp = metadata?.whatsapp ? sanitizeWhatsApp(String(metadata.whatsapp)) : null;
          const age = metadata?.age ? sanitizeAge(metadata.age) : null;
          
          const { error: insertProfileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: (session.user.email || '').slice(0, 255),
              full_name: fullName,
              first_name: firstName || null,
              last_name: lastName || null,
              user_type: metadata?.user_type === 'instructor' ? 'instructor' : 'student',
              whatsapp: whatsapp,
              age: age,
            });

          if (insertProfileError) {
            console.error('[AuthCallback] Erro ao criar perfil:', insertProfileError);
          }
        }

        const effectiveUserType = profile?.user_type || userType;

        // Se é instrutor, verificar se tem registro na tabela instructors
        if (effectiveUserType === 'instructor') {
          setStatus('Verificando dados de instrutor...');
          
          const { data: instructor, error: instructorError } = await supabase
            .from('instructors')
            .select('id')
            .eq('profile_id', userId)
            .maybeSingle();

          if (instructorError) {
            console.error('[AuthCallback] Erro ao verificar instrutor:', instructorError);
          }

          if (!instructor) {
            console.log('[AuthCallback] Instrutor sem registro completo, redirecionando...');
            toast.success('Email confirmado!', {
              description: 'Agora complete seu cadastro de instrutor.',
            });
            // Passa um parâmetro para indicar que é completar cadastro
            navigate('/cadastro-instrutor?complete=true');
            return;
          }

          // Instrutor com registro completo
          toast.success('Email confirmado com sucesso!', {
            description: 'Bem-vindo ao BalizaCerta!',
          });
          navigate('/dashboard');
          return;
        }

        // Usuário comum (aluno)
        toast.success('Email confirmado com sucesso!', {
          description: 'Bem-vindo ao BalizaCerta!',
        });
        navigate('/');
        
      } catch (err) {
        console.error('[AuthCallback] Erro:', err);
        // NUNCA expor mensagens de erro técnicas
        setError('Erro ao processar confirmação');
        toast.error('Erro ao processar confirmação', {
          description: 'Por favor, tente fazer login novamente.',
        });
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center p-8 max-w-md">
            <div className="text-destructive text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Erro na Autenticação</h1>
            <p className="text-muted-foreground mb-4">Não foi possível processar sua solicitação.</p>
            <p className="text-sm text-muted-foreground">Redirecionando para login...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">{status}</h1>
          <p className="text-muted-foreground">Aguarde enquanto confirmamos seu email.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthCallback;
