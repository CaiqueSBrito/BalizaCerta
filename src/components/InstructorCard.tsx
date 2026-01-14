import { Star, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstructorCardProps {
  name: string;
  photo: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  specialties: string[];
  location: string;
}

const InstructorCard = ({
  name,
  photo,
  rating,
  reviewCount,
  pricePerHour,
  specialties,
  location,
}: InstructorCardProps) => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover border border-border">
      {/* Card Header with Photo */}
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={photo} 
            alt={`Instrutor ${name}`}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Verified Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-verified text-verified-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
          <BadgeCheck size={14} />
          Credenciado DETRAN
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Name and Location */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? 'fill-star text-star' : 'text-muted'}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviewCount} avaliações)</span>
        </div>

        {/* Specialties Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {specialties.map((specialty) => (
            <span 
              key={specialty}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">A partir de</p>
            <p className="text-xl font-bold text-foreground">
              R$ {pricePerHour}<span className="text-sm font-normal text-muted-foreground">/hora</span>
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Ver Perfil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;
