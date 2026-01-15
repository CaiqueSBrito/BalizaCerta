import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "FREE",
    price: "Grátis",
    description: "Para quem está começando",
    popular: false,
    features: [
      { name: "Exposição na busca", value: "Básica", included: true },
      { name: "Perfil simples", value: "Sem destaque", included: true },
      { name: "Vinculação Aluno/Instrutor", value: true, included: true },
      { name: 'Exibição "Possui Veículo"', value: true, included: true },
      { name: 'Exibição "Tempo de CNH"', value: true, included: true },
      { name: "Agenda Fácil", value: false, included: false },
      { name: "Evolução do Aluno", value: false, included: false },
      { name: "Simulado DETRAN", value: false, included: false },
      { name: "Área de Depoimentos", value: false, included: false },
    ],
  },
  {
    name: "PRO",
    price: "R$ 39",
    period: "/mês",
    description: "Para profissionais de elite",
    popular: true,
    features: [
      { name: "Exposição na busca", value: "Máxima (topo)", included: true, highlight: true },
      { name: "Selo de Perfil em Destaque", value: true, included: true, highlight: true },
      { name: "Vinculação Aluno/Instrutor", value: true, included: true },
      { name: 'Exibição "Possui Veículo"', value: true, included: true },
      { name: 'Exibição "Tempo de CNH"', value: true, included: true },
      { name: "Agenda Fácil", value: true, included: true, highlight: true },
      { name: "Evolução do Aluno", value: true, included: true, highlight: true },
      { name: "Simulado DETRAN", value: true, included: true, highlight: true },
      { name: "Área de Depoimentos", value: true, included: true, highlight: true },
    ],
  },
];

const PricingSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Compare os Planos</h2>
          <p className="text-muted-foreground text-lg">
            Recursos exclusivos para destacar seu perfil e conquistar mais alunos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-accent shadow-[0_0_30px_rgba(234,179,8,0.3)] scale-105"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-accent text-accent-foreground px-4 py-1 text-xs font-bold rounded-bl-lg flex items-center gap-1">
                    <Sparkles size={12} />
                    MAIS POPULAR
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature.name}
                    className={`flex items-start gap-3 ${
                      feature.highlight ? "bg-accent/10 -mx-2 px-2 py-1 rounded-lg" : ""
                    }`}
                  >
                    {feature.included ? (
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          feature.highlight ? "text-accent" : "text-green-500"
                        }`}
                      />
                    ) : (
                      <X className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground/50" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/50"}`}>
                        {feature.name}
                      </span>
                      {typeof feature.value === "string" && (
                        <span
                          className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                            feature.highlight ? "bg-accent/20 text-accent" : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {feature.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full font-semibold ${
                    plan.popular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {plan.popular ? "Começar Agora" : "Criar Conta Grátis"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
