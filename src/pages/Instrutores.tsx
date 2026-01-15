import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Crown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InstructorCard from '@/components/InstructorCard';
import SearchFilters from '@/components/SearchFilters';
import { useInstructorSearch, useFeaturedInstructors } from '@/hooks/useInstructorSearch';

const InstructorCardSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border animate-pulse">
    <div className="aspect-[4/3] bg-muted" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-6 bg-muted rounded-full w-16" />
        <div className="h-6 bg-muted rounded-full w-20" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="h-8 bg-muted rounded w-20" />
        <div className="h-10 bg-muted rounded w-24" />
      </div>
    </div>
  </div>
);

const Instrutores = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params
  const [city, setCity] = useState(searchParams.get('cidade') || '');
  const [category, setCategory] = useState(searchParams.get('categoria') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('especialidade') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('precoMin')) || 0,
    Number(searchParams.get('precoMax')) || 300,
  ]);
  const [minRating, setMinRating] = useState(Number(searchParams.get('avaliacao')) || 0);

  // Build search filters object
  const filters = useMemo(
    () => ({
      city,
      category,
      specialty,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating,
    }),
    [city, category, specialty, priceRange, minRating]
  );

  const { data: instructors, isLoading, error } = useInstructorSearch(filters);
  const { data: featuredInstructors } = useFeaturedInstructors();

  // Update URL when filters change
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('cidade', city);
    if (category) params.set('categoria', category);
    if (specialty) params.set('especialidade', specialty);
    if (priceRange[0] > 0) params.set('precoMin', priceRange[0].toString());
    if (priceRange[1] < 300) params.set('precoMax', priceRange[1].toString());
    if (minRating > 0) params.set('avaliacao', minRating.toString());
    setSearchParams(params);
  };

  // Auto-search when filters change (debounced effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [city, category, specialty, priceRange, minRating]);

  const hasResults = instructors && instructors.length > 0;
  const showFallback = !isLoading && !hasResults && featuredInstructors && featuredInstructors.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="hero-gradient py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground text-center mb-2">
              Encontre seu Instrutor
            </h1>
            <p className="text-primary-foreground/80 text-center mb-8">
              {instructors ? `${instructors.length} instrutores encontrados` : 'Buscando instrutores...'}
            </p>

            <SearchFilters
              city={city}
              setCity={setCity}
              category={category}
              setCategory={setCategory}
              specialty={specialty}
              setSpecialty={setSpecialty}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              onSearch={handleSearch}
            />
          </div>
        </section>

        {/* Results Section */}
        <section className="container mx-auto px-4 py-12">
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <InstructorCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Erro ao buscar instrutores</h3>
              <p className="text-muted-foreground">Tente novamente mais tarde.</p>
            </div>
          )}

          {/* Results Grid */}
          {hasResults && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {instructors.map((instructor) => (
                <InstructorCard
                  key={instructor.id}
                  id={instructor.id}
                  name={instructor.profiles?.full_name || 'Instrutor'}
                  photo={instructor.profiles?.avatar_url || '/placeholder.svg'}
                  rating={instructor.rating || 0}
                  reviewCount={instructor.review_count || 0}
                  pricePerHour={instructor.price_per_hour || 0}
                  specialties={instructor.specialties || []}
                  location={`${instructor.city || 'Cidade'}${instructor.state ? `, ${instructor.state}` : ''}`}
                  isVerified={instructor.is_verified || false}
                  isPro={instructor.plan === 'pro'}
                />
              ))}
            </div>
          )}

          {/* No Results - Show Fallback */}
          {showFallback && (
            <div className="space-y-8">
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-accent mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ainda não temos instrutores nesta região
                </h3>
                <p className="text-muted-foreground">
                  Mas você pode ver outros profissionais em destaque abaixo
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Crown className="text-accent" size={24} />
                  Instrutores em Destaque
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                  {featuredInstructors.map((instructor) => (
                    <InstructorCard
                      key={instructor.id}
                      id={instructor.id}
                      name={instructor.profiles?.full_name || 'Instrutor'}
                      photo={instructor.profiles?.avatar_url || '/placeholder.svg'}
                      rating={instructor.rating || 0}
                      reviewCount={instructor.review_count || 0}
                      pricePerHour={instructor.price_per_hour || 0}
                      specialties={instructor.specialties || []}
                      location={`${instructor.city || 'Cidade'}${instructor.state ? `, ${instructor.state}` : ''}`}
                      isVerified={instructor.is_verified || false}
                      isPro={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Results and No Fallback */}
          {!isLoading && !hasResults && !showFallback && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum instrutor encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente ajustar seus filtros de busca.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Instrutores;
