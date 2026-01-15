import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Quais são os requisitos para me cadastrar como instrutor?',
    answer: 'Para se cadastrar na BalizaCerta, você precisa ser um instrutor de trânsito credenciado pelo DETRAN do seu estado, possuir CNH válida na categoria que pretende ensinar e ter no mínimo 2 anos de experiência como instrutor. Também é necessário apresentar documentos comprobatórios para verificação.',
  },
  {
    question: 'Como funciona o processo de verificação do DETRAN?',
    answer: 'Após o cadastro, nossa equipe analisa seus documentos em até 48 horas. Verificamos sua credencial junto ao DETRAN, CNH, antecedentes e certificações. Após aprovação, você recebe o selo "Credenciado DETRAN" em seu perfil, aumentando a confiança dos alunos.',
  },
  {
    question: 'Posso usar meu próprio veículo para as aulas?',
    answer: 'Sim! Se você possui veículo de autoescola com duplo comando, pode indicar isso no seu perfil. Também é possível dar aulas com o veículo do aluno, desde que esteja em conformidade com as normas do DETRAN. O selo "Possui Veículo" é exibido no seu perfil.',
  },
  {
    question: 'Como recebo os pagamentos das aulas?',
    answer: 'Os pagamentos são processados de forma segura pela plataforma. Após a conclusão de cada aula confirmada pelo aluno, o valor é liberado em sua conta em até 3 dias úteis. Você pode acompanhar todos os seus ganhos pelo painel do instrutor.',
  },
  {
    question: 'Posso cancelar ou mudar de plano a qualquer momento?',
    answer: 'Absolutamente! Você pode fazer upgrade para o plano PRO a qualquer momento para aproveitar os recursos exclusivos. Também é possível voltar ao plano FREE, mas você perderá acesso às ferramentas avançadas como Agenda Fácil, Evolução e Simulado DETRAN.',
  },
  {
    question: 'A plataforma cobra comissão sobre as aulas?',
    answer: 'Não cobramos comissão sobre o valor das aulas. A monetização é feita através dos planos de assinatura. No plano FREE, você tem acesso básico. No plano PRO, você paga uma mensalidade fixa e tem acesso a todos os recursos premium sem comissões adicionais.',
  },
];

const InstructorFAQ = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Tire suas dúvidas sobre como se tornar um instrutor na BalizaCerta
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-card"
              >
                <AccordionTrigger className="text-left text-foreground font-semibold hover:text-accent py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Ainda tem dúvidas?</p>
          <a 
            href="#" 
            className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
          >
            Fale com nosso suporte
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstructorFAQ;
