import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { InstructorSidebar } from '@/components/instructor/InstructorSidebar';
import { InstructorAgenda } from '@/components/instructor/InstructorAgenda';

type ActiveModule = 'agenda' | 'alunos' | 'evolucao' | 'configuracoes';

interface InstructorProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface InstructorData {
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  plan: 'free' | 'pro';
}

const Dashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<ActiveModule>('agenda');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Buscar perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, user_type')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('[Dashboard] Erro ao buscar perfil:', profileError);
          toast.error('Erro ao carregar perfil');
          return;
        }

        // Verificar se é instrutor
        if (profileData.user_type !== 'instructor') {
          toast.error('Acesso restrito a instrutores');
          navigate('/');
          return;
        }

        setProfile(profileData);

        // Buscar dados do instrutor
        const { data: instructorInfo, error: instructorError } = await supabase
          .from('instructors')
          .select('rating, review_count, is_verified, plan')
          .eq('profile_id', user.id)
          .single();

        if (instructorError) {
          console.error('[Dashboard] Erro ao buscar dados de instrutor:', instructorError);
        } else {
          setInstructorData(instructorInfo as InstructorData);
        }
      } catch (error) {
        console.error('[Dashboard] Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'agenda':
        return <InstructorAgenda />;
      case 'alunos':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Meus Alunos</h2>
            <p className="text-muted-foreground">Em breve: lista de alunos conectados.</p>
          </div>
        );
      case 'evolucao':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Evolução Fácil</h2>
            <p className="text-muted-foreground">Em breve: checklist de progresso pedagógico.</p>
          </div>
        );
      case 'configuracoes':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Configurações</h2>
            <p className="text-muted-foreground">Em breve: configurações do perfil e conta.</p>
          </div>
        );
      default:
        return <InstructorAgenda />;
    }
  };

  if (authLoading || isLoading) {
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Fixed at top */}
      <Header />
      
      {/* Main Body - Flex container that grows to fill space between header and footer */}
      <main className="flex-1 flex overflow-hidden pt-16 md:pt-20">
        <SidebarProvider>
          {/* Sidebar - Height constrained to parent, no fixed/absolute */}
          <InstructorSidebar 
            activeModule={activeModule} 
            onModuleChange={setActiveModule}
            instructorName={profile?.first_name || 'Instrutor'}
            avatarUrl={profile?.avatar_url || null}
            plan={instructorData?.plan || 'free'}
            isVerified={instructorData?.is_verified || false}
            onSignOut={handleSignOut}
          />
          
          {/* Content area - Takes remaining width, has own scroll */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Dashboard sub-header */}
            <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 shrink-0">
              <SidebarTrigger className="mr-4" />
              <div className="text-sm text-muted-foreground">
                Olá, <span className="font-medium text-foreground">{profile?.first_name || 'Instrutor'}</span>!
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

export default Dashboard;
