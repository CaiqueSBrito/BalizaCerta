import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, 
  User, 
  Calendar, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Settings,
  Car
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface InstructorProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface InstructorData {
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  plan: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Buscar perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('[Dashboard] Erro ao buscar perfil:', profileError);
        } else {
          setProfile(profileData);
        }

        // Buscar dados do instrutor
        const { data: instructorInfo, error: instructorError } = await supabase
          .from('instructors')
          .select('rating, review_count, is_verified, plan')
          .eq('profile_id', user.id)
          .single();

        if (instructorError) {
          console.error('[Dashboard] Erro ao buscar dados de instrutor:', instructorError);
        } else {
          setInstructorData(instructorInfo);
        }
      } catch (error) {
        console.error('[Dashboard] Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.first_name 
    ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ''}`
    : user?.email;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">BalizaCerta</h1>
              <p className="text-xs text-muted-foreground">Painel do Instrutor</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Olá, {displayName}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Bem-vindo de volta, {profile?.first_name || 'Instrutor'}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie suas aulas, perfil e acompanhe suas estatísticas.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avaliação
              </CardTitle>
              <Star className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {instructorData?.rating?.toFixed(1) || '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {instructorData?.review_count || 0} avaliações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
              <User className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {instructorData?.is_verified ? 'Verificado' : 'Pendente'}
              </div>
              <p className="text-xs text-muted-foreground">
                Plano {instructorData?.plan === 'pro' ? 'Pro' : 'Gratuito'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mensagens
              </CardTitle>
              <MessageSquare className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">
                Contatos recentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aulas
              </CardTitle>
              <Calendar className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Meu Perfil</CardTitle>
                  <CardDescription>Edite suas informações</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Upgrade para Pro</CardTitle>
                  <CardDescription>Destaque seu perfil</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Configurações</CardTitle>
                  <CardDescription>Gerencie sua conta</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
