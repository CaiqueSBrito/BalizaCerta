import { ShieldCheck, UserCheck, CalendarCheck } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Pagamento Seguro',
    description: 'Suas transações são protegidas. Pague apenas após confirmar a aula.',
  },
  {
    icon: UserCheck,
    title: 'Instrutores Verificados',
    description: 'Todos os profissionais são credenciados pelo DETRAN e passam por verificação.',
  },
  {
    icon: CalendarCheck,
    title: 'Agendamento Flexível',
    description: 'Escolha o melhor horário para suas aulas, inclusive aos finais de semana.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="como-funciona" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que escolher o BalizaCerta?
          </h2>
          <p className="text-muted-foreground text-lg">
            Facilitamos sua jornada até a aprovação com segurança e praticidade
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="bg-card rounded-2xl p-8 text-center shadow-card card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <feature.icon className="w-8 h-8 text-accent" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
