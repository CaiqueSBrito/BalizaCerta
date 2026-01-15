import { Calendar, TrendingUp, ClipboardCheck, Bell, BarChart3, Award } from "lucide-react";

const features = [
  {
    id: "agenda",
    icon: Calendar,
    title: "Agende Suas Aulas",
    subtitle: "Praticidade na palma da mão",
    description:
      "Visualize os horários disponíveis do seu instrutor e agende suas aulas diretamente pelo app. Sem ligações, sem espera.",
    highlights: [
      {
        icon: Bell,
        text: "Receba lembretes antes de cada aula",
      },
      {
        icon: Calendar,
        text: "Remarque com facilidade quando precisar",
      },
    ],
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    id: "evolucao",
    icon: TrendingUp,
    title: "Acompanhe Sua Evolução",
    subtitle: "Veja seu progresso a cada aula",
    description:
      "Tenha acesso ao seu histórico completo de aprendizado. Saiba exatamente o que você já domina e o que ainda precisa praticar.",
    highlights: [
      {
        icon: BarChart3,
        text: "Histórico detalhado de cada aula",
      },
      {
        icon: Award,
        text: "Veja seus pontos fortes e o que melhorar",
      },
    ],
    gradient: "from-green-500/20 to-emerald-500/20",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-500",
  },
  {
    id: "simulado",
    icon: ClipboardCheck,
    title: "Simulado do Exame",
    subtitle: "Chegue preparado para a prova",
    description:
      "Pratique com simulados baseados nos critérios oficiais do DETRAN. Saiba exatamente como será a avaliação real.",
    highlights: [
      {
        icon: ClipboardCheck,
        text: "Critérios idênticos aos do exame oficial",
      },
      {
        icon: TrendingUp,
        text: "Feedback imediato para você corrigir na hora",
      },
    ],
    gradient: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
  },
];

const StudentFeaturesSection = () => {
  return (
    <section id="como-funciona" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Diferenciais Exclusivos</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">Por que usar a BalizaCerta?</h2>
          <p className="text-muted-foreground text-lg">Tecnologia que facilita seu caminho até a CNH</p>
        </div>

        <div className="space-y-20 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`flex flex-col lg:flex-row gap-8 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Icon/Visual Side */}
              <div className={`flex-1 w-full lg:w-auto`}>
                <div className={`bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 md:p-12`}>
                  <div className={`${feature.iconBg} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto`}>
                    <feature.icon className={`w-10 h-10 ${feature.iconColor}`} />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-1">{feature.subtitle}</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">{feature.title}</h3>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>

                <div className="space-y-3 pt-2">
                  {feature.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
                      <div
                        className={`${feature.iconBg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <highlight.icon className={`w-5 h-5 ${feature.iconColor}`} />
                      </div>
                      <span className="text-foreground font-medium">{highlight.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudentFeaturesSection;
