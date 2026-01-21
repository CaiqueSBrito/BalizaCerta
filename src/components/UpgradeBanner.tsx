import { Crown, Loader2, Sparkles, TrendingUp, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

interface UpgradeBannerProps {
  variant?: 'default' | 'compact';
}

export const UpgradeBanner = ({ variant = 'default' }: UpgradeBannerProps) => {
  const { startCheckout, isLoading } = useStripeCheckout();

  if (variant === 'compact') {
    return (
      <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/30 shadow-lg shadow-accent/10">
        <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Aumente sua visibilidade!</p>
              <p className="text-sm text-muted-foreground">Instrutores Pro recebem até 3x mais contatos.</p>
            </div>
          </div>
          <Button
            onClick={startCheckout}
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Carregando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-accent/15 via-accent/10 to-primary/5 border-accent/40 shadow-xl shadow-accent/10 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Left: Content */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-bold text-foreground">Seja Instrutor Pro</h3>
            </div>
            
            <p className="text-muted-foreground">
              Aumente sua visibilidade e tenha acesso a ferramentas exclusivas para gerenciar seus alunos.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-accent" />
                </div>
                <span className="text-foreground font-medium">Destaque nas buscas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <span className="text-foreground font-medium">Agenda integrada</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent" />
                </div>
                <span className="text-foreground font-medium">Alunos ilimitados</span>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={startCheckout}
              disabled={isLoading}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold shadow-xl px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Carregando...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Fazer Upgrade Agora
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">R$ 49,90/mês • Cancele quando quiser</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
