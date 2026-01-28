import { useState } from 'react';
import { Star, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubmitReview, useCanReview } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ReviewFormProps {
  instructorId: string;
  isPro?: boolean;
}

export const ReviewForm = ({ instructorId, isPro = false }: ReviewFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: eligibility, isLoading: checkingEligibility } = useCanReview(instructorId);
  const { mutate: submitReview, isPending } = useSubmitReview();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    if (comment.length < 10) {
      return;
    }

    submitReview(
      { instructorId, rating, comment },
      {
        onSuccess: () => {
          setRating(0);
          setComment('');
        },
      }
    );
  };

  // Not logged in
  if (!user) {
    return (
      <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
        <h3 className="text-lg font-bold text-foreground mb-4">Deixar Avaliação</h3>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <button 
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              Faça login
            </button>
            {' '}para deixar sua avaliação.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Still checking eligibility
  if (checkingEligibility) {
    return (
      <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
        <h3 className="text-lg font-bold text-foreground mb-4">Deixar Avaliação</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // User cannot review - show reason
  if (!eligibility?.canReview) {
    const reasonMessages: Record<string, string> = {
      not_student: 'Apenas alunos podem avaliar instrutores.',
      already_reviewed: 'Você já avaliou este instrutor.',
      no_completed_lessons: 'Apenas alunos que concluíram aulas com este instrutor podem avaliar.',
      error: 'Não foi possível verificar sua elegibilidade para avaliar.',
    };

    return (
      <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
        <h3 className="text-lg font-bold text-foreground mb-4">Deixar Avaliação</h3>
        <Alert variant="default" className="bg-muted/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {reasonMessages[eligibility?.reason || 'error']}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User can review - show form
  return (
    <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
      <h3 className="text-lg font-bold text-foreground mb-4">Deixar Avaliação</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Sua nota
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-star text-star'
                      : 'text-muted hover:text-star/50'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {rating === 1 && 'Ruim'}
                {rating === 2 && 'Regular'}
                {rating === 3 && 'Bom'}
                {rating === 4 && 'Muito bom'}
                {rating === 5 && 'Excelente'}
              </span>
            )}
          </div>
          {rating === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Clique nas estrelas para avaliar
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Seu comentário
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte como foi sua experiência com este instrutor..."
            className="min-h-[100px] resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            <p className={`text-xs ${comment.length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {comment.length < 10 ? `Mínimo 10 caracteres (${comment.length}/10)` : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              {comment.length}/1000
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={rating === 0 || comment.length < 10 || isPending}
          className="w-full"
        >
          {isPending ? (
            <>Enviando...</>
          ) : (
            <>
              <Send size={16} className="mr-2" />
              Enviar Avaliação
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
