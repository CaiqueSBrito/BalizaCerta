import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Home, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Buscar tipo de usuário quando logado
  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) {
        setUserType(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .maybeSingle();

      setUserType(profile?.user_type || null);
    };

    fetchUserType();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (userType === 'instructor') return '/dashboard';
    if (userType === 'student') return '/aluno-dashboard';
    return '/';
  };

  const getDashboardLabel = () => {
    if (userType === 'instructor') return 'Painel do Instrutor';
    if (userType === 'student') return 'Painel do Aluno';
    return 'Meu Painel';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Baliza<span className="text-accent">Certa</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`flex items-center gap-1.5 transition-colors font-medium ${
                isActive('/') 
                  ? 'text-accent' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home size={18} />
              Início
            </Link>
            <a 
              href="#como-funciona" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Como Funciona
            </a>
            <Link 
              to="/planos-instrutor" 
              className={`transition-colors font-medium ${
                isActive('/planos-instrutor') 
                  ? 'text-accent' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Para Instrutores
            </Link>
          </nav>

          {/* Desktop CTA - Dinâmico baseado em autenticação */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-md" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="default" 
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md gap-2"
                  >
                    <User size={18} />
                    Meu Painel
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardPath()} className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard size={16} />
                      {getDashboardLabel()}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut size={16} />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" className="font-medium" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md" asChild>
                  <Link to="/cadastro">Criar Conta</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/" 
                className={`flex items-center gap-1.5 transition-colors font-medium py-2 ${
                  isActive('/') 
                    ? 'text-accent' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} />
                Início
              </Link>
              <a 
                href="#como-funciona" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Como Funciona
              </a>
              <Link 
                to="/planos-instrutor" 
                className={`transition-colors font-medium py-2 ${
                  isActive('/planos-instrutor') 
                    ? 'text-accent' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Para Instrutores
              </Link>
              
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {isLoading ? (
                  <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
                ) : user ? (
                  <>
                    <Button 
                      className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold justify-start gap-2" 
                      asChild
                    >
                      <Link to={getDashboardPath()} onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard size={18} />
                        {getDashboardLabel()}
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start font-medium gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start font-medium" asChild>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                    </Button>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" asChild>
                      <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>Criar Conta</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
