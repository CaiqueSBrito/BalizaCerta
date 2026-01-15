import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  BadgeCheck, 
  Crown, 
  MessageCircle, 
  MapPin, 
  Car, 
  Calendar, 
  Clock, 
  CheckCircle2,
  ChevronLeft,
  Shield,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useInstructor, getInstructorWhatsApp } from '@/hooks/useInstructors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Mock reviews - in production these would come from a reviews table
const mockReviews = [
  {
    id: '1',
    author: 'Maria S.',
    rating: 5,
    date: '2025-01-10',
    comment: 'Excelente profissional! Muito paciente e didático. Consegui passar na prova de primeira graças às dicas dele.',
  },
  {
    id: '2',
    author: 'João P.',
    rating: 5,
    date: '2025-01-05',
    comment: 'Recomendo demais! As aulas são muito bem estruturadas e ele sabe exatamente como preparar para a prova do DETRAN.',
  },
  {
    id: '3',
    author: 'Ana C.',
    rating: 4,
    date: '2024-12-28',
    comment: 'Ótima experiência! Me ajudou muito a superar o medo de dirigir. Atendimento pontual e profissional.',
  },
];

const InstructorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: instructor, isLoading, error } = useInstructor(id || '');
  const [isContactLoading, setIsContactLoading] = useState(false);

  const handleWhatsAppContact = async () => {
    if (!instructor) return;

    setIsContactLoading(true);

    try {
      // Get WhatsApp via secure RPC function
      const whatsapp = await getInstructorWhatsApp(instructor.id);
      
      if (!whatsapp) {
        toast({
          title: 'WhatsApp não disponível',
          description: 'Este instrutor ainda não cadastrou seu WhatsApp.',
          variant: 'destructive',
        });
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Register connection in the database
        await supabase.from('connections').insert({
          student_id: user.id,
          instructor_id: instructor.id,
        });
      }

      // Format WhatsApp number
      const phone = whatsapp.replace(/\D/g, '');
      const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
      
      // Create message
      const message = encodeURIComponent(
        `Olá! Encontrei seu perfil no BalizaCerta e gostaria de saber mais sobre suas aulas de direção.`
      );
      
      // Open WhatsApp
      window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank');
    } catch (err) {
      console.error('Error registering connection:', err);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsContactLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Instrutor não encontrado</h1>
            <p className="text-muted-foreground mb-8">O perfil que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => navigate('/instrutores')}>
              Voltar para busca
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isPro = instructor.plan === 'pro';
  const displayName = instructor.first_name && instructor.last_name
    ? `${instructor.first_name} ${instructor.last_name}`
    : 'Instrutor';
  const photoUrl = instructor.avatar_url || '/placeholder.svg';

  // Differentials based on instructor data
  const differentials = [
    instructor.has_vehicle && { icon: Car, text: 'Veículo próprio para aulas' },
    instructor.cnh_years > 5 && { icon: Award, text: `${instructor.cnh_years} anos de experiência` },
    instructor.is_verified && { icon: Shield, text: 'Credenciado pelo DETRAN' },
    isPro && { icon: Crown, text: 'Instrutor Premium' },
  ].filter(Boolean) as { icon: typeof Car; text: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
            Voltar
          </button>
        </div>

        {/* Hero Section */}
        <section className={`py-8 mb-8 ${isPro ? 'bg-gradient-to-r from-accent/10 via-accent/5 to-transparent' : 'bg-secondary/30'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Photo */}
              <div className={`relative flex-shrink-0 ${isPro ? 'ring-4 ring-accent/50 ring-offset-4 ring-offset-background' : ''} rounded-2xl overflow-hidden`}>
                <img 
                  src={photoUrl} 
                  alt={displayName}
                  className="w-48 h-48 md:w-56 md:h-56 object-cover"
                />
                {isPro && (
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg">
                    <Crown size={16} />
                    PRO
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">{displayName}</h1>
                  {instructor.is_verified && (
                    <div className="flex items-center gap-1.5 bg-verified text-verified-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
                      <BadgeCheck size={16} />
                      Credenciado DETRAN
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin size={18} />
                  <span>{instructor.city || 'Brasil'}{instructor.state ? `, ${instructor.state}` : ''}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.floor(instructor.rating || 0) ? 'fill-star text-star' : 'text-muted'}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-foreground">{(instructor.rating || 0).toFixed(1)}</span>
                  <span className="text-muted-foreground">({instructor.review_count || 0} avaliações)</span>
                </div>

                {/* CNH Categories */}
                <div className="flex flex-wrap gap-2">
                  {instructor.cnh_category?.map((cat) => (
                    <span 
                      key={cat}
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        isPro 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      CNH {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio Section */}
              <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
                <h2 className="text-xl font-bold text-foreground mb-4">Sobre o Instrutor</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {instructor.bio || 'Este instrutor ainda não adicionou uma descrição ao seu perfil.'}
                </p>
              </div>

              {/* Differentials */}
              {differentials.length > 0 && (
                <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
                  <h2 className="text-xl font-bold text-foreground mb-4">Diferenciais</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {differentials.map((diff, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                        <div className={`p-2 rounded-lg ${isPro ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary'}`}>
                          <diff.icon size={20} />
                        </div>
                        <span className="text-foreground font-medium">{diff.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialties */}
              {instructor.specialties && instructor.specialties.length > 0 && (
                <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
                  <h2 className="text-xl font-bold text-foreground mb-4">Especialidades</h2>
                  <div className="flex flex-wrap gap-3">
                    {instructor.specialties.map((specialty) => (
                      <span 
                        key={specialty}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-secondary-foreground font-medium"
                      >
                        <CheckCircle2 size={16} className="text-verified" />
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className={`bg-card rounded-2xl p-6 border ${isPro ? 'border-accent/30' : 'border-border'}`}>
                <h2 className="text-xl font-bold text-foreground mb-6">Avaliações de Alunos</h2>
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">{review.author[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{review.author}</p>
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
                          {new Date(review.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className={`bg-card rounded-2xl p-6 border sticky top-28 ${
                isPro 
                  ? 'border-accent shadow-lg shadow-accent/10' 
                  : 'border-border'
              }`}>
                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b border-border">
                  <p className="text-muted-foreground mb-1">Valor da aula</p>
                  <p className="text-4xl font-bold text-foreground">
                    R$ {instructor.price_per_hour || 0}
                    <span className="text-lg font-normal text-muted-foreground">/hora</span>
                  </p>
                </div>

                {/* Quick Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Calendar size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo de CNH</p>
                      <p className="font-semibold text-foreground">{instructor.cnh_years || 0} anos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Clock size={18} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aulas ministradas</p>
                      <p className="font-semibold text-foreground">{(instructor.review_count || 0) * 5}+ aulas</p>
                    </div>
                  </div>
                  {instructor.has_vehicle && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Car size={18} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Veículo</p>
                        <p className="font-semibold text-foreground">Carro próprio</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handleWhatsAppContact}
                  disabled={isContactLoading}
                  className={`w-full h-14 text-lg font-bold gap-2 ${
                    isPro 
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                      : 'bg-verified text-verified-foreground hover:bg-verified/90'
                  }`}
                >
                  <MessageCircle size={22} />
                  {isContactLoading ? 'Abrindo...' : 'Contatar via WhatsApp'}
                </Button>

                {/* Trust indicators */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground">
                    🔒 Contato seguro • Resposta em até 24h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InstructorProfile;
