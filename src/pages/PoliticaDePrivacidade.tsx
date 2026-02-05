import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const PoliticaDePrivacidade = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Política de Privacidade
        </h1>
        <p className="text-muted-foreground mb-8">
          Última atualização: 5 de fevereiro de 2026
        </p>
        
        <Separator className="mb-8" />

        <div className="prose prose-lg max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              O <strong className="text-foreground">BalizaCerta</strong> está comprometido com a proteção da sua privacidade. 
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações 
              pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Dados que Coletamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para o funcionamento adequado da plataforma, coletamos os seguintes dados:
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.1 Dados de Identificação</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Nome completo:</strong> Para identificação no perfil e comunicação</li>
              <li><strong className="text-foreground">E-mail:</strong> Para login, comunicações e recuperação de conta</li>
              <li><strong className="text-foreground">CPF:</strong> Para verificação de identidade dos instrutores</li>
              <li><strong className="text-foreground">Foto de perfil:</strong> Para identificação visual na plataforma</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.2 Dados de Contato</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">WhatsApp:</strong> Para comunicação direta entre alunos e instrutores</li>
              <li><strong className="text-foreground">Telefone:</strong> Para contato em casos necessários</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.3 Dados de Localização</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Cidade e Estado:</strong> Para conectar alunos a instrutores próximos</li>
              <li><strong className="text-foreground">Região de atendimento:</strong> Para filtros de busca na plataforma</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.4 Dados Profissionais (Instrutores)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Categoria da CNH e anos de experiência</li>
              <li>Certificado DETRAN</li>
              <li>Especialidades e áreas de atuação</li>
              <li>Disponibilidade de horários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Dados de Pagamento</h2>
            <div className="bg-muted/50 border border-border rounded-lg p-6 mt-4">
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">🔒 Importante:</strong> Os dados de pagamento (número do cartão de crédito, 
                CVV, data de validade) são processados <strong className="text-foreground">exclusivamente pelo Stripe</strong>, 
                nossa plataforma de pagamentos certificada PCI-DSS.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong className="text-foreground">Nenhum dado de cartão é armazenado em nossos servidores.</strong> Apenas 
                mantemos um identificador de cliente do Stripe para gerenciar assinaturas e histórico de transações.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Finalidade do Tratamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos seus dados pessoais para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Criar e gerenciar sua conta na plataforma</li>
              <li>Conectar alunos a instrutores compatíveis</li>
              <li>Processar agendamentos e comunicações entre usuários</li>
              <li>Processar pagamentos de assinaturas</li>
              <li>Enviar notificações sobre aulas e atualizações da plataforma</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Base Legal (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed">
              O tratamento dos seus dados é realizado com base nas seguintes hipóteses legais:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong className="text-foreground">Execução de contrato:</strong> Para prestação dos serviços contratados</li>
              <li><strong className="text-foreground">Consentimento:</strong> Quando você autoriza expressamente</li>
              <li><strong className="text-foreground">Legítimo interesse:</strong> Para melhorias na plataforma e comunicações relevantes</li>
              <li><strong className="text-foreground">Cumprimento de obrigação legal:</strong> Quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados podem ser compartilhados com:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong className="text-foreground">Outros usuários:</strong> Informações do perfil público para conexão entre alunos e instrutores</li>
              <li><strong className="text-foreground">Stripe:</strong> Para processamento de pagamentos</li>
              <li><strong className="text-foreground">Supabase:</strong> Nosso provedor de infraestrutura de dados</li>
              <li><strong className="text-foreground">Autoridades:</strong> Quando exigido por ordem judicial ou lei</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong className="text-foreground">Não vendemos seus dados pessoais a terceiros.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed">
              De acordo com a LGPD, você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong className="text-foreground">Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
              <li><strong className="text-foreground">Correção:</strong> Corrigir dados incompletos ou desatualizados</li>
              <li><strong className="text-foreground">Anonimização ou eliminação:</strong> Solicitar exclusão de dados desnecessários</li>
              <li><strong className="text-foreground">Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong className="text-foreground">Revogação do consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
              <li><strong className="text-foreground">Oposição:</strong> Se opor a tratamentos baseados em legítimo interesse</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para exercer seus direitos, entre em contato pelo e-mail: 
              <a href="mailto:privacidade@balizacerta.com.br" className="text-primary hover:underline ml-1">
                privacidade@balizacerta.com.br
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Criptografia em trânsito (HTTPS/TLS)</li>
              <li>Controle de acesso baseado em funções (RLS)</li>
              <li>Autenticação segura com tokens</li>
              <li>Monitoramento e logs de segurança</li>
              <li>Backups regulares e redundância de dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Fornecer nossos serviços</li>
              <li>Cumprir obrigações legais</li>
              <li>Resolver disputas</li>
              <li>Fazer cumprir nossos acordos</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Após exclusão da conta, seus dados serão anonimizados ou eliminados em até 90 dias, 
              exceto quando houver obrigação legal de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies essenciais para o funcionamento da plataforma, incluindo:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Cookies de sessão para manter você logado</li>
              <li>Cookies de preferências para lembrar suas configurações</li>
              <li>Cookies de análise para entender como você usa a plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">11. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
              alterações significativas por e-mail ou aviso na plataforma. Recomendamos revisar 
              esta página regularmente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">12. Contato do Encarregado (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões relacionadas à privacidade e proteção de dados, contate nosso Encarregado 
              de Proteção de Dados:
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-6 mt-4">
              <p className="text-muted-foreground">
                <strong className="text-foreground">E-mail:</strong>{" "}
                <a href="mailto:dpo@balizacerta.com.br" className="text-primary hover:underline">
                  dpo@balizacerta.com.br
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PoliticaDePrivacidade;
