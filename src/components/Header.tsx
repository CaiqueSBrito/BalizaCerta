import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="font-medium">
              Entrar
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md">
              Criar Conta
            </Button>
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
              <a 
                href="#como-funciona" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
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
                <Button variant="ghost" className="justify-start font-medium">
                  Entrar
                </Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  Criar Conta
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
