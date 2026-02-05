import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Termos de Uso
        </h1>
        <p className="text-muted-foreground mb-8">
          Última atualização: 5 de fevereiro de 2026
        </p>
        
        <Separator className="mb-8" />

        <div className="prose prose-lg max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Sobre a Plataforma</h2>
            <p className="text-muted-foreground leading-relaxed">
              O <strong className="text-foreground">BalizaCerta</strong> é uma plataforma de tecnologia que tem como único objetivo 
              conectar alunos em busca de aulas práticas de direção a instrutores independentes qualificados. 
              Não somos uma autoescola, centro de formação de condutores (CFC) ou prestadores diretos de 
              serviços de instrução veicular.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Atuamos exclusivamente como intermediários tecnológicos, fornecendo ferramentas digitais para 
              que instrutores e alunos possam se encontrar, agendar e gerenciar suas aulas de forma prática e eficiente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Isenção de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao utilizar o BalizaCerta, você reconhece e concorda que:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>
                <strong className="text-foreground">Condução do veículo:</strong> A responsabilidade pela condução segura do veículo 
                durante as aulas práticas é inteiramente do instrutor e do aluno.
              </li>
              <li>
                <strong className="text-foreground">Segurança:</strong> O BalizaCerta não se responsabiliza por acidentes, danos materiais, 
                lesões corporais ou qualquer outro incidente que possa ocorrer durante ou em decorrência das aulas.
              </li>
              <li>
                <strong className="text-foreground">Documentação:</strong> É responsabilidade exclusiva do instrutor manter válidos todos 
                os documentos necessários, incluindo CNH com categoria apropriada, certificado DETRAN e documentação do veículo.
              </li>
              <li>
                <strong className="text-foreground">Qualidade do serviço:</strong> Não garantimos a qualidade, pontualidade ou resultados 
                das aulas ministradas pelos instrutores cadastrados na plataforma.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Assinatura Pro e Pagamentos</h2>
            <p className="text-muted-foreground leading-relaxed">
              O plano de assinatura <strong className="text-foreground">Pro</strong> oferecido aos instrutores refere-se 
              exclusivamente ao acesso a funcionalidades premium da plataforma, tais como:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Destaque no perfil e prioridade nos resultados de busca</li>
              <li>Contatos ilimitados com alunos</li>
              <li>Ferramentas avançadas de gestão de agenda</li>
              <li>Relatórios e métricas de desempenho</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong className="text-foreground">Importante:</strong> A assinatura Pro não garante um número mínimo de alunos, 
              aulas agendadas ou qualquer retorno financeiro específico. O sucesso na plataforma depende de diversos 
              fatores, incluindo a qualidade do perfil, disponibilidade, localização e avaliações recebidas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar a plataforma, você deve:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Ter pelo menos 18 anos de idade</li>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Notificar imediatamente sobre qualquer uso não autorizado da sua conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Conduta do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed">
              É expressamente proibido:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Fornecer informações falsas ou enganosas</li>
              <li>Utilizar a plataforma para fins ilegais</li>
              <li>Assediar, ameaçar ou prejudicar outros usuários</li>
              <li>Tentar contornar os sistemas de pagamento da plataforma</li>
              <li>Compartilhar conteúdo ofensivo, discriminatório ou ilegal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo da plataforma BalizaCerta, incluindo marca, logotipo, design, textos e funcionalidades, 
              é protegido por direitos autorais e propriedade intelectual. É proibida a reprodução, distribuição ou 
              uso comercial sem autorização prévia por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Modificações dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações significativas 
              serão comunicadas por e-mail ou notificação na plataforma. O uso continuado após as modificações 
              constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. Legislação Aplicável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será 
              submetida ao foro da comarca de São Paulo/SP, com exclusão de qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: 
              <a href="mailto:contato@balizacerta.com.br" className="text-primary hover:underline ml-1">
                contato@balizacerta.com.br
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermosDeUso;
