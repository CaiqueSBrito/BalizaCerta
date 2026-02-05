import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CreditCard, Calendar, MessageCircle } from "lucide-react";

const Reembolso = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Política de Cancelamento e Reembolso
        </h1>
        <p className="text-muted-foreground mb-8">
          Última atualização: 5 de fevereiro de 2026
        </p>
        
        <Separator className="mb-8" />

        {/* Quick Summary Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Assinatura Pro</h3>
                  <p className="text-sm text-muted-foreground">
                    Cancele a qualquer momento. Acesso mantido até o fim do período pago.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Agendamentos</h3>
                  <p className="text-sm text-muted-foreground">
                    Cancelamento grátis com 24h de antecedência.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Cancelamento da Assinatura Pro</h2>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">1.1 Como Cancelar</h3>
            <p className="text-muted-foreground leading-relaxed">
              Você pode cancelar sua assinatura Pro a qualquer momento através do seu painel de configurações 
              ou diretamente no portal de pagamentos do Stripe. O processo é simples e não requer contato 
              com suporte.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">1.2 Efeitos do Cancelamento</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Acesso mantido:</strong> Você continuará com acesso às 
                funcionalidades Pro até o final do período já pago.
              </li>
              <li>
                <strong className="text-foreground">Sem cobranças futuras:</strong> Nenhuma cobrança adicional 
                será realizada após o cancelamento.
              </li>
              <li>
                <strong className="text-foreground">Dados preservados:</strong> Seu perfil e histórico 
                permanecerão na plataforma, apenas com funcionalidades do plano gratuito.
              </li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">1.3 Reembolso da Assinatura</h3>
            <div className="bg-muted/50 border border-border rounded-lg p-6 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Política padrão:</strong> Não oferecemos reembolso 
                    proporcional para períodos não utilizados após o cancelamento.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    <strong className="text-foreground">Exceções:</strong> Reembolso integral pode ser 
                    solicitado em até <strong className="text-foreground">7 dias</strong> após a primeira 
                    cobrança, caso você nunca tenha utilizado as funcionalidades Pro.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Cancelamento de Agendamentos</h2>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.1 Política de Cancelamento</h3>
            <p className="text-muted-foreground leading-relaxed">
              Os agendamentos de aulas entre alunos e instrutores podem ser cancelados nas seguintes condições:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-2">✅ Cancelamento Gratuito</h4>
                  <p className="text-sm text-muted-foreground">
                    Até <strong className="text-foreground">24 horas</strong> antes do horário agendado, 
                    sem nenhuma penalidade para ambas as partes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-2">⚠️ Cancelamento Tardio</h4>
                  <p className="text-sm text-muted-foreground">
                    Menos de 24 horas: Sujeito às políticas individuais de cada instrutor, 
                    podendo haver cobrança parcial.
                  </p>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.2 Não Comparecimento (No-Show)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Em caso de não comparecimento sem aviso prévio:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong className="text-foreground">Aluno:</strong> Pode ser cobrado o valor integral da aula, conforme política do instrutor.</li>
              <li><strong className="text-foreground">Instrutor:</strong> O aluno pode solicitar reagendamento gratuito ou reembolso integral.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Disputas e Mediação</h2>
            <p className="text-muted-foreground leading-relaxed">
              Caso haja divergência entre aluno e instrutor sobre cancelamentos ou qualidade do serviço:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Primeiro, tente resolver diretamente com a outra parte</li>
              <li>Se não houver acordo, entre em contato com nosso suporte</li>
              <li>Nossa equipe analisará o caso em até 5 dias úteis</li>
              <li>Decisões serão baseadas nos termos de uso e evidências apresentadas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Processamento de Reembolsos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Quando um reembolso é aprovado:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>
                <strong className="text-foreground">Prazo:</strong> O valor será estornado em até 
                <strong className="text-foreground"> 10 dias úteis</strong> para o mesmo método de pagamento original.
              </li>
              <li>
                <strong className="text-foreground">Cartão de crédito:</strong> O prazo pode variar conforme 
                a política da operadora do cartão.
              </li>
              <li>
                <strong className="text-foreground">Confirmação:</strong> Você receberá um e-mail de 
                confirmação quando o reembolso for processado.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Como Solicitar Reembolso</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para solicitar um reembolso, siga estes passos:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Acesse sua conta no BalizaCerta</li>
              <li>Vá para Configurações → Assinatura</li>
              <li>Clique em "Solicitar Reembolso" ou entre em contato pelo suporte</li>
              <li>Descreva o motivo da solicitação</li>
              <li>Aguarde nossa análise e resposta</li>
            </ol>

            <div className="bg-muted/50 border border-border rounded-lg p-6 mt-6">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Precisa de ajuda?</p>
                  <p className="text-muted-foreground mt-1">
                    Entre em contato com nosso suporte:
                    <a href="mailto:suporte@balizacerta.com.br" className="text-primary hover:underline ml-1">
                      suporte@balizacerta.com.br
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar esta política de cancelamento e reembolso. Alterações 
              significativas serão comunicadas com antecedência de 30 dias. As novas regras aplicam-se 
              apenas a assinaturas e agendamentos realizados após a data de vigência.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reembolso;
