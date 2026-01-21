import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Crown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { InstructorSidebar } from '@/components/instructor/InstructorSidebar';
import { InstructorAgenda } from '@/components/instructor/InstructorAgenda';
import { UpgradeBanner } from '@/components/UpgradeBanner';
import { WelcomeProModal } from '@/components/WelcomeProModal';
import { useInstructorPlan } from '@/hooks/useInstructorPlan';

type ActiveModule = 'agenda' | 'alunos' | 'evolucao' | 'configuracoes';

interface InstructorProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const Dashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<ActiveModule>('agenda');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showProWelcome, setShowProWelcome] = useState(false);
  
  // Real-time subscription to plan changes
  const { planData, isPro, isFree, isVerified, refetch: refetchPlan } = useInstructorPlan();

  // Check for payment success from Stripe redirect
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setShowProWelcome(true);
      toast.success('Parabéns! 🎉', {
        description: 'Seu pagamento foi processado. Bem-vindo ao Instrutor Pro!',
      });
      // Clear the URL params and refetch plan data
      window.history.replaceState({}, '', '/dashboard');
      refetchPlan();
    }
  }, [searchParams, refetchPlan]);

  // Show welcome modal for free plan users on first dashboard visit
  useEffect(() => {
    if (user && planData && isFree) {
      const hasSeenWelcome = localStorage.getItem(`welcome_modal_${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
        localStorage.setItem(`welcome_modal_${user.id}`, 'true');
      }
    }
  }, [user, planData, isFree]);

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

        // Buscar dados do instrutor para verificar se selecionou plano
        const { data: instructorInfo, error: instructorError } = await supabase
          .from('instructors')
          .select('plan_selected_at')
          .eq('profile_id', user.id)
          .single();

        if (instructorError) {
          console.error('[Dashboard] Erro ao buscar dados de instrutor:', instructorError);
        } else {
          // Se não selecionou plano, redireciona
          if (!instructorInfo.plan_selected_at) {
            navigate('/selecionar-plano', { replace: true });
            return;
          }
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
            plan={planData?.plan || 'free'}
            isVerified={isVerified}
            onSignOut={handleSignOut}
          />
          
          {/* Content area - Takes remaining width, has own scroll */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Dashboard sub-header */}
            <div className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center px-4 md:px-6 shrink-0">
              <SidebarTrigger className="mr-4" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Olá, <span className="font-medium text-foreground">{profile?.first_name || 'Instrutor'}</span>!
                {isPro && (
                  <span className="flex items-center gap-1 text-accent font-medium">
                    <Crown size={14} />
                    Pro
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
              {/* Pro Welcome Message */}
              {showProWelcome && (
                <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="text-accent" size={24} />
                    <div>
                      <p className="font-semibold text-foreground">Bem-vindo ao Plano Pro! 🎉</p>
                      <p className="text-sm text-muted-foreground">Agora você tem acesso a todos os recursos premium.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProWelcome(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* Upgrade Banner for Free Users */}
              {isFree && (
                <UpgradeBanner />
              )}
              
              {renderModule()}
            </div>
          </div>
        </SidebarProvider>
      </main>

      {/* Welcome Modal for First-time Free Users */}
      <WelcomeProModal
        open={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        instructorName={profile?.first_name || undefined}
      />

      {/* Footer - Always at bottom, z-index higher than sidebar */}
      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
