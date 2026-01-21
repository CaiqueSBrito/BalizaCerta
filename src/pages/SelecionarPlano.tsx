import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Check, 
  X, 
  Crown, 
  Loader2, 
  Star, 
  Calendar, 
  TrendingUp, 
  Users,
  Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Progresso do cadastro
const REGISTRATION_STEPS = [
  { step: 1, label: 'Cadastro', completed: true },
  { step: 2, label: 'Escolha seu Plano', completed: false, current: true },
  { step: 3, label: 'Acessar Painel', completed: false },
];

// Características dos planos
const PLANS = {
  free: {
    name: 'Plano Básico',
    price: 0,
    priceLabel: 'Grátis',
    description: 'Comece agora e seja encontrado por alunos',
    features: [
      { name: 'Perfil público na plataforma', included: true },
      { name: 'Receba contatos via WhatsApp', included: true },
      { name: 'Até 5 alunos conectados', included: true },
      { name: 'Destaque nas buscas', included: false },
      { name: 'Agenda integrada', included: false },
      { name: 'Evolução do aluno', included: false },
      { name: 'Simulado personalizado', included: false },
    ],
    buttonText: 'Começar Grátis',
    isPro: false,
  },
  pro: {
    name: 'Instrutor Pro',
    price: 49.90,
    priceLabel: 'R$ 49,90/mês',
    description: 'Destaque total e ferramentas exclusivas',
    features: [
      { name: 'Perfil público na plataforma', included: true },
      { name: 'Receba contatos via WhatsApp', included: true },
      { name: 'Alunos ilimitados', included: true, highlight: true },
      { name: 'Destaque nas buscas', included: true, highlight: true },
      { name: 'Agenda integrada', included: true, highlight: true },
      { name: 'Evolução do aluno', included: true, highlight: true },
      { name: 'Simulado personalizado', included: true, highlight: true },
    ],
    buttonText: 'Escolher Pro',
    isPro: true,
  },
};

const SelecionarPlano = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      // Verificar se é instrutor e se já selecionou plano
      const { data: instructor, error } = await supabase
        .from('instructors')
        .select('plan_selected_at, plan')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[SelecionarPlano] Erro:', error);
        toast.error('Erro ao carregar dados');
        navigate('/login', { replace: true });
        return;
      }

      // Se não é instrutor, redireciona
      if (!instructor) {
        navigate('/', { replace: true });
        return;
      }

      // Se já selecionou plano, vai pro dashboard
      if (instructor.plan_selected_at) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [user, authLoading, navigate]);

  // Stripe Pro price ID
  const STRIPE_PRO_PRICE_ID = 'price_1Ss8LVHkaUQgqOaK7IA8qPwq';

  const handleSelectPlan = async (planType: 'free' | 'pro') => {
    if (!user) return;

    setIsUpdating(true);

    try {
      if (planType === 'free') {
        // Free plan - update database and redirect
        const { error } = await supabase
          .from('instructors')
          .update({
            plan: 'free',
            plan_selected_at: new Date().toISOString(),
          })
          .eq('profile_id', user.id);

        if (error) {
          console.error('[SelecionarPlano] Erro ao atualizar plano:', error);
          toast.error('Erro ao salvar plano. Tente novamente.');
          return;
        }

        toast.success('Bem-vindo!', {
          description: 'Você começou com o plano básico. Atualize para o Pro quando quiser!',
        });
        navigate('/dashboard', { replace: true });
      } else {
        // Pro plan - create Stripe checkout session
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { priceId: STRIPE_PRO_PRICE_ID },
        });

        if (error) {
          console.error('[SelecionarPlano] Erro ao criar checkout:', error);
          toast.error('Erro ao iniciar pagamento. Tente novamente.');
          return;
        }

        if (data?.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
        } else {
          toast.error('Erro ao gerar link de pagamento.');
        }
      }
    } catch (error) {
      console.error('[SelecionarPlano] Erro:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProModalConfirm = () => {
    setShowProModal(false);
    toast.success('Parabéns! 🎉', {
      description: 'Você agora é um Instrutor Pro!',
    });
    navigate('/dashboard', { replace: true });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-16 md:pt-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Header />
      
      <main className="flex-1 py-12 pt-24 md:pt-28">
        <div className="container mx-auto px-4">
          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-4">
              {REGISTRATION_STEPS.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                        transition-colors
                        ${step.completed 
                          ? 'bg-primary text-primary-foreground' 
                          : step.current 
                            ? 'bg-accent text-accent-foreground ring-4 ring-accent/30' 
                            : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {step.completed && !step.current ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.step
                      )}
                    </div>
                    <span className={`
                      text-xs mt-2 text-center max-w-[80px]
                      ${step.current ? 'text-foreground font-medium' : 'text-muted-foreground'}
                    `}>
                      {step.label}
                    </span>
                  </div>
                  {index < REGISTRATION_STEPS.length - 1 && (
                    <div className={`
                      w-16 md:w-24 h-1 mx-2
                      ${step.completed ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={50} className="h-2" />
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Escolha seu Plano
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Comece gratuitamente ou desbloqueie todo o potencial com o Instrutor Pro
            </p>
          </div>

          {/* Plans Grid */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Free Plan */}
            <Card className="relative border-2 border-border hover:border-primary/50 transition-colors">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {PLANS.free.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {PLANS.free.priceLabel}
                  </span>
                </div>
                <CardDescription className="mt-2">
                  {PLANS.free.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {PLANS.free.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => handleSelectPlan('free')}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {PLANS.free.buttonText}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-accent bg-gradient-to-br from-accent/5 to-accent/10 shadow-lg shadow-accent/20">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground px-4 py-1 text-sm font-semibold shadow-lg">
                  <Crown className="w-4 h-4 mr-1" />
                  Mais Popular
                </Badge>
              </div>

              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent" />
                  {PLANS.pro.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {PLANS.pro.priceLabel}
                  </span>
                </div>
                <CardDescription className="mt-2">
                  {PLANS.pro.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {PLANS.pro.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? 'text-accent' : 'text-primary'}`} />
                      <span className={`text-foreground ${feature.highlight ? 'font-medium' : ''}`}>
                        {feature.name}
                        {feature.highlight && (
                          <Star className="w-3 h-3 inline ml-1 text-accent fill-accent" />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Pro Benefits Icons */}
                <div className="flex justify-center gap-4 py-2">
                  <div className="flex flex-col items-center text-accent">
                    <Calendar className="w-5 h-5" />
                    <span className="text-[10px] mt-1">Agenda</span>
                  </div>
                  <div className="flex flex-col items-center text-accent">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[10px] mt-1">Evolução</span>
                  </div>
                  <div className="flex flex-col items-center text-accent">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] mt-1">Ilimitado</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg"
                  onClick={() => handleSelectPlan('pro')}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Redirecionando...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      {PLANS.pro.buttonText}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer Note */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Você pode alterar seu plano a qualquer momento nas configurações
          </p>
        </div>
      </main>

      {/* Pro Trial Modal */}
      <Dialog open={showProModal} onOpenChange={setShowProModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Crown className="w-8 h-8 text-accent" />
            </div>
            <DialogTitle className="text-2xl">Excelente escolha! 🎉</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Estamos finalizando nossa integração com o Stripe.
              <br /><br />
              <span className="font-semibold text-foreground">
                Você terá 30 dias de Pro grátis
              </span>
              {' '}por ser um dos nossos primeiros instrutores!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              onClick={handleProModalConfirm}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              Acessar meu Painel Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SelecionarPlano;
