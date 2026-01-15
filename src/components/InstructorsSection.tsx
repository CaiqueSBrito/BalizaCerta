import { useNavigate } from 'react-router-dom';
import InstructorCard from './InstructorCard';
import { useInstructors } from '@/hooks/useInstructors';
import { Skeleton } from '@/components/ui/skeleton';

// Dados de fallback caso não haja instrutores no banco
const fallbackInstructors = [
  {
    id: 'fallback-1',
    name: 'Carlos Silva',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 127,
    pricePerHour: 80,
    specialties: ['CNH B', 'Medo de Dirigir'],
    location: 'São Paulo, SP',
    isVerified: true,
  },
  {
    id: 'fallback-2',
    name: 'Ana Oliveira',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop&crop=face',
    rating: 4.8,
    reviewCount: 89,
    pricePerHour: 75,
    specialties: ['CNH A', 'CNH B'],
    location: 'Rio de Janeiro, RJ',
    isVerified: true,
  },
  {
    id: 'fallback-3',
    name: 'Roberto Santos',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 156,
    pricePerHour: 90,
    specialties: ['CNH B', 'Baliza'],
    location: 'Belo Horizonte, MG',
    isVerified: true,
  },
];

const InstructorCardSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-5 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  </div>
);

const InstructorsSection = () => {
  const navigate = useNavigate();
  const { data: instructors, isLoading, error } = useInstructors(6);

  // Mapear dados do Supabase para o formato do card
  const mappedInstructors = instructors?.map((instructor) => {
    const firstName = instructor.profiles?.first_name || '';
    const lastName = instructor.profiles?.last_name || '';
    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : instructor.profiles?.full_name || 'Instrutor';
    
    return {
      id: instructor.id,
      name: displayName,
      photo: instructor.profiles?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
      rating: Number(instructor.rating) || 0,
      reviewCount: instructor.review_count || 0,
      pricePerHour: Number(instructor.price_per_hour) || 0,
      specialties: instructor.specialties || [],
      location: instructor.city && instructor.state 
        ? `${instructor.city}, ${instructor.state}` 
        : 'Brasil',
      isVerified: instructor.is_verified || false,
      isPro: instructor.plan === 'pro',
    };
  });

  // Usar dados de fallback se não houver instrutores
  const displayInstructors = mappedInstructors && mappedInstructors.length > 0 
    ? mappedInstructors 
    : fallbackInstructors;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Instrutores em Destaque
          </h2>
          <p className="text-muted-foreground text-lg">
            Profissionais altamente avaliados e prontos para ajudar você a conquistar sua habilitação
          </p>
        </div>

        {/* Instructors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto auto-rows-fr">
          {isLoading ? (
            // Loading skeletons
            [...Array(3)].map((_, index) => (
              <InstructorCardSkeleton key={index} />
            ))
          ) : error ? (
            // Em caso de erro, mostrar fallback
            fallbackInstructors.map((instructor, index) => (
              <div 
                key={instructor.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <InstructorCard {...instructor} />
              </div>
            ))
          ) : (
            // Dados reais ou fallback
            displayInstructors.map((instructor, index) => (
              <div 
                key={instructor.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <InstructorCard {...instructor} />
              </div>
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/instrutores')}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors group"
          >
            Ver todos os instrutores
            <svg 
              className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default InstructorsSection;
