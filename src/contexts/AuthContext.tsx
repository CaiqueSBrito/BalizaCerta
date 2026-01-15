import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthProvider] Inicializando...');

    // Configurar listener de mudança de estado de autenticação PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[AuthProvider] Auth state changed:', event);
        
        // Atualização síncrona do estado
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        // Tratar eventos específicos com setTimeout para evitar deadlock
        if (event === 'SIGNED_IN') {
          console.log('[AuthProvider] Usuário logado:', currentSession?.user?.email);
          setTimeout(() => {
            toast.success('Login realizado com sucesso!');
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('[AuthProvider] Usuário deslogado');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[AuthProvider] Token atualizado');
        } else if (event === 'USER_UPDATED') {
          console.log('[AuthProvider] Usuário atualizado');
        }
      }
    );

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session: existingSession }, error }) => {
      if (error) {
        console.error('[AuthProvider] Erro ao obter sessão:', error);
        
        // Se o erro for de token inválido, limpar a sessão local
        if (error.message.includes('Invalid token') || 
            error.message.includes('signing method') ||
            error.message.includes('ES256')) {
          console.log('[AuthProvider] Token inválido detectado, limpando sessão...');
          supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
        }
      } else {
        console.log('[AuthProvider] Sessão existente:', existingSession?.user?.email ?? 'nenhuma');
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('[AuthProvider] Executando signOut...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AuthProvider] Erro ao fazer logout:', error);
      toast.error('Erro ao sair');
    } else {
      setUser(null);
      setSession(null);
      toast.success('Logout realizado com sucesso');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
