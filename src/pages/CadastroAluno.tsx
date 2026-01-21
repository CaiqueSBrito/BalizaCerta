import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StudentRegistrationForm from '@/components/StudentRegistrationForm';

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
                Crie sua conta e encontre o instrutor ideal para você
              </p>
            </div>

            {/* Registration Form */}
            <StudentRegistrationForm />

            {/* Login Link */}
            <p className="text-center mt-8 text-muted-foreground">
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

export default CadastroAluno;
