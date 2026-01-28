import { Star, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useReviews } from '@/hooks/useReviews';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReviewsListProps {
  instructorId: string;
  isPro?: boolean;
}

export const ReviewsList = ({ instructorId, isPro = false }: ReviewsListProps) => {
  const { data: reviews, isLoading, error } = useReviews(instructorId);

  if (isLoading) {
    return (
      <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
        <h2 className="text-xl font-bold text-foreground mb-6">Avaliações de Alunos</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-border pb-6 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-16 w-full mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
        <h2 className="text-xl font-bold text-foreground mb-4">Avaliações de Alunos</h2>
        <p className="text-muted-foreground">Erro ao carregar avaliações.</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
        <h2 className="text-xl font-bold text-foreground mb-4">Avaliações de Alunos</h2>
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Este instrutor ainda não possui avaliações.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Seja o primeiro a avaliar após concluir uma aula!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
      <h2 className="text-xl font-bold text-foreground mb-6">
        Avaliações de Alunos ({reviews.length})
      </h2>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="border-b border-border pb-6 last:border-0 last:pb-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {review.student_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{review.student_name}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < review.rating ? 'fill-star text-star' : 'text-muted'}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
