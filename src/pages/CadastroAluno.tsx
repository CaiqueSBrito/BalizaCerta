import { Link } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CadastroAluno = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-12 md:pt-28 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Back Link */}
            <Link 
              to="/cadastro" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Cadastro de Aluno
              </h1>
              <p className="text-muted-foreground text-lg">
                Em breve você poderá criar sua conta de aluno!
              </p>
            </div>

            {/* Coming Soon Card */}
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">
                Funcionalidade em Desenvolvimento
              </h2>
              
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Estamos trabalhando para trazer a melhor experiência para você. 
                Por enquanto, você pode buscar instrutores sem criar uma conta!
              </p>

              {/* Features Preview */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
                <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                  <Search className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Busca Rápida</p>
                    <p className="text-sm text-muted-foreground">Encontre instrutores na sua região</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Perto de Você</p>
                    <p className="text-sm text-muted-foreground">Instrutores da sua cidade</p>
                  </div>
                </div>
              </div>

              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/instrutores">
                  Buscar Instrutores Agora
                </Link>
              </Button>
            </div>

            {/* Alternative Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild variant="outline">
                <Link to="/">
                  Voltar para o início
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/cadastro-instrutor">
                  Sou instrutor, quero me cadastrar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CadastroAluno;
