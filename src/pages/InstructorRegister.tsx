import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InstructorRegistrationForm from '@/components/InstructorRegistrationForm';

const InstructorRegister = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Back Link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para início
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Cadastre-se como Instrutor
              </h1>
              <p className="text-muted-foreground text-lg">
                Preencha seus dados para começar a dar aulas e conectar-se com alunos em sua região.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <InstructorRegistrationForm />
            </div>

            {/* Already have account */}
            <p className="text-center mt-6 text-muted-foreground">
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

export default InstructorRegister;
