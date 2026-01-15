import { useNavigate } from 'react-router-dom';
import { Star, BadgeCheck, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstructorCardProps {
  id?: string;
  name: string;
  photo: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  specialties: string[];
  location: string;
  isVerified?: boolean;
  isPro?: boolean;
}

const InstructorCard = ({
  id,
  name,
  photo,
  rating,
  reviewCount,
  pricePerHour,
  specialties,
  location,
  isVerified = false,
  isPro = false,
}: InstructorCardProps) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (id) {
      navigate(`/instrutor/${id}`);
    }
  };

  return (
    <div 
      className={`bg-card rounded-2xl overflow-hidden shadow-card card-hover border h-full flex flex-col cursor-pointer ${
        isPro 
          ? 'border-accent ring-2 ring-accent/20' 
          : 'border-border'
      }`}
      onClick={handleViewProfile}
    >
      {/* Card Header with Photo - Fixed aspect ratio */}
      <div className="relative flex-shrink-0">
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={photo} 
            alt={`Instrutor ${name}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Badges Container */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isPro && (
            <div className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
              <Crown size={14} />
              PRO
            </div>
          )}
          {isVerified && (
            <div className="flex items-center gap-1.5 bg-verified text-verified-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
              <BadgeCheck size={14} />
              DETRAN
            </div>
          )}
        </div>
      </div>

      {/* Card Content - Flex grow to fill space */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Name and Location - Fixed height */}
        <div className="mb-3 min-h-[52px]">
          <h3 className="text-lg font-bold text-foreground line-clamp-1">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{location}</p>
        </div>

        {/* Rating - Fixed height */}
        <div className="flex items-center gap-2 mb-4 h-5">
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
          <span className="text-sm text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Specialties Tags - Fixed height with line-clamp */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[28px] max-h-[60px] overflow-hidden">
          {specialties.slice(0, 3).map((specialty) => (
            <span 
              key={specialty}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium"
            >
              {specialty}
            </span>
          ))}
          {specialties.length > 3 && (
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
              +{specialties.length - 3}
            </span>
          )}
        </div>

        {/* Spacer to push price/CTA to bottom */}
        <div className="flex-grow" />

        {/* Price and CTA - Always at bottom */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div>
            <p className="text-sm text-muted-foreground">A partir de</p>
            <p className="text-xl font-bold text-foreground">
              R$ {pricePerHour}<span className="text-sm font-normal text-muted-foreground">/hora</span>
            </p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile();
            }}
          >
            Ver Perfil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstructorCard;
