import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { StudentAgenda } from '@/components/student/StudentAgenda';
import { StudentInstructor } from '@/components/student/StudentInstructor';
import { StudentProgress } from '@/components/student/StudentProgress';
import { StudentSettings } from '@/components/student/StudentSettings';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ActiveModule = 'agenda' | 'instrutores' | 'evolucao' | 'configuracoes';

const AlunoDashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<ActiveModule>('agenda');
  const [studentData, setStudentData] = useState<{
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsCheckingAccess(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type, first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('[AlunoDashboard] Erro ao verificar acesso:', error);
          toast.error('Erro ao verificar permissões');
          navigate('/');
          return;
        }

        if (profile.user_type !== 'student') {
          toast.error('Acesso restrito a alunos');
          navigate('/');
          return;
        }

        setStudentData({
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
        });
      } catch (error) {
        console.error('[AlunoDashboard] Erro inesperado:', error);
        navigate('/');
      } finally {
        setIsCheckingAccess(false);
      }
    };

    if (!authLoading) {
      checkAccess();
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (authLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'agenda':
        return <StudentAgenda />;
      case 'instrutores':
        return <StudentInstructor />;
      case 'evolucao':
        return <StudentProgress />;
      case 'configuracoes':
        return <StudentSettings />;
      default:
        return <StudentAgenda />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StudentSidebar 
          activeModule={activeModule} 
          onModuleChange={setActiveModule}
          studentName={studentData?.first_name || 'Aluno'}
          avatarUrl={studentData?.avatar_url}
          onSignOut={handleSignOut}
        />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <img 
                src="/favicon.png" 
                alt="BalizaCerta" 
                className="h-8 w-8"
              />
              <span className="font-bold text-lg text-primary hidden sm:inline">
                BalizaCerta
              </span>
            </div>
            <div className="ml-auto text-sm text-muted-foreground">
              Olá, <span className="font-medium text-foreground">{studentData?.first_name || 'Aluno'}</span>!
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {renderModule()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AlunoDashboard;
