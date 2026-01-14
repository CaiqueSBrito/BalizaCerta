import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const benefits = [
  'Alcance milhares de alunos na sua região',
  'Gerencie sua agenda com facilidade',
  'Receba pagamentos de forma segura',
  'Aumente sua renda mensal',
];

const CTASection = () => {
  return (
    <section id="para-instrutores" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="hero-gradient rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <span className="inline-block bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                  Para Instrutores
                </span>
                
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                  Seja um instrutor parceiro e aumente sua renda
                </h2>
                
                <p className="text-primary-foreground/80 text-lg mb-8">
                  Cadastre-se gratuitamente e comece a receber solicitações de aulas particulares de alunos da sua região.
                </p>

                {/* Benefits List */}
                <ul className="space-y-4 mb-8">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-primary-foreground/90">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base h-14 px-8 shadow-lg hover:shadow-xl transition-all group"
                >
                  Cadastre-se como Instrutor
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '500+', label: 'Instrutores ativos' },
                  { value: '10k+', label: 'Aulas realizadas' },
                  { value: '4.8', label: 'Avaliação média' },
                  { value: '98%', label: 'Satisfação' },
                ].map((stat) => (
                  <div 
                    key={stat.label}
                    className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                  >
                    <p className="text-3xl md:text-4xl font-bold text-accent mb-2">
                      {stat.value}
                    </p>
                    <p className="text-primary-foreground/70 text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
