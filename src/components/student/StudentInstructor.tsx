import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Star, Search, UserX, Shield, Award } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectedInstructor {
  id: string;
  instructor_id: string;
  contacted_at: string;
  instructor: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    rating: number;
    is_verified: boolean;
    plan: string;
    specialties: string[];
  } | null;
}

export function StudentInstructor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [connectedInstructors, setConnectedInstructors] = useState<ConnectedInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;

      try {
        // Fetch connections with instructor details via RPC or join
        const { data: connections, error } = await supabase
          .from('connections')
          .select('id, instructor_id, contacted_at')
          .eq('student_id', user.id)
          .order('contacted_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar conexões:', error);
          return;
        }

        // For each connection, fetch instructor public data
        const instructorsData: ConnectedInstructor[] = [];
        
        for (const conn of connections || []) {
          const { data: instructorData } = await supabase.rpc('get_instructor_by_id', {
            p_instructor_id: conn.instructor_id
          });

          if (instructorData && instructorData.length > 0) {
            const inst = instructorData[0];
            instructorsData.push({
              id: conn.id,
              instructor_id: conn.instructor_id,
              contacted_at: conn.contacted_at,
              instructor: {
                first_name: inst.first_name,
                last_name: inst.last_name,
                avatar_url: inst.avatar_url,
                rating: inst.rating,
                is_verified: inst.is_verified,
                plan: inst.plan,
                specialties: inst.specialties || [],
              }
            });
          }
        }

        setConnectedInstructors(instructorsData);
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConnections();
  }, [user]);

  const handleContact = async (instructorId: string) => {
    try {
      const { data: whatsapp } = await supabase.rpc('get_instructor_whatsapp', {
        p_instructor_id: instructorId
      });

      if (whatsapp) {
        const cleanNumber = whatsapp.replace(/\D/g, '');
        const message = encodeURIComponent('Olá! Gostaria de agendar uma aula pelo BalizaCerta.');
        window.open(`https://wa.me/55${cleanNumber}?text=${message}`, '_blank');
      } else {
        toast.error('Não foi possível obter o contato do instrutor');
      }
    } catch (error) {
      console.error('Erro ao obter WhatsApp:', error);
      toast.error('Erro ao contatar instrutor');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meus Instrutores</h1>
          <p className="text-muted-foreground mt-1">Carregando...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meus Instrutores</h1>
        <p className="text-muted-foreground mt-1">
          Instrutores que você já contatou
        </p>
      </div>

      {connectedInstructors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectedInstructors.map((connection) => (
            <Card key={connection.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage 
                      src={connection.instructor?.avatar_url || undefined} 
                      alt={connection.instructor?.first_name || 'Instrutor'} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                      {connection.instructor?.first_name?.charAt(0) || 'I'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">
                        {connection.instructor?.first_name} {connection.instructor?.last_name}
                      </h3>
                      {connection.instructor?.plan === 'pro' && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          PRO
                        </Badge>
                      )}
                      {connection.instructor?.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{connection.instructor?.rating?.toFixed(1) || '0.0'}</span>
                    </div>

                    {connection.instructor?.specialties && connection.instructor.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {connection.instructor.specialties.slice(0, 2).map((spec, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {connection.instructor.specialties.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{connection.instructor.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      Contatado em {new Date(connection.contacted_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/instrutor/${connection.instructor_id}`)}
                  >
                    Ver Perfil
                  </Button>
                  <Button 
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => handleContact(connection.instructor_id)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <UserX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhum instrutor vinculado</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Você ainda não contatou nenhum instrutor. Encontre o instrutor ideal para suas aulas!
              </p>
              <Button 
                onClick={() => navigate('/instrutores')}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Buscar Instrutores
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
