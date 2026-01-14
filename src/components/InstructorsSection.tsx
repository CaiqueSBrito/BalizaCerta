import InstructorCard from './InstructorCard';

const instructors = [
  {
    name: 'Carlos Silva',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 127,
    pricePerHour: 80,
    specialties: ['CNH B', 'Medo de Dirigir'],
    location: 'São Paulo, SP',
  },
  {
    name: 'Ana Oliveira',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop&crop=face',
    rating: 4.8,
    reviewCount: 89,
    pricePerHour: 75,
    specialties: ['CNH A', 'CNH B'],
    location: 'Rio de Janeiro, RJ',
  },
  {
    name: 'Roberto Santos',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 156,
    pricePerHour: 90,
    specialties: ['CNH B', 'Baliza'],
    location: 'Belo Horizonte, MG',
  },
];

const InstructorsSection = () => {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {instructors.map((instructor, index) => (
            <div 
              key={instructor.name} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <InstructorCard {...instructor} />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors group">
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
