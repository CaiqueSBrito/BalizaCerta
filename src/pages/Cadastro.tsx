import { Link } from 'react-router-dom';
import { GraduationCap, Car, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Cadastro = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-12 md:pt-28 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para início
            </Link>

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Criar uma conta
              </h1>
              <p className="text-muted-foreground text-lg">
                Escolha como deseja usar o BalizaCerta
              </p>
            </div>

            {/* Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Student Card */}
              <Link 
                to="/cadastro-aluno" 
                className="group block"
              >
                <div className="h-full bg-card border-2 border-border rounded-2xl p-8 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex flex-col items-center text-center h-full">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <GraduationCap className="w-10 h-10 text-primary" />
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      Sou Aluno
                    </h2>
                    <p className="text-muted-foreground mb-6 flex-1">
                      Quero aprender a dirigir ou praticar para tirar minha CNH
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                      Continuar
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Instructor Card */}
              <Link 
                to="/cadastro-instrutor" 
                className="group block"
              >
                <div className="h-full bg-card border-2 border-accent/50 rounded-2xl p-8 transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/20 relative overflow-hidden">
                  {/* Highlight Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Ganhe dinheiro
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center h-full">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                      <Car className="w-10 h-10 text-accent" />
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      Sou Instrutor
                    </h2>
                    <p className="text-muted-foreground mb-6 flex-1">
                      Sou instrutor credenciado e quero atrair mais alunos
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-accent font-semibold group-hover:gap-3 transition-all">
                      Continuar
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Login Link */}
            <p className="text-center mt-10 text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cadastro;
