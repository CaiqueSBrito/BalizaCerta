import { useState, useMemo, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, User, Search, CalendarX, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ptBR } from 'date-fns/locale';
import { format, isSameDay, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ScheduledClass {
  id: string;
  instructor_id: string;
  instructorName: string;
  instructorAvatar?: string;
  date: Date;
  time: string;
  duration_minutes: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

export function StudentAgenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch lessons from database
  useEffect(() => {
    const fetchLessons = async () => {
      if (!user) return;

      setIsLoading(true);

      try {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            id,
            instructor_id,
            scheduled_date,
            scheduled_time,
            duration_minutes,
            status
          `)
          .eq('student_id', user.id)
          .neq('status', 'cancelled')
          .order('scheduled_date', { ascending: true });

        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError);
          toast.error('Erro ao carregar aulas');
          return;
        }

        // Fetch instructor names for each lesson
        const lessonsWithInstructors: ScheduledClass[] = await Promise.all(
          (lessonsData || []).map(async (lesson) => {
            // Get instructor profile_id first
            const { data: instructor } = await supabase
              .from('instructors')
              .select('profile_id')
              .eq('id', lesson.instructor_id)
              .single();

            let instructorName = 'Instrutor';
            let instructorAvatar: string | undefined;

            if (instructor) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', instructor.profile_id)
                .single();

              if (profile) {
                instructorName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Instrutor';
                instructorAvatar = profile.avatar_url || undefined;
              }
            }

            return {
              id: lesson.id,
              instructor_id: lesson.instructor_id,
              instructorName,
              instructorAvatar,
              date: parseISO(lesson.scheduled_date),
              time: lesson.scheduled_time.slice(0, 5), // Format HH:MM
              duration_minutes: lesson.duration_minutes,
              status: lesson.status as ScheduledClass['status'],
            };
          })
        );

        setClasses(lessonsWithInstructors);
      } catch (error) {
        console.error('Unexpected error fetching lessons:', error);
        toast.error('Erro inesperado ao carregar aulas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [user]);

  // Filter classes based on selected date
  const filteredClasses = useMemo(() => {
    const now = new Date();
    
    if (selectedDate) {
      // Filter by selected date
      return classes.filter((classItem) => isSameDay(classItem.date, selectedDate));
    }
    
    // No date selected: show all upcoming classes
    return classes
      .filter((classItem) => classItem.date >= now || isSameDay(classItem.date, now))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [classes, selectedDate]);

  // Get dates that have classes for calendar highlighting
  const datesWithClasses = useMemo(() => {
    return classes.map((classItem) => classItem.date);
  }, [classes]);

  // Clear date filter
  const handleClearFilter = () => {
    setSelectedDate(undefined);
  };

  // Get section title
  const getSectionTitle = () => {
    if (selectedDate) {
      return `Aulas em ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`;
    }
    return 'Próximas Aulas';
  };

  // Get section description
  const getSectionDescription = () => {
    if (selectedDate) {
      return `Aulas agendadas para ${format(selectedDate, 'EEEE', { locale: ptBR })}`;
    }
    return 'Suas aulas agendadas com instrutores';
  };

  const getStatusBadge = (status: ScheduledClass['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
            Confirmada
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
            Pendente
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
            Concluída
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minha Agenda</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas aulas e horários</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minha Agenda</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas aulas e horários
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Calendário
            </CardTitle>
            <CardDescription>
              Clique em uma data para filtrar as aulas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasClass: datesWithClasses,
              }}
              modifiersStyles={{
                hasClass: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))',
                },
              }}
            />
            
            {selectedDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilter}
                className="w-full gap-2"
              >
                <X className="w-4 h-4" />
                Ver todas as aulas
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Classes List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {getSectionTitle()}
            </CardTitle>
            <CardDescription>
              {getSectionDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredClasses.length > 0 ? (
              <div className="space-y-4">
                {filteredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={classItem.instructorAvatar} alt={classItem.instructorName} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {classItem.instructorName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{classItem.instructorName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {format(classItem.date, "EEE, dd 'de' MMM", { locale: ptBR })}
                          </span>
                          <span>•</span>
                          <Clock className="w-4 h-4" />
                          <span>{classItem.time}</span>
                          <span>•</span>
                          <span>{classItem.duration_minutes} min</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(classItem.status)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarX className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {selectedDate
                    ? 'Nenhuma aula agendada para este dia'
                    : 'Nenhuma aula marcada'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {selectedDate
                    ? 'Você não tem aulas neste dia. Que tal agendar uma?'
                    : 'Você ainda não tem aulas agendadas. Encontre um instrutor e comece sua jornada!'}
                </p>
                <Button 
                  onClick={() => navigate('/instrutores')}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  Buscar Instrutores
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
