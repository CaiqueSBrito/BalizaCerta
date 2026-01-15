import { MapPin, Car, Filter, Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SearchFiltersProps {
  city: string;
  setCity: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  specialty: string;
  setSpecialty: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  minRating: number;
  setMinRating: (value: number) => void;
  onSearch: () => void;
}

const categories = [
  { value: '', label: 'Todas as Categorias' },
  { value: 'cnh-a', label: 'CNH A (Moto)' },
  { value: 'cnh-b', label: 'CNH B (Carro)' },
  { value: 'cnh-ab', label: 'CNH AB' },
  { value: 'cnh-c', label: 'CNH C' },
  { value: 'cnh-d', label: 'CNH D' },
  { value: 'cnh-e', label: 'CNH E' },
];

const specialties = [
  { value: '', label: 'Todas as Especialidades' },
  { value: 'Medo de Dirigir', label: 'Medo de Dirigir' },
  { value: 'Reciclagem', label: 'Reciclagem' },
  { value: 'Primeira Habilitação', label: 'Primeira Habilitação' },
  { value: 'Direção Defensiva', label: 'Direção Defensiva' },
  { value: 'Aulas Práticas', label: 'Aulas Práticas' },
];

const SearchFilters = ({
  city,
  setCity,
  category,
  setCategory,
  specialty,
  setSpecialty,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  onSearch,
}: SearchFiltersProps) => {
  const hasActiveFilters = specialty || priceRange[0] > 0 || priceRange[1] < 300 || minRating > 0;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-lg border border-border">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* City Input */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Digite sua cidade..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        {/* Category Select */}
        <div className="relative lg:w-48">
          <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-secondary rounded-xl text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          >
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

        {/* Advanced Filters Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`h-12 px-4 rounded-xl gap-2 ${hasActiveFilters ? 'border-accent bg-accent/10' : ''}`}
            >
              <Filter size={18} />
              Filtros
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-accent rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-5">
              <h4 className="font-semibold text-foreground">Filtros Avançados</h4>

              {/* Specialty */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Especialidade</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-10 px-3 bg-secondary rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {specialties.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <DollarSign size={16} />
                  Preço por hora: R$ {priceRange[0]} - R$ {priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={300}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Minimum Rating */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Star size={16} />
                  Avaliação mínima
                </label>
                <div className="flex gap-2">
                  {[0, 3, 3.5, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        minRating === rating
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {rating === 0 ? 'Todas' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setSpecialty('');
                    setPriceRange([0, 300]);
                    setMinRating(0);
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <Button
          onClick={onSearch}
          className="h-12 px-6 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold rounded-xl"
        >
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;
