import { Crown, Loader2, Sparkles, TrendingUp, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

interface WelcomeProModalProps {
  open: boolean;
  onClose: () => void;
  instructorName?: string;
}

export const WelcomeProModal = ({ open, onClose, instructorName }: WelcomeProModalProps) => {
  const { startCheckout, isLoading } = useStripeCheckout();

  const handleUpgrade = async () => {
    await startCheckout();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <DialogTitle className="text-2xl">
            Olá{instructorName ? `, ${instructorName}` : ''}! 👋
          </DialogTitle>
          <DialogDescription className="text-base pt-2 space-y-3">
            <p>Bem-vindo ao BalizaCerta!</p>
            <p className="font-semibold text-foreground">
              Que tal começar com o pé direito?
            </p>
            <p>
              Instrutores Pro recebem <span className="text-accent font-bold">até 3x mais contatos</span> e têm acesso a ferramentas exclusivas.
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-medium">Destaque</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-medium">Agenda</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-medium">Ilimitado</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <Button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Carregando...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Quero ser Pro
              </>
            )}
          </Button>
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Continuar no básico
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
