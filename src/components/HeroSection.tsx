import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Car } from 'lucide-react';

const HeroSection = () => {
  const [searchCity, setSearchCity] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { value: 'cnh-a', label: 'CNH A (Moto)' },
    { value: 'cnh-b', label: 'CNH B (Carro)' },
    { value: 'medo-dirigir', label: 'Medo de Dirigir' },
  ];

  const handleSearch = () => {
    console.log('Buscando:', { searchCity, category });
  };

  return (
    <section className="relative min-h-[90vh] hero-gradient flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary-foreground blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-primary-foreground/90 text-sm font-medium">
              +500 instrutores verificados em todo Brasil
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Encontre o instrutor ideal{' '}
            <span className="text-gradient">para sua aprovação</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Aulas particulares com profissionais credenciados pelo DETRAN 
            para perder o medo e passar na prova prática.
          </p>

          {/* Search Bar */}
          <div className="bg-card rounded-2xl p-2 shadow-hero max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col md:flex-row gap-2">
              {/* City Input */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Digite sua cidade ou bairro..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              {/* Category Select */}
              <div className="relative md:w-56">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-secondary rounded-xl text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                >
                  <option value="">Categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                className="h-14 px-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Search size={20} className="mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <span className="text-primary-foreground/60 text-sm">Populares:</span>
            {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba'].map((city) => (
              <button 
                key={city}
                onClick={() => setSearchCity(city)}
                className="px-4 py-1.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground/90 rounded-full text-sm transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
