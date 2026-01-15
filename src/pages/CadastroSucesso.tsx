import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CadastroSucesso = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cadastro realizado com sucesso!
            </h1>

            {/* Message */}
            <p className="text-lg text-muted-foreground mb-8">
              Sua credencial será analisada e seu perfil estará disponível em breve.
            </p>

            {/* Steps Card */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-foreground mb-4">Próximos passos:</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Confirme seu email</p>
                    <p className="text-sm text-muted-foreground">
                      Verifique sua caixa de entrada e clique no link de confirmação
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary/30 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Aguarde a verificação</p>
                    <p className="text-sm text-muted-foreground">
                      Nossa equipe irá analisar sua credencial DETRAN em até 48h
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Comece a receber alunos!</p>
                    <p className="text-sm text-muted-foreground">
                      Após aprovação, seu perfil ficará visível para todos os alunos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/">
                  Voltar para o início
                </Link>
              </Button>
              <Button asChild>
                <Link to="/instrutores">
                  Ver instrutores
                  <ArrowRight className="ml-2 h-4 w-4" />
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

export default CadastroSucesso;
