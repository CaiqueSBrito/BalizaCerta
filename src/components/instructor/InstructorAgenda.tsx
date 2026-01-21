import { useState, useMemo, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, User, Plus, X, Loader2 } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { format, isSameDay, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  scheduled_date: Date;
  scheduled_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export function InstructorAgenda() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [instructorId, setInstructorId] = useState<string | null>(null);

  // Fetch instructor ID based on profile
  useEffect(() => {
    const fetchInstructorId = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('instructors')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching instructor ID:', error);
        return;
      }

      setInstructorId(data.id);
    };

    fetchInstructorId();
  }, [user]);

  // Fetch lessons from database
  useEffect(() => {
    const fetchLessons = async () => {
      if (!instructorId) return;

      setIsLoading(true);

      try {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            id,
            student_id,
            scheduled_date,
            scheduled_time,
            duration_minutes,
            status,
            notes
          `)
          .eq('instructor_id', instructorId)
          .neq('status', 'cancelled')
          .order('scheduled_date', { ascending: true });

        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError);
          toast.error('Erro ao carregar aulas');
          return;
        }

        // Fetch student names for each lesson
        const lessonsWithStudents: Lesson[] = await Promise.all(
          (lessonsData || []).map(async (lesson) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', lesson.student_id)
              .single();

            return {
              id: lesson.id,
              student_id: lesson.student_id,
              student_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Aluno' : 'Aluno',
              student_avatar: profile?.avatar_url || undefined,
              scheduled_date: parseISO(lesson.scheduled_date),
              scheduled_time: lesson.scheduled_time.slice(0, 5), // Format HH:MM
              duration_minutes: lesson.duration_minutes,
              status: lesson.status as Lesson['status'],
              notes: lesson.notes || undefined,
            };
          })
        );

        setLessons(lessonsWithStudents);
      } catch (error) {
        console.error('Unexpected error fetching lessons:', error);
        toast.error('Erro inesperado ao carregar aulas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [instructorId]);

  // Filter lessons based on selected date
  const filteredLessons = useMemo(() => {
    const now = new Date();
    
    if (selectedDate) {
      // Filter by selected date
      return lessons.filter((lesson) => isSameDay(lesson.scheduled_date, selectedDate));
    }
    
    // No date selected: show all upcoming lessons
    return lessons
      .filter((lesson) => lesson.scheduled_date >= now || isSameDay(lesson.scheduled_date, now))
      .sort((a, b) => a.scheduled_date.getTime() - b.scheduled_date.getTime());
  }, [lessons, selectedDate]);

  // Get dates that have lessons for calendar highlighting
  const datesWithLessons = useMemo(() => {
    return lessons.map((lesson) => lesson.scheduled_date);
  }, [lessons]);

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
    return 'Todas as suas aulas futuras ordenadas por data';
  };

  const getStatusBadge = (status: Lesson['status']) => {
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Card */}
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
              hasLesson: datesWithLessons,
            }}
            modifiersStyles={{
              hasLesson: {
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

      {/* Lessons List Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {getSectionTitle()}
              </CardTitle>
              <CardDescription>{getSectionDescription()}</CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Aula
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLessons.length > 0 ? (
            <div className="space-y-4">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={lesson.student_avatar} alt={lesson.student_name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lesson.student_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{lesson.student_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        <span>
                          {format(lesson.scheduled_date, "EEE, dd 'de' MMM", { locale: ptBR })}
                        </span>
                        <span>•</span>
                        <Clock className="w-4 h-4" />
                        <span>{lesson.scheduled_time}</span>
                        <span>•</span>
                        <span>{lesson.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(lesson.status)}
                    <Button variant="outline" size="sm">
                      Iniciar Aula
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">
                {selectedDate
                  ? 'Nenhuma aula agendada para este dia'
                  : 'Nenhuma aula agendada'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedDate
                  ? 'Este dia está livre. Adicione uma aula!'
                  : 'Você ainda não possui aulas marcadas.'}
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Horário
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
