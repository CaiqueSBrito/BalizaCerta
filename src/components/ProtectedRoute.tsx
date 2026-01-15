import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'instructor' | 'student';
}

const ProtectedRoute = ({ children, requiredUserType }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const [userType, setUserType] = useState<string | null>(null);
  const [isCheckingType, setIsCheckingType] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      if (!user) {
        setIsCheckingType(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('[ProtectedRoute] Erro ao buscar tipo de usuário:', error);
          setUserType(null);
        } else {
          setUserType(profile.user_type);
        }
      } catch (error) {
        console.error('[ProtectedRoute] Erro inesperado:', error);
        setUserType(null);
      } finally {
        setIsCheckingType(false);
      }
    };

    if (!authLoading) {
      checkUserType();
    }
  }, [user, authLoading]);

  // Ainda carregando autenticação
  if (authLoading || isCheckingType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não está autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar tipo de usuário se necessário
  if (requiredUserType && userType !== requiredUserType) {
    if (requiredUserType === 'instructor' && userType === 'student') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-foreground">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Esta área é exclusiva para instrutores. Alunos podem acessar seus recursos na Home.
            </p>
            <a href="/" className="text-primary hover:underline">
              Voltar para Home
            </a>
          </div>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
