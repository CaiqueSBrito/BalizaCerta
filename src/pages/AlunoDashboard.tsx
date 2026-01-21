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
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-16 md:pt-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Carregando seu painel...</p>
          </div>
        </main>
        <Footer />
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Fixed at top */}
      <Header />
      
      {/* Main Body - Flex container that grows to fill space between header and footer */}
      <main className="flex-1 flex overflow-hidden pt-16 md:pt-20">
        <SidebarProvider>
          {/* Sidebar - Height constrained to parent, no fixed/absolute */}
          <StudentSidebar 
            activeModule={activeModule} 
            onModuleChange={setActiveModule}
            studentName={studentData?.first_name || 'Aluno'}
            avatarUrl={studentData?.avatar_url}
            onSignOut={handleSignOut}
          />
          
          {/* Content area - Takes remaining width, has own scroll */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Dashboard sub-header */}
            <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 shrink-0">
              <SidebarTrigger className="mr-4" />
              <div className="text-sm text-muted-foreground">
                Olá, <span className="font-medium text-foreground">{studentData?.first_name || 'Aluno'}</span>!
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {renderModule()}
            </div>
          </div>
        </SidebarProvider>
      </main>

      {/* Footer - Always at bottom, z-index higher than sidebar */}
      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
};

export default AlunoDashboard;
